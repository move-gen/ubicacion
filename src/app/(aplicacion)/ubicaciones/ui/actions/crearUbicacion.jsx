"use server";

// Se utiliza en el botón de añadir ubicación dentro de ubicaciones
import prisma from "@/lib/db";
import haversine from "haversine-distance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const crearUbicacion = async (formData) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const nombre = formData.get("nombre").trim();
  const nombreAMostrar = formData.get("nombreAMostrar").trim();
  const latitud = formData.get("latitud");
  const longitud = formData.get("longitud");

  const agenteExterno = formData.get("agenteExterno");
  const nombreA3 = formData.get("nombreA3");
  const isAgenteExterno = agenteExterno ? true : false;
  try {
    if (!latitud.includes(".")) {
      throw new Error("La latitud debe contener al menos un punto decimal.");
    }
    if (!longitud.includes(".")) {
      throw new Error("La longitud debe contener al menos un punto decimal.");
    }
  } catch (e) {
    return { message: e.message, error: true };
  }
  try {
    const threshold = 10; // Umbral de distancia de 10m

    // Cojo todas las ubicaciones
    const ubicaciones = await prisma.ubicaciones.findMany();
    const target = {
      latitude: parseFloat(latitud),
      longitude: parseFloat(longitud),
    };
    const nearbyLocations = ubicaciones.filter((ubicacion) => {
      const lat = parseFloat(ubicacion.latitud);
      const lon = parseFloat(ubicacion.longitud);

      // Crear el objeto con la ubicación actual
      const ubicacionBBDD = { latitude: lat, longitude: lon };

      const distance = haversine(ubicacionBBDD, target);
      return distance <= threshold;
    });
    const ubicacionCercana = nearbyLocations.every((element) => !element);
    if (!ubicacionCercana) {
      return {
        message:
          "Ubicación dentro del umbral establecido de " +
          threshold +
          "metros, ya existe una cercana",
        error: true,
      };
    }

    const ubicacion = await prisma.ubicaciones.create({
      data: {
        nombre: nombre,
        nombreAMostrar: nombreAMostrar,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        agenteExterno: isAgenteExterno,
        nombreA3: nombreA3,
      },
    });
    revalidatePath("/dashboard/ubicaciones");
    return {
      message: nombre + " registrado correctamente",
    };
  } catch (error) {
    return { message: "Error al crear", error: true };
  }
};
