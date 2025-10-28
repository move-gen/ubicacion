"use server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { syncVehicleToA3 } from "@/lib/a3-sync";
import { revalidatePath } from "next/cache";

const BATCH_SIZE_A3_SYNC = 5; // Aumentado a 5 con el módulo unificado

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

  let cochesProcesados = 0;
  let cochesExitosos = 0;
  let cochesFallidos = 0;
  const erroresDetallados = [];

  try {
    const cochesParaActualizar = await prisma.coches.findMany({
      where: { pendienteA3: true },
      take: BATCH_SIZE_A3_SYNC, // Procesar solo un lote
      select: { id: true, matricula: true, lastA3SyncAttempt: true, ubicacion: { select: { nombreA3: true } } },
    });

    if (cochesParaActualizar.length === 0) {
      return { message: "No hay coches pendientes de sincronización con A3.", coches_procesados: 0, exitosos: 0, fallidos: 0, errores: [] };
    }

    console.log(`[SYNC_ALL_A3] Iniciando sincronización para ${cochesParaActualizar.length} coches.`);

    for (const coche of cochesParaActualizar) {
      cochesProcesados++;
      
      try {
        // ✅ IMPROVED: Actualizar timestamp antes del intento
        await prisma.coches.update({
          where: { id: coche.id },
          data: { lastA3SyncAttempt: new Date() },
        });

        // Sincronizar con A3 usando el módulo central
        const result = await syncVehicleToA3(
          coche.matricula,
          coche.ubicacion?.nombreA3,
          '[SYNC_ALL_A3]',
          coche.lastA3SyncAttempt,
          false // Respetar intervalo mínimo
        );

        if (result.skipped) {
          // ✅ NEW: Manejar caso de reintento demasiado pronto
          console.log(`[SYNC_ALL_A3] Coche ${coche.matricula} omitido: ${result.error}`);
          cochesProcesados--; // No contar como procesado
          continue;
        }

        if (result.success) {
          await prisma.coches.update({
            where: { id: coche.id },
            data: { pendienteA3: false, numeroReintentosA3: 0 },
          });
          console.log(`[SYNC_ALL_A3]: Matrícula ${coche.matricula} marcada como sincronizada en BD.`);
          cochesExitosos++;
        } else {
          cochesFallidos++;
          erroresDetallados.push({ matricula: coche.matricula, error: result.error });
          await prisma.coches.update({
            where: { id: coche.id },
            data: { numeroReintentosA3: { increment: 1 } },
          });
        }
      } catch (error) {
        cochesFallidos++;
        const errorMessage = error.message || "Error desconocido procesando coche";
        console.error(`[SYNC_ALL_A3]: Error para ${coche.matricula}: ${errorMessage}`);
        erroresDetallados.push({ matricula: coche.matricula, error: errorMessage });
        await prisma.coches.update({
          where: { id: coche.id },
          data: { numeroReintentosA3: { increment: 1 } },
        });
      }
    }

    const aunQuedanPendientes = await prisma.coches.count({ where: { pendienteA3: true } });

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
