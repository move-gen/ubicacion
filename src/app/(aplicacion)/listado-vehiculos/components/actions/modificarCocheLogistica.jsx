"use server";

// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const modificarCocheLogistica = async (
  formData,
  fila,
  estado,
  observaciones,
  fechaFinalizacion
) => {
  if (estado === "ENVIADO") {
  }

  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  try {
    const updateData = {
      estado: estado,
      observaciones: observaciones,
      fechaEstimadaDestino: estado === "ENVIADO" ? fechaFinalizacion : null,
    };
    const actualizar = await prisma.vehiculosEnvio.update({
      where: {
        id: fila.id,
      },
      data: updateData,
    });

    revalidatePath("/listado-vehiculos");
    return {
      message: "Datos actualizados correctamente.",
    };
  } catch (error) {
    return {
      message: "Error al actualizar",
      error: true,
    };
  }
};
