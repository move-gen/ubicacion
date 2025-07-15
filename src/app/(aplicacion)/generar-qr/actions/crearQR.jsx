"use server";

// Se utiliza en generar QR
import prisma from "@/lib/db";
import { PrismaClientKnownRequestError } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export const crearQR = async (formData) => {
  const { getUser, isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const matricula = formData.get("matricula");
  const user = await getUser();

  if (!matricula) {
    return { message: "Error al generar, matrícula inválida", error: true };
  }
  const datosAPI = await obtenerDatosAPI(matricula);

  if (!datosAPI) {
    return {
      message: "Vehículo no encontrado. Error en la matrícula",
      error: true,
    };
  }

  const obtenerKilometros = (param) => {
    if (param == null || param === "") return 0;

    const paramStr = String(param);

    const paramClean = paramStr.replace(/[.]/g, "").trim();

    const kilometros = parseInt(paramClean, 10);

    return isNaN(kilometros) ? 0 : kilometros;
  };
  const kilometros = obtenerKilometros(datosAPI.Param1);
  try {
    const dato = await prisma.coches.create({
      data: {
        matricula: String(matricula),
        idUbicacion: 1,
        marca: datosAPI.Descripcion,
        usuarioRegistro: user.given_name + " " + user.family_name,
        empresa: datosAPI.Caracteristica2,
      },
    });
    const historialUbicacion = await prisma.historialUbicaciones.create({
      data: {
        idCoche: dato.id,
        idUbicacion: 1,
        usuarioRegistro: user.given_name + " " + user.family_name,
        telefono: user.phone_number ? user.phone_number : "Interno",
        kilometros: kilometros,
        fechaUbicacion: new Date(),
      },
    });

    revalidatePath("/dashboard");
    return { message: "QR generado correctamente" };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return { message: "Volviendo a generar el QR" };
      }
    }
    return { message: "Error al generar", error: true };
  }
};

const obtenerDatosAPI = async (matricula) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const apiKey = process.env.API_KEY;
  try {
    const response = await fetch(
      `http://genesisgestionfinaciera.com:8080/api/articulo/${matricula}?externalFields=false`,
      {
        method: "GET",
        headers: {
          APIKEY: apiKey,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Vehículo no encontrado");
      } else {
        throw new Error("Error en la conexión");
      }
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Error api: " + error);
    return null;
  }
};
