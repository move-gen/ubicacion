"use server";

// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const eliminarCoche = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  try {
    // Intentar eliminar el coche en vehiculosenvio si existe
    try {
      await prisma.vehiculosEnvio.delete({
        where: {
          idCoche: fila.id,
        },
      });
    } catch (error) {
      console.log(
        "No se encontró el registro de vehiculosEnvio, continuando..."
      );
    }

    // Intentar eliminar el historial de ubicaciones si existe
    try {
      await prisma.historialUbicaciones.deleteMany({
        where: {
          idCoche: fila.id,
        },
      });
    } catch (error) {
      console.log(
        "No se encontraron ubicaciones para eliminar, continuando... coche:"
      );
    }

    // Intentar eliminar el coche principal
    try {
      await prisma.coches.delete({
        where: {
          id: fila.id,
        },
      });
    } catch (error) {
      console.log(
        "No se encontró el coche para eliminar, puede que ya haya sido eliminado."
      );
      throw error; // Lanzar el error si el coche no se encuentra
    }

    // Revalidar la ruta del dashboard
    revalidatePath("/dashboard");
    console.log("vehículo:", fila.id, "eliminado");
    return {
      message: "Coche eliminado exitosamente",
    };
  } catch (error) {
    console.error("Error durante la eliminación: ", error, "coche: ", fila.id);
    return {
      message: "Error al eliminar: ",
      error: true,
    };
  }
};
