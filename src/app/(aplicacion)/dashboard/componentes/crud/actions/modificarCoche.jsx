"use server";
// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const modificarCoche = async (formData, fila, ubicacion) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  // Obtener datos del formulario
  const matricula = formData.get("matricula");
  const marca = formData.get("marca");
  const url = formData.get("url");
  const kilometros = formData.get("kilometros");

  // Obtener información del usuario
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  // Preparar los datos actualizados
  const data = {
    id: fila.id,
    marca: marca ? marca : fila.marca,
    matricula: matricula ? matricula : fila.matricula,
    ubicacion: ubicacion ? ubicacion : fila.ubicacion,
    enVenta: !!url, // Establece enVenta a true si url tiene un valor
    ...(url && { url }), // Solo incluye la propiedad url si tiene un valor
  };

  // Obtener el coche actual desde la base de datos
  const cocheActual = await prisma.coches.findUnique({
    where: {
      id: data.id,
    },
    select: {
      url: true,
      enVenta: true,
      idUbicacion: true,
      usuarioRegistro: true,
      vendidoLogistica: true,
    },
  });

  if (!cocheActual) {
    return {
      message: "Coche no encontrado",
      error: true,
    };
  }

  // Comprobar si la matrícula ya existe en otro coche
  if (matricula) {
    const matriculaExistente = await prisma.coches.findFirst({
      where: {
        matricula: matricula,
        id: {
          not: data.id,
        },
      },
    });
    if (matriculaExistente) {
      return {
        message: "La matrícula ya está registrada en otro coche",
        error: true,
      };
    }
  }

  // Determinar el estado de venta
  let enVenta = cocheActual.enVenta;
  if (!cocheActual.url && data.url) {
    enVenta = true;
  } else if (!data.url) {
    enVenta = cocheActual.enVenta;
  }

  // Determinar si la ubicación ha cambiado
  const nuevaUbicacion =
    data.ubicacion && !isNaN(data.ubicacion)
      ? parseInt(data.ubicacion)
      : cocheActual.idUbicacion;
  const ubicacionCambiada = nuevaUbicacion !== cocheActual.idUbicacion;

  // Construir el objeto de datos a actualizar
  const updateData = {
    marca: data.marca,
    matricula: data.matricula,
    ...(ubicacionCambiada && { idUbicacion: nuevaUbicacion }),
    enVenta,
    ...(data.url && { url: data.url }), // Añadir `url` solo si está definido
    ...(ubicacionCambiada && { pendienteA3: true }),
    updatedAt: new Date(),
    usuarioRegistro: `${user.given_name} ${user.family_name}`,
  };

  try {
    // Actualiza los datos del coche
    const coche = await prisma.coches.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });

    // Manejar el cambio de ubicación
    if (ubicacionCambiada) {
      if (!kilometros) {
        return {
          message: "Añada los kilómetros",
          error: true,
        };
      }

      // Crear un nuevo registro en historialUbicaciones por el cambio de ubicación
      await prisma.historialUbicaciones.create({
        data: {
          idCoche: coche.id,
          idUbicacion: nuevaUbicacion,
          usuarioRegistro: `${user.given_name} ${user.family_name}`,
          kilometros: parseInt(kilometros),
          fechaUbicacion: new Date(),
          telefono: user.phone_number ? user.phone_number : "Interno",
        },
      });

      // Actualizar en el programa logístico
      if (cocheActual.vendidoLogistica) {
        const vehiculo = await prisma.vehiculosEnvio.findUnique({
          where: { idCoche: coche.id },
          select: { idUbicacionFinalDestino: true },
        });

        if (vehiculo.idUbicacionFinalDestino === nuevaUbicacion) {
          await prisma.vehiculosEnvio.delete({
            where: {
              idCoche: coche.id,
            },
          });
          await prisma.coches.update({
            where: {
              id: coche.id,
            },
            data: {
              vendidoLogistica: false,
            },
          });
          console.log("Logística: La ubicación coincide con la de destino.");
        } else {
          await prisma.vehiculosEnvio.update({
            where: { idCoche: coche.id },
            data: {
              idUbicacion: nuevaUbicacion,
              updatedAt: new Date(),
            },
          });
          console.log("Logística: La ubicación ha sido actualizada.");
        }
      }
    }

    // Manejar la actualización de kilómetros sin cambio de ubicación
    if (!ubicacionCambiada && kilometros) {
      await prisma.historialUbicaciones.create({
        data: {
          idCoche: coche.id,
          idUbicacion: nuevaUbicacion, // Puede ser la misma ubicación
          usuarioRegistro: `${user.given_name} ${user.family_name}`,
          kilometros: parseInt(kilometros),
          fechaUbicacion: new Date(),
          telefono: user.phone_number ? user.phone_number : "Interno",
        },
      });
    }

    // Revalidar rutas para actualizar el caché
    revalidatePath("/dashboard");
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
