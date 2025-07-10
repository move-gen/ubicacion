import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { parse } from 'csv-parse/sync';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

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
        const file = formData.get('csvFile');

        if (!file) {
            return NextResponse.json({ error: 'No se encontró ningún archivo CSV.' }, { status: 400 });
        }

        const fileBuffer = await file.arrayBuffer();
        const fileContent = Buffer.from(fileBuffer).toString('utf8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        totalRegistros = records.length;

        for (const record of records) {
            const { matricula, ubicacion } = record;

            if (!matricula || !ubicacion) {
                erroresDetalle.push({ row: record, error: 'Matrícula o ubicación faltante.' });
                continue;
            }

            try {
                // 1. Buscar la ubicación existente
                let existingUbicacion = await db.ubicaciones.findFirst({
                    where: { nombre: ubicacion },
                });

                if (!existingUbicacion) {
                    erroresDetalle.push({ row: record, error: `Ubicación no encontrada: '${ubicacion}'. El coche no fue añadido ni actualizado.` });
                    continue;
                }
                const ubicacionId = existingUbicacion.id;

                // 2. Buscar o crear/actualizar el coche
                const existingCoche = await db.coches.findUnique({
                    where: { matricula: matricula },
                });

                let coche;
                if (existingCoche) {
                    if (existingCoche.idUbicacion === ubicacionId) {
                        // No hay cambio real
                        sinCambiosDetalle.push({ matricula, ubicacion });
                        continue;
                    }
                    // Actualizar coche existente
                    coche = await db.coches.update({
                        where: { matricula: matricula },
                        data: {
                            idUbicacion: ubicacionId,
                            updatedAt: new Date(),
                            actualizadoA3: true,
                            usuarioRegistro: userId || 'sistema',
                        },
                    });
                    vehiculosActualizados++;
                    actualizadosDetalle.push({ matricula, ubicacion });
                } else {
                    // Crear nuevo coche
                    coche = await db.coches.create({
                        data: {
                            matricula: matricula,
                            idUbicacion: ubicacionId,
                            enVenta: false,
                            createdAt: new Date(),
                            usuarioRegistro: userId || 'sistema',
                        },
                    });
                    vehiculosCreados++;
                    creadosDetalle.push({ matricula, ubicacion });
                }

                // 3. Registrar en HistorialUbicaciones
                await db.historialUbicaciones.create({
                    data: {
                        idCoche: coche.id,
                        idUbicacion: ubicacionId,
                        usuarioRegistro: userId || 'sistema',
                        telefono: 'N/A',
                        kilometros: 0,
                        fechaUbicacion: new Date(),
                    },
                });

            } catch (dbError) {
                console.error(`Error al procesar la matrícula ${matricula}:`, dbError);
                erroresDetalle.push({ row: record, error: dbError.message });
            }
        }

        const finalMensaje = erroresDetalle.length > 0
            ? `Procesado con ${erroresDetalle.length} errores.`
            : `Procesado exitosamente.`;

        return NextResponse.json({
            message: finalMensaje,
            updatedCount: vehiculosActualizados,
            createdCount: vehiculosCreados,
            errors: erroresDetalle,
            totalRecords: totalRegistros,
            updatedList: actualizadosDetalle,
            createdList: creadosDetalle,
            noChangeList: sinCambiosDetalle,
        }, { status: 200 });

    } catch (error) {
        console.error('Error general en el endpoint /api/procesar-csv:', error);
        return NextResponse.json({ error: 'Error interno del servidor al procesar el CSV.' }, { status: 500 });
    }
} 