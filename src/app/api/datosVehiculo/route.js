import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const { searchParams } = new URL(request.url);
  const matricula = searchParams.get("matricula");
  const matriculaRegex = /^([A-Z]?\d{4}[A-Z]{3}|[A-Z]{1,2}\d{4}[A-Z]{2})$/;

  if (!matricula) {
    return NextResponse.json(
      { message: "La matrícula es necesaria" },
      { status: 400 }
    );
  }
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
      select: {
        marca: true,
      },
    });

    if (!coche) {
      return NextResponse.json(
        { message: "Error en el vehículo" },
        { status: 500 }
      );
    }

    return NextResponse.json(coche);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener el vehículo" },
      { status: 500 }
    );
  }
}
