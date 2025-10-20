import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener vehículos que necesitan actualización de ubicación en A3
    const vehiculos = await prisma.coches.findMany({
      where: {
        pendienteA3: true // Pendientes de sincronización
      },
      include: {
        ubicacion: {
          select: {
            nombre: true,
            nombreA3: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const vehiculosFormateados = vehiculos.map(vehiculo => ({
      matricula: vehiculo.matricula,
      ubicacionLocal: vehiculo.ubicacion.nombre,
      ubicacionA3: vehiculo.ubicacion.nombreA3,
      pendienteA3: vehiculo.pendienteA3,
      numeroReintentosA3: vehiculo.numeroReintentosA3 || 0,
      ultimaActualizacion: vehiculo.updatedAt,
      error: vehiculo.numeroReintentosA3 >= 3 ? 'Máximo de reintentos alcanzado' : null
    }));

    return NextResponse.json({
      total: vehiculos.length,
      vehiculos: vehiculosFormateados
    });

  } catch (error) {
    console.error('[ADMIN_A3_VEHICULOS_PENDIENTES_UBICACION] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
