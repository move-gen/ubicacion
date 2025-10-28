// src/app/api/debug/force-a3-update/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"; // Para protegerla
import { fetchWithTimeout, retry } from "@/lib/api-utils"; // Importar utilidades

// Las funciones fetchWithTimeout y retry se han movido a @/lib/api-utils.js
// y se importan arriba.

export async function GET(request) {
  const { isAuthenticated, getPermission } = getKindeServerSession();

  // Protección: Solo usuarios autenticados.
  // Si quieres más seguridad, puedes crear un permiso en Kinde como "debug:a3_update" 
  // y asignarlo a tu usuario admin, luego descomentar y usar getPermission.
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  // const permission = await getPermission("debug:a3_update"); 
  // if (!permission || !permission.isGranted) {
  //   return NextResponse.json({ error: "No autorizado para esta acción de depuración" }, { status: 403 });
  // }

  const matricula = request.nextUrl.searchParams.get("matricula");
  if (!matricula) {
    return NextResponse.json({ error: "Parámetro 'matricula' es requerido" }, { status: 400 });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[DEBUG_A3_UPDATE] API_KEY de A3 no configurada.");
    return NextResponse.json({ error: "Configuración del servidor incompleta (API_KEY A3)" }, { status: 500 });
  }

  try {
    const coche = await prisma.coches.findUnique({
      where: { matricula: matricula },
      select: { id: true, matricula: true, pendienteA3: true, lastA3SyncAttempt: true, ubicacion: { select: { nombreA3: true } } },
    });

    if (!coche) {
      return NextResponse.json({ error: `Coche con matrícula ${matricula} no encontrado.` }, { status: 404 });
    }
    
    const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';
    console.log(`[DEBUG_A3_UPDATE]: Forzando actualización A3 para matrícula: ${coche.matricula}`);
    const url = `${A3_API_URL}/api/articulo/${coche.matricula}`;
    const body = { Caracteristica1: coche.ubicacion?.nombreA3 };
    
    console.log(`[DEBUG_A3_UPDATE]: Enviando a A3 para ${coche.matricula}: URL=${url}, Body=${JSON.stringify(body)}`);

    // ✅ IMPROVED: Actualizar timestamp antes del intento
    await prisma.coches.update({
      where: { id: coche.id },
      data: { lastA3SyncAttempt: new Date() },
    });

    let a3ResponseStatus = 0;
    let a3ResponseBody = "";
    let a3CallSuccessful = false;

    await retry(async () => {
      const response = await fetchWithTimeout(url, { // Usar la función importada
        method: "PUT",
        headers: { APIKEY: apiKey, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      a3ResponseStatus = response.status;
      try {
        const clonedResponse = response.clone();
        a3ResponseBody = await clonedResponse.text();
        if (!a3ResponseBody) a3ResponseBody = "El cuerpo de la respuesta de error de A3 está vacío.";
      } catch (e) {
        a3ResponseBody = "No se pudo leer el cuerpo de la respuesta de A3.";
        console.warn("[DEBUG_A3_UPDATE]: Advertencia: No se pudo leer el cuerpo de la respuesta de A3.", e.message);
      }

      if (!response.ok) {
        throw new Error(`Error API A3. Status: ${a3ResponseStatus}. A3 Response: ${a3ResponseBody}`);
      }
      a3CallSuccessful = true; // Marcar como exitosa si no lanzó error
      console.log(`[DEBUG_A3_UPDATE]: Llamada PUT a A3 para ${coche.matricula} fue exitosa (status ${a3ResponseStatus}). A3 Response: ${a3ResponseBody}`);
    }, undefined, `DEBUG_A3_UPDATE_${matricula}`); // ✅ IMPROVED: Añadir nombre de función para logs

    // Solo actualiza la BD local si la llamada a A3 fue exitosa
    if (a3CallSuccessful) {
      await prisma.coches.update({
        where: { id: coche.id },
        data: { pendienteA3: false, numeroReintentosA3: 0 },
      });
      console.log(`[DEBUG_A3_UPDATE]: Matrícula ${coche.matricula} marcada como sincronizada en BD local.`);
    }
    
    return NextResponse.json({ 
      message: `Intento de actualización para ${matricula} procesado.`,
      a3_call_successful: a3CallSuccessful,
      a3_status: a3ResponseStatus,
      a3_response_body: a3ResponseBody 
    });

  } catch (error) {
    console.error(`[DEBUG_A3_UPDATE]: Error forzando actualización A3 para ${matricula}: ${error.message}`);
    return NextResponse.json({ 
      error: `Error para ${matricula}: ${error.message}`,
      a3_call_successful: false, // Asegurarse de que se devuelve en caso de error también
      a3_status: a3ResponseStatus || 0, // Puede ser útil incluso si la lógica de reintento falló
      a3_response_body: a3ResponseBody || 'No disponible'
    }, { status: 500 });
  }
}
