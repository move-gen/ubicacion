"use server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { fetchWithTimeout, retry } from "@/lib/api-utils";
import { revalidatePath } from "next/cache";

const BATCH_SIZE_A3_SYNC = 5; // Número de coches a procesar por llamada

export async function syncAllPendingA3Updates() {
  const { isAuthenticated, getPermission } = getKindeServerSession();

  if (!(await isAuthenticated())) {
    console.warn("[SYNC_ALL_A3] Intento no autenticado.");
    return { error: "No autorizado. Debes iniciar sesión." };
  }
  // Ejemplo de permiso específico (descomentar y configurar en Kinde si se desea):
  // const permission = await getPermission("dashboard:sync_all_a3");
  // if (!permission || !permission.isGranted) {
  //   return { error: "No tienes permiso para esta acción." };
  // }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[SYNC_ALL_A3] API_KEY de A3 no configurada.");
    return { error: "Error de configuración del servidor (A3_KEY)." };
  }

  let cochesProcesados = 0;
  let cochesExitosos = 0;
  let cochesFallidos = 0;
  const erroresDetallados = [];

  try {
    const cochesParaActualizar = await prisma.coches.findMany({
      where: { actualizadoA3: true },
      take: BATCH_SIZE_A3_SYNC, // Procesar solo un lote
      select: { id: true, matricula: true, ubicacion: { select: { nombreA3: true } } },
    });

    if (cochesParaActualizar.length === 0) {
      return { message: "No hay coches pendientes de sincronización con A3.", coches_procesados: 0, exitosos: 0, fallidos: 0, errores: [] };
    }

    console.log(`[SYNC_ALL_A3] Iniciando sincronización para ${cochesParaActualizar.length} coches.`);

    for (const coche of cochesParaActualizar) {
      cochesProcesados++;
      try {
        console.log(`[SYNC_ALL_A3] Procesando matrícula: ${coche.matricula}`);
        const url = `http://212.64.162.34:8080/api/articulo/${coche.matricula}`;
        const body = { Caracteristica1: coche.ubicacion?.nombreA3 };
        
        console.log(`[SYNC_ALL_A3] Enviando a A3 para ${coche.matricula}: URL=${url}, Body=${JSON.stringify(body)}`);

        let a3CallSuccessful = false;
        let a3ResponseStatus = 0;
        let a3ResponseBody = "";

        await retry(async () => {
          const response = await fetchWithTimeout(url, {
            method: "PUT",
            headers: { APIKEY: apiKey, "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          a3ResponseStatus = response.status;
          try {
            const clonedResponse = response.clone();
            a3ResponseBody = await clonedResponse.text();
            if (!a3ResponseBody) a3ResponseBody = "Respuesta de A3 vacía.";
          } catch (e) { 
            a3ResponseBody = "No se pudo leer respuesta de A3.";
            console.warn("[SYNC_ALL_A3]: Advertencia: No se pudo leer el cuerpo de la respuesta de A3.", e.message);
          }

          if (!response.ok) {
            throw new Error(`Error API A3. Status: ${a3ResponseStatus}. Resp: ${a3ResponseBody}`);
          }
          a3CallSuccessful = true;
          console.log(`[SYNC_ALL_A3]: PUT a A3 para ${coche.matricula} OK (Status ${a3ResponseStatus}). Resp: ${a3ResponseBody}`);
        }, 2, `syncAllA3_A3Call_${coche.matricula}`);

        if (a3CallSuccessful) {
          await prisma.coches.update({
            where: { id: coche.id },
            data: { actualizadoA3: false, numeroReintentosA3: 0 },
          });
          console.log(`[SYNC_ALL_A3]: Matrícula ${coche.matricula} marcada como actualizada en BD.`);
          cochesExitosos++;
        } else {
          // Esto no debería ocurrir si retry lanza error, pero por si acaso
          cochesFallidos++;
          erroresDetallados.push({ matricula: coche.matricula, error: "La llamada a A3 no fue exitosa pero no lanzó excepción en retry."});
        }
      } catch (error) {
        cochesFallidos++;
        const errorMessage = error.message || "Error desconocido procesando coche.";
        console.error(`[SYNC_ALL_A3]: Error para ${coche.matricula}: ${errorMessage}`);
        erroresDetallados.push({ matricula: coche.matricula, error: errorMessage });
        // Opcional: Incrementar numeroReintentosA3 en la BD para este coche
        await prisma.coches.update({
            where: { id: coche.id },
            data: { numeroReintentosA3: { increment: 1 } },
        });
      }
    }

    const aunQuedanPendientes = await prisma.coches.count({ where: { actualizadoA3: true } });

    revalidatePath("/dashboard");
    return { 
      message: `Sincronización completada. Procesados: ${cochesProcesados}. Exitosos: ${cochesExitosos}. Fallidos: ${cochesFallidos}.`,
      coches_procesados: cochesProcesados,
      exitosos: cochesExitosos,
      fallidos: cochesFallidos,
      errores: erroresDetallados,
      quedan_pendientes: aunQuedanPendientes
    };

  } catch (error) {
    console.error(`[SYNC_ALL_A3]: Error general en la acción: ${error.message}`);
    return { 
        error: `Error general: ${error.message}`,
        coches_procesados: cochesProcesados,
        exitosos: cochesExitosos,
        fallidos: cochesFallidos,
        errores: erroresDetallados
    };
  }
}
