"use server";

// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const pedirVehiculoAction = async (formData, ubicacion, matricula) => {
  const { getUser, isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const user = await getUser();

  try {
    const vehiculo = await prisma.coches.findUnique({
      where: {
        matricula: matricula,
      },
      select: {
        id: true,
        idUbicacion: true,
      },
    });

    const data = {
      idCoche: vehiculo.id,
      idUbicacion: vehiculo.idUbicacion,
      idUbicacionFinalDestino: parseInt(ubicacion),
      usuarioAsignado: user?.given_name + " " + user?.family_name,
      estado: "PTE_PREPARAR",
    };

    if (vehiculo.idUbicacion === parseInt(ubicacion)) {
      return {
        message: "El vehículo ya se encuentra en esa ubicación.",
        error: true,
      };
    }
    const pedirVehiculo = await prisma.vehiculosEnvio.create({
      data: data,
    });
    const pedirVehiculoDashboard = await prisma.coches.update({
      where: {
        id: vehiculo.id,
      },
      data: {
        vendidoLogistica: true,
      },
    });
    revalidatePath("/listado-vehiculos");
    revalidatePath("/pedir-vehiculo");
    revalidatePath("/dashboard");
    return {
      message: "Vehículo solicitado exitosamente",
    };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Vehículo ya solicitado, consulte con logística",
          error: true,
        };
      }
    }
    return { message: "Error al solicitar vehículo.", error: true };
  }
};
