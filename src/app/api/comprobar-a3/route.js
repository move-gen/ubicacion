import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const { isAuthenticated, getPermission } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const permission = await getPermission("crud:ubicacion_coches");

    if (!permission.isGranted) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }
    // ✅ Consulta a la base de datos para obtener los coches pendientes
    const cochesActualizados = await prisma.coches.findMany({
      where: {
        pendienteA3: true,
      },
      select: {
        matricula: true,
        marca: true,
        numeroReintentosA3: true,
        ubicacion: {
          select: {
            nombre: true, // Incluimos la ubicación del coche
          },
        },
      },
    });
    // ✅ Retornamos los coches actualizados en formato JSON
    return NextResponse.json(cochesActualizados);
  } catch (error) {
    return NextResponse.json(
      {
        message: "Ocurrió un error al obtener los coches actualizados.",
      },
      { status: 500 }
    );
  }
}
