"use server";

// Se utiliza en el botón de modificar ubicación dentro de ubicaciones
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const modificarUbicacion = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const nombre = formData.get("nombre").trim();
  const nombreAMostrar = formData.get("nombreAMostrar").trim();
  const latitud = formData.get("latitud");
  const longitud = formData.get("longitud");
  const nombreA3 = formData.get("nombreA3");
  const agenteExterno = formData.get("agenteExterno") === "on" ? true : false;
  const data = {
    id: fila.id,
    nombreAMostrar: nombreAMostrar ? nombreAMostrar : fila.nombreAMostrar,
    nombre: nombre ? nombre : fila.nombre,
    latitud: parseFloat(latitud ? latitud : fila.latitud),
    longitud: parseFloat(longitud ? longitud : fila.longitud),
    agenteExterno: Boolean(agenteExterno),
    nombreA3: nombreA3 ? nombreA3 : fila.nombreA3,
  };

  try {
    if (!data.latitud.toString().includes(".")) {
      throw new Error("La latitud debe contener al menos un punto decimal.");
    }
    if (!data.longitud.toString().includes(".")) {
      throw new Error("La longitud debe contener al menos un punto decimal.");
    }
  } catch (e) {
    return { message: e.message, error: true };
  }
  try {
    if (data.id === 1 && agenteExterno === true) {
      return {
        message: "No se puede modificar Agente Externo",
        error: true,
      };
    }
    const ubicaciones = await prisma.ubicaciones.update({
      where: {
        id: data.id,
      },
      data: {
        nombre: data.nombre,
        nombreAMostrar: data.nombreAMostrar,
        latitud: data.latitud,
        longitud: data.longitud,
        agenteExterno: data.agenteExterno,
        nombreA3: data.nombreA3,
      },
    });

    revalidatePath("/dashboard/ubicaciones");
    revalidatePath("/dashboard");
    return {
      message: "Datos actualizados correctamente.",
    };
  } catch (error) {
    return { message: "Error al actualizar", error: true };
  }
};
