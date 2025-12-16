import { NextResponse } from "next/server";
import db from "@/lib/db";

function normalize(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function GET() {
  try {
    const ubicaciones = await db.ubicaciones.findMany({
      select: {
        id: true,
        nombre: true,
        nombreAMostrar: true,
      },
      orderBy: {
        nombre: 'asc'
      }
    });

    const ubicacionesFormateadas = ubicaciones.map(u => ({
      id: u.id,
      original: u.nombre,
      mostrar: u.nombreAMostrar,
      normalizado: normalize(u.nombre),
    }));

    return NextResponse.json({
      total: ubicaciones.length,
      ubicaciones: ubicacionesFormateadas,
    });
  } catch (error) {
    console.error("Error al obtener ubicaciones:", error);
    return NextResponse.json(
      { error: "Error al obtener ubicaciones" },
      { status: 500 }
    );
  }
}

