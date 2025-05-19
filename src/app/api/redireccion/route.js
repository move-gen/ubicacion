import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request) {
  const matricula = request.nextUrl.searchParams.get("car");
  try {
    const matriculaRegex = /^([A-Z]?\d{4}[A-Z]{3}|[A-Z]{1,2}\d{4}[A-Z]{2})$/;

    if (!matriculaRegex.test(matricula)) {
      return NextResponse.json({ message: "Error" }, { status: 400 });
    }
    const coche = await prisma.coches.findUnique({
      where: {
        matricula: matricula,
      },
      select: {
        url: true,
      },
    });

    if (!coche) {
      return NextResponse.json({ message: "Error" }, { status: 400 });
    }
    return NextResponse.json(coche.url);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
