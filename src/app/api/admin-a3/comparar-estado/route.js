import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { fetchWithTimeout } from '@/lib/api-utils';

export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API_KEY no configurada' }, { status: 500 });
    }

    // Obtener todos los coches con sus ubicaciones
    const coches = await prisma.coches.findMany({
      include: {
        ubicacion: {
          select: {
            nombre: true,
            nombreA3: true
          }
        }
      },
      orderBy: { matricula: 'asc' }
    });

    const vehiculos = [];
    let sincronizados = 0;
    let diferencias = 0;
    let errores = 0;

    // Procesar en lotes para evitar timeouts
    const BATCH_SIZE = 10;
    for (let i = 0; i < coches.length; i += BATCH_SIZE) {
      const lote = coches.slice(i, i + BATCH_SIZE);
      
      const promesasLote = lote.map(async (coche) => {
        try {
          // Obtener datos de A3
          const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';
          const url = `${A3_API_URL}/api/articulo/${coche.matricula}`;
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
          
          // Comparar datos
          const ubicacionLocal = coche.ubicacion.nombre;
          const ubicacionA3 = datosA3.Caracteristica1 || '';
          const nombreLocal = coche.marca || '';
          const nombreA3 = datosA3.Nombre || '';

          let estado = 'sincronizado';
          if (ubicacionLocal !== ubicacionA3 || nombreLocal !== nombreA3) {
            estado = 'diferencia';
            diferencias++;
          } else {
            sincronizados++;
          }

          return {
            matricula: coche.matricula,
            estado,
            ubicacionLocal,
            ubicacionA3,
            nombreLocal,
            nombreA3,
            ultimaActualizacion: coche.updatedAt
          };

        } catch (error) {
          errores++;
          return {
            matricula: coche.matricula,
            estado: 'error',
            ubicacionLocal: coche.ubicacion.nombre,
            ubicacionA3: 'Error al obtener',
            nombreLocal: coche.marca || '',
            nombreA3: 'Error al obtener',
            ultimaActualizacion: coche.updatedAt,
            error: error.message
          };
        }
      });

      const resultadosLote = await Promise.all(promesasLote);
      vehiculos.push(...resultadosLote);

      // Pausa entre lotes
      if (i + BATCH_SIZE < coches.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      total: vehiculos.length,
      sincronizados,
      diferencias,
      errores,
      vehiculos
    });

  } catch (error) {
    console.error('[ADMIN_A3_COMPARAR_ESTADO] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
