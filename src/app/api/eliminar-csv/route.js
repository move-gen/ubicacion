import { NextResponse } from "next/server";
import db from "@/lib/db";
import { parse } from "csv-parse/sync";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id || null;

  let totalRegistros = 0;
  let vehiculosEliminados = 0;
  const erroresDetalle = [];
  const eliminadosDetalle = [];
  const noEncontradosDetalle = [];

  try {
    const formData = await request.formData();
    const file = formData.get("csvFile");

    if (!file) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo CSV." },
        { status: 400 }
      );
    }

    const fileBuffer = await file.arrayBuffer();
    const fileContent = Buffer.from(fileBuffer).toString("utf8");

    let records;
    try {
      records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (parseError) {
      console.error("Error al parsear el CSV:", parseError);
      return NextResponse.json(
        {
          error: "El formato del archivo CSV es inválido.",
          details: parseError.message,
        },
        { status: 400 }
      );
    }

    totalRegistros = records.length;

    for (const record of records) {
      const { matricula } = record;

      if (!matricula) {
        erroresDetalle.push({
          row: record,
          error: "Matrícula faltante.",
        });
        continue;
      }

      try {
        // Buscar el coche por matrícula
        const existingCoche = await db.coches.findUnique({
          where: { matricula: matricula.trim() },
          include: {
            historialUbicaciones: true,
            vehiculosEnvio: true,
          },
        });

        if (!existingCoche) {
          noEncontradosDetalle.push({ matricula });
          continue;
        }

        // Eliminar el coche y sus relaciones usando transacción
        await db.$transaction(async (tx) => {
          // Eliminar historial de ubicaciones
          await tx.historialUbicaciones.deleteMany({
            where: { idCoche: existingCoche.id },
          });

          // Eliminar registros de vehículos en envío
          await tx.vehiculosEnvio.deleteMany({
            where: { idCoche: existingCoche.id },
          });

          // Eliminar el coche
          await tx.coches.delete({
            where: { id: existingCoche.id },
          });
        });

        vehiculosEliminados++;
        eliminadosDetalle.push({ 
          matricula, 
          marca: existingCoche.marca || "Sin marca" 
        });

      } catch (dbError) {
        console.error(`Error al procesar la matrícula ${matricula}:`, dbError);
        erroresDetalle.push({ 
          row: record, 
          error: `Error de base de datos: ${dbError.message}` 
        });
      }
    }

    const finalMensaje =
      erroresDetalle.length > 0
        ? `Procesado con ${erroresDetalle.length} errores.`
        : `Procesado exitosamente.`;

    // Revalidar caché de rutas relevantes
    revalidatePath("/dashboard");
    revalidatePath("/listado-vehiculos");

    return NextResponse.json(
      {
        message: finalMensaje,
        deletedCount: vehiculosEliminados,
        errors: erroresDetalle,
        totalRecords: totalRegistros,
        deletedList: eliminadosDetalle,
        notFoundList: noEncontradosDetalle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error general en el endpoint /api/eliminar-csv:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el CSV." },
      { status: 500 }
    );
  }
}
