"use server";

// Se utiliza en el botón de eliminar ubicación dentro de ubicaciones
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const eliminarUbicacion = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const data = {
    id: fila.id,
  };
  try {
    if (data.id == 1) {
      return {
        message: "No se puede eliminar este registro (Sin Ubicación)",
        error: true,
      };
    }
    // Muevo los registros de los coches a Sin Ubicación
    const nuevaUbicacionId = 1; // ID de la nueva ubicación
    await prisma.coches.updateMany({
      where: { idUbicacion: parseInt(data.id) },
      data: { idUbicacion: nuevaUbicacionId },
    });
    await prisma.historialUbicaciones.updateMany({
      where: { idUbicacion: parseInt(data.id) },
      data: { idUbicacion: 1 }, //Pongo Sin ubicación
    });
    //borro los registros
    const ubicaciones = await prisma.ubicaciones.delete({
      where: {
        id: data.id,
      },
    });
    revalidatePath("/dashboard/ubicaciones");
    revalidatePath("/dashboard");
    return {
      message: "Eliminado correctamente.",
    };
  } catch (error) {
    return {
      message: "Hubo un error al eliminar",
      error: true,
    };
  }
};
