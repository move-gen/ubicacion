"use server";

// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const eliminarCocheListado = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  try {
    const vehiculo = await prisma.vehiculosEnvio.delete({
      where: {
        id: fila.id,
      },
    });
    const marcarVendidoLogistica = await prisma.coches.update({
      where: {
        matricula: fila.coche.matricula,
      },
      data: {
        vendidoLogistica: false,
      },
    });
    revalidatePath("/listado-vehiculos");
    revalidatePath("/pedir-vehiculo");
    return {
      message: "Vehículo eliminado correctamente.",
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Error al eliminar" + error,
      error: true,
    };
  }
};
