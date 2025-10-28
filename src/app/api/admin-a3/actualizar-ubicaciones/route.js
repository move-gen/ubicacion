import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { syncVehicleToA3 } from '@/lib/a3-sync';

export async function POST(request) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { vehiculos, lote } = await request.json();
    
    if (!vehiculos || !Array.isArray(vehiculos)) {
      return NextResponse.json({ error: 'Lista de vehículos requerida' }, { status: 400 });
    }

    let procesados = 0;
    let exitosos = 0;
    let errores = 0;
    const detalles = [];

    console.log(`[ACTUALIZAR_UBICACIONES] Procesando lote ${lote} con ${vehiculos.length} vehículos`);

    for (const { matricula, ubicacionA3 } of vehiculos) {
      procesados++;
      
      try {
        // Obtener datos actuales del vehículo
        const coche = await prisma.coches.findUnique({
          where: { matricula },
          include: {
            ubicacion: {
              select: {
                nombre: true,
                nombreA3: true
              }
            }
          }
        });

        if (!coche) {
          throw new Error('Vehículo no encontrado en la base de datos');
        }

        if (!ubicacionA3) {
          throw new Error('Ubicación A3 no especificada');
        }

        // ✅ IMPROVED: Actualizar timestamp antes del intento
        await prisma.coches.update({
          where: { matricula },
          data: { lastA3SyncAttempt: new Date() }
        });

        // Sincronizar con A3 usando el módulo central
        const result = await syncVehicleToA3(
          matricula,
          ubicacionA3,
          '[ACTUALIZAR_UBICACIONES]',
          coche.lastA3SyncAttempt,
          false // Respetar intervalo mínimo
        );

        if (result.skipped) {
          // ✅ NEW: Manejar caso de reintento demasiado pronto
          detalles.push({
            matricula,
            estado: 'omitido',
            ubicacionLocal: coche.ubicacion.nombre,
            ubicacionA3,
            error: result.error
          });
          console.log(`[ACTUALIZAR_UBICACIONES] ${matricula} omitido: ${result.error}`);
          procesados--; // No contar como procesado
          continue;
        }

        if (result.success) {
          // Marcar como sincronizado en la base de datos local
          await prisma.coches.update({
            where: { matricula },
            data: {
              pendienteA3: false,
              numeroReintentosA3: 0,
              updatedAt: new Date()
            }
          });

          exitosos++;
          detalles.push({
            matricula,
            estado: 'exitoso',
            ubicacionLocal: coche.ubicacion.nombre,
            ubicacionA3
          });

          console.log(`[ACTUALIZAR_UBICACIONES] ${matricula}: "${coche.ubicacion.nombre}" -> A3: "${ubicacionA3}"`);
        } else {
          throw new Error(result.error);
        }

      } catch (error) {
        errores++;
        
        // Incrementar contador de reintentos
        await prisma.coches.update({
          where: { matricula },
          data: {
            numeroReintentosA3: { increment: 1 },
            updatedAt: new Date()
          }
        });

        detalles.push({
          matricula,
          estado: 'error',
          ubicacionLocal: coche?.ubicacion?.nombre || 'N/A',
          ubicacionA3: ubicacionA3 || 'N/A',
          error: error.message
        });

        console.error(`[ACTUALIZAR_UBICACIONES] Error en ${matricula}:`, error.message);
      }

      // ✅ IMPROVED: Pausa aumentada entre vehículos para evitar sobrecarga de A3
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s entre requests
    }

    console.log(`[ACTUALIZAR_UBICACIONES] Lote ${lote} completado: ${exitosos} exitosos, ${errores} errores`);

    return NextResponse.json({
      lote,
      procesados,
      exitosos,
      errores,
      detalles
    });

  } catch (error) {
    console.error('[ADMIN_A3_ACTUALIZAR_UBICACIONES] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
