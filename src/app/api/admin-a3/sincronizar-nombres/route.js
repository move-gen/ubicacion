import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { fetchWithTimeout } from '@/lib/api-utils';

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

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API_KEY no configurada' }, { status: 500 });
    }

    let procesados = 0;
    let exitosos = 0;
    let errores = 0;
    const detalles = [];

    console.log(`[SINCRONIZAR_NOMBRES] Procesando lote ${lote} con ${vehiculos.length} vehículos`);

    for (const matricula of vehiculos) {
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

        // Obtener datos de A3
        const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';
        const url = `${A3_API_URL}/api/articulo/${matricula}`;
        const response = await fetchWithTimeout(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'APIKEY': apiKey
          }
        }, 10000);

        if (!response.ok) {
          throw new Error(`A3 error: ${response.status}`);
        }

        const datosA3 = await response.json();
        const nombreA3 = datosA3.Nombre || '';
        const nombreAnterior = coche.marca || '';

        // Actualizar nombre si es diferente y no está vacío
        if (nombreA3 && nombreA3 !== nombreAnterior) {
          await prisma.coches.update({
            where: { matricula },
            data: {
              marca: nombreA3,
              updatedAt: new Date()
            }
          });

          exitosos++;
          detalles.push({
            matricula,
            estado: 'exitoso',
            nombreAnterior,
            nombreNuevo: nombreA3
          });

          console.log(`[SINCRONIZAR_NOMBRES] ${matricula}: "${nombreAnterior}" -> "${nombreA3}"`);
        } else {
          // No hay cambios necesarios
          detalles.push({
            matricula,
            estado: 'sin_cambios',
            nombreAnterior,
            nombreNuevo: nombreA3
          });
        }

      } catch (error) {
        errores++;
        detalles.push({
          matricula,
          estado: 'error',
          error: error.message
        });

        console.error(`[SINCRONIZAR_NOMBRES] Error en ${matricula}:`, error.message);
      }

      // ✅ IMPROVED: Pausa aumentada entre vehículos para evitar sobrecarga de A3
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s entre requests (antes 200ms)
    }

    console.log(`[SINCRONIZAR_NOMBRES] Lote ${lote} completado: ${exitosos} exitosos, ${errores} errores`);

    return NextResponse.json({
      lote,
      procesados,
      exitosos,
      errores,
      detalles
    });

  } catch (error) {
    console.error('[ADMIN_A3_SINCRONIZAR_NOMBRES] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
