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

        // Actualizar ubicación en A3
        const url = `http://212.64.162.34:8080/api/articulo/${matricula}`;
        const body = { Caracteristica1: ubicacionA3 };
        
        const response = await fetchWithTimeout(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'APIKEY': apiKey
          },
          body: JSON.stringify(body)
        }, 15000);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`A3 error: ${response.status} - ${errorText}`);
        }

        // Marcar como sincronizado en la base de datos local
        await prisma.coches.update({
          where: { matricula },
          data: {
            actualizadoA3: false, // false = sincronizado
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

      // Pausa entre vehículos para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 500));
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
