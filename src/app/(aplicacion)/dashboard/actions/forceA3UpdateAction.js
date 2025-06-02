"use server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { fetchWithTimeout, retry } from "@/lib/api-utils"; // Importar desde el nuevo archivo
import { revalidatePath } from "next/cache";

export async function forceA3UpdateForCar(matricula) {
  const { isAuthenticated, getPermission } = getKindeServerSession();

  // Protección: Solo usuarios autenticados.
  // Si se necesita un permiso específico, se puede añadir aquí.
  // Ejemplo:
  // const permission = await getPermission("dashboard:force_a3_update");
  // if (!(await isAuthenticated()) || (permission && !permission.isGranted)) {
  if (!(await isAuthenticated())) {
    console.warn("[FORCE_A3_ACTION] Intento no autenticado.");
    return { error: "No autorizado. Debes iniciar sesión." };
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[FORCE_A3_ACTION] API_KEY de A3 no configurada.");
    return { error: "Error de configuración del servidor (A3_KEY)." };
  }

  let coche;
  try {
    coche = await prisma.coches.findUnique({
      where: { matricula: matricula },
      select: { id: true, matricula: true, ubicacion: { select: { nombreA3: true } } },
    });

    if (!coche) {
      return { error: `Coche con matrícula ${matricula} no encontrado.` };
    }

    console.log(`[FORCE_A3_ACTION]: Iniciando actualización A3 para matrícula: ${coche.matricula}`);
    const url = `http://212.64.162.34:8080/api/articulo/${coche.matricula}`;
    const body = { Caracteristica1: coche.ubicacion?.nombreA3 };
    
    console.log(`[FORCE_A3_ACTION]: Enviando a A3 para ${coche.matricula}: URL=${url}, Body=${JSON.stringify(body)}`);

    let a3ResponseStatus = 0;
    let a3ResponseBody = "";
    let a3CallSuccessful = false;

    // Usar el nombre de la función en el log de retry
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
        console.warn("[FORCE_A3_ACTION]: Advertencia: No se pudo leer el cuerpo de la respuesta de A3.", e.message);
      }

      if (!response.ok) {
        throw new Error(`Error API A3. Status: ${a3ResponseStatus}. Resp: ${a3ResponseBody}`);
      }
      a3CallSuccessful = true;
      console.log(`[FORCE_A3_ACTION]: PUT a A3 para ${coche.matricula} OK (Status ${a3ResponseStatus}). Resp: ${a3ResponseBody}`);
    }, 2, 'forceA3UpdateForCar_A3Call'); // Nombre de función para el log de retry

    if (a3CallSuccessful) {
      await prisma.coches.update({
        where: { id: coche.id },
        data: { actualizadoA3: false, numeroReintentosA3: 0 },
      });
      console.log(`[FORCE_A3_ACTION]: Matrícula ${coche.matricula} marcada como actualizada en BD.`);
    }
    
    revalidatePath("/dashboard"); // Revalidar la página del dashboard
    return { 
      message: `Intento de actualización para ${matricula} procesado.`,
      a3_call_successful: a3CallSuccessful,
      a3_status: a3ResponseStatus,
      a3_response_body: a3ResponseBody 
    };

  } catch (error) {
    console.error(`[FORCE_A3_ACTION]: Error para ${matricula}: ${error.message}`);
    // Devolver el cuerpo de la respuesta de A3 si está disponible en el error
    const errorMessage = error.message || "Error desconocido.";
    return { 
        error: errorMessage,
        a3_call_successful: false, 
        // Si el error ya contiene el status y body de A3 (como lo hace nuestro throw personalizado),
        // no necesitamos pasarlos de nuevo explícitamente aquí a menos que los extraigamos del mensaje.
        // Por simplicidad, solo devolvemos el mensaje de error.
    };
  }
}
