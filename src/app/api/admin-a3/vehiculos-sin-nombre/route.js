import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener vehículos que no tienen nombre o tienen nombre vacío
    const vehiculos = await prisma.coches.findMany({
      where: {
        OR: [
          { marca: null },
          { marca: '' },
          { marca: { not: { contains: ' ' } } } // Nombres muy cortos probablemente no son reales
        ]
      },
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

    const vehiculosFormateados = vehiculos.map(vehiculo => ({
      matricula: vehiculo.matricula,
      ubicacion: vehiculo.ubicacion.nombre,
      ubicacionA3: vehiculo.ubicacion.nombreA3,
      nombreLocal: vehiculo.marca || '',
      ultimaActualizacion: vehiculo.updatedAt
    }));

    return NextResponse.json({
      total: vehiculos.length,
      vehiculos: vehiculosFormateados
    });

  } catch (error) {
    console.error('[ADMIN_A3_VEHICULOS_SIN_NOMBRE] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
