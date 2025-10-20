import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener estadísticas generales
    const [
      totalCoches,
      sincronizados,
      pendientes,
      conErrores,
      ultimaSincronizacion
    ] = await Promise.all([
      prisma.coches.count(),
      prisma.coches.count({
        where: { pendienteA3: false }
      }),
      prisma.coches.count({
        where: { pendienteA3: true }
      }),
      prisma.coches.count({
        where: { 
          pendienteA3: true,
          numeroReintentosA3: { gte: 3 }
        }
      }),
      prisma.coches.findFirst({
        where: { pendienteA3: false },
        orderBy: { updatedAt: 'desc' },
        select: { updatedAt: true }
      })
    ]);

    return NextResponse.json({
      totalCoches,
      sincronizados,
      pendientes,
      errores: conErrores,
      ultimaSincronizacion: ultimaSincronizacion?.updatedAt
    });

  } catch (error) {
    console.error('[ADMIN_A3_ESTADO_GENERAL] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
