import { NextResponse } from "next/server";
import db from "@/lib/db";
import { parse } from "csv-parse/sync";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

// Normalizar nombre para comparar (sin tildes, sin espacios extra, minúsculas)
function normalize(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

export async function POST(request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const userId = user?.id || null;

  let totalRegistros = 0;
  let vehiculosActualizados = 0;
  let vehiculosCreados = 0;
  const erroresDetalle = [];
  const actualizadosDetalle = [];
  const creadosDetalle = [];
  const sinCambiosDetalle = [];

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

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    totalRegistros = records.length;

    // Obtener todas las ubicaciones una sola vez
    const ubicacionesTodas = await db.ubicaciones.findMany();
    const ubicacionesMap = new Map();

    // Crear un mapa para búsqueda rápida con nombres normalizados
    for (const u of ubicacionesTodas) {
      const nombreNormalizado = normalize(u.nombre);
      if (!ubicacionesMap.has(nombreNormalizado)) {
        ubicacionesMap.set(nombreNormalizado, []);
      }
      ubicacionesMap.get(nombreNormalizado).push(u);
    }

    for (const record of records) {
      const { matricula, ubicacion } = record;

      if (!matricula || !ubicacion) {
        erroresDetalle.push({
          row: record,
          error: "Matrícula o ubicación faltante.",
        });
        continue;
      }

      try {
        // 1. Buscar la ubicación en el mapa pre-calculado
        const ubicacionBuscada = normalize(ubicacion);
        const ubicacionesCoinciden = ubicacionesMap.get(ubicacionBuscada) || [];

        if (ubicacionesCoinciden.length === 0) {
          erroresDetalle.push({
            row: record,
            error: `Ubicación no encontrada: '${ubicacion}'. El coche no fue añadido ni actualizado.`,
          });
          continue;
        }
        if (ubicacionesCoinciden.length > 1) {
          console.log(
            "DUPLICADO:",
            ubicacionBuscada,
            "IDs:",
            ubicacionesCoinciden.map((u) => u.id)
          );
          erroresDetalle.push({
            row: record,
            error: `Ubicación duplicada: '${ubicacion}'. Hay varias ubicaciones con el mismo nombre. Contacta con soporte para limpiar duplicados.`,
          });
          continue;
        }
        const ubicacionId = ubicacionesCoinciden[0].id;

        // 2. Buscar o crear/actualizar el coche
        const existingCoche = await db.coches.findUnique({
          where: { matricula: matricula },
        });

        if (existingCoche && existingCoche.idUbicacion === ubicacionId) {
          // No hay cambio real
          sinCambiosDetalle.push({ matricula, ubicacion });
          continue;
        }

        await db.$transaction(async (tx) => {
          let coche;
          if (existingCoche) {
            // Actualizar coche existente
            coche = await tx.coches.update({
              where: { matricula: matricula },
              data: {
                idUbicacion: ubicacionId,
                updatedAt: new Date(),
                actualizadoA3: false,
                usuarioRegistro: userId || "sistema",
              },
            });
          } else {
            // Crear nuevo coche
            coche = await tx.coches.create({
              data: {
                matricula: matricula,
                idUbicacion: ubicacionId,
                enVenta: false,
                createdAt: new Date(),
                usuarioRegistro: userId || "sistema",
              },
            });
          }

          // 3. Registrar en HistorialUbicaciones
          await tx.historialUbicaciones.create({
            data: {
              idCoche: coche.id,
              idUbicacion: ubicacionId,
              usuarioRegistro: userId || "sistema",
              telefono: "N/A",
              kilometros: 0,
              fechaUbicacion: new Date(),
            },
          });
        });

        // Si la transacción tuvo éxito, actualizamos contadores y listas
        if (existingCoche) {
          vehiculosActualizados++;
          actualizadosDetalle.push({ matricula, ubicacion });
        } else {
          vehiculosCreados++;
          creadosDetalle.push({ matricula, ubicacion });
        }
      } catch (dbError) {
        console.error(`Error al procesar la matrícula ${matricula}:`, dbError);
        erroresDetalle.push({ row: record, error: dbError.message });
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
        updatedCount: vehiculosActualizados,
        createdCount: vehiculosCreados,
        errors: erroresDetalle,
        totalRecords: totalRegistros,
        updatedList: actualizadosDetalle,
        createdList: creadosDetalle,
        noChangeList: sinCambiosDetalle,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error general en el endpoint /api/procesar-csv:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar el CSV." },
      { status: 500 }
    );
  }
}
