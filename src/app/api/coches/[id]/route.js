import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { headers } from "next/headers";
//Matricula en mayuscula
//INVENTARIO.PRO
//UBICACION
export async function GET(request) {
  const apiSecret = process.env.CUSTOM_API_KEY;
  const headersList = headers();
  const tokenFromHeader = headersList.get("Token") || headersList.get("token"); // Aceptar "Token" o "token"

  if (tokenFromHeader !== apiSecret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { url } = request;
  const matricula = url.split("/").pop();
  const matriculaRegex = /^([A-Z]?\d{4}[A-Z]{3}|[A-Z]{1,2}\d{4}[A-Z]{2})$/;

  if (!matriculaRegex.test(matricula)) {
    return NextResponse.json(
      { message: "Formato de matrícula inválido" },
      { status: 400 }
    );
  }
  try {
    const coche = await prisma.coches.findUnique({
      where: {
        matricula: matricula,
      },
      include: {
        ubicacion: {
          select: {
            nombreAMostrar: true,
          },
        },
      },
    });

    if (!coche || !coche.ubicacion) {
      console.log(`[API_COCHES] Coche o ubicación no encontrada para matrícula: ${matricula}`);
      return NextResponse.json(
        { message: "Las Palmas de Gran Canaria" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ubicacion: coche.ubicacion.nombreAMostrar });
  } catch (error) {
    console.error(`[API_COCHES] Error procesando solicitud para matrícula ${matricula}:`, error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
