"use server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { syncVehicleToA3 } from "@/lib/a3-sync";
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

  try {
    const coche = await prisma.coches.findUnique({
      where: { matricula: matricula },
      select: { id: true, matricula: true, ubicacion: { select: { nombreA3: true } } },
    });

    if (!coche) {
      return { error: `Coche con matrícula ${matricula} no encontrado.` };
    }

    // Sincronizar con A3 usando el módulo central
    const result = await syncVehicleToA3(
      coche.matricula,
      coche.ubicacion?.nombreA3,
      '[FORCE_A3_ACTION]'
    );

    if (result.success) {
      await prisma.coches.update({
        where: { id: coche.id },
        data: { pendienteA3: false, numeroReintentosA3: 0 },
      });
      console.log(`[FORCE_A3_ACTION]: Matrícula ${coche.matricula} marcada como sincronizada en BD.`);
    }
    
    revalidatePath("/dashboard");
    return { 
      message: `Intento de actualización para ${matricula} procesado.`,
      a3_call_successful: result.success,
      a3_status: result.status,
      a3_response_body: result.responseBody
    };

  } catch (error) {
    console.error(`[FORCE_A3_ACTION]: Error para ${matricula}: ${error.message}`);
    return { 
      error: error.message || "Error desconocido",
      a3_call_successful: false
    };
  }
}
