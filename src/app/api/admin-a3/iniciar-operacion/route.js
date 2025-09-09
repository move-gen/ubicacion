import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'admin-a3-config.json');

async function cargarConfiguracion() {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      configuracion: {
        tamañoLoteNombres: 10,
        tamañoLoteUbicaciones: 5,
        pausaEntreLotes: 1000,
        maxReintentos: 3,
        timeout: 30000
      },
      estadoLotes: {
        nombres: { activo: false, loteActual: 0, totalLotes: 0, pausado: false },
        ubicaciones: { activo: false, loteActual: 0, totalLotes: 0, pausado: false }
      },
      historialLotes: []
    };
  }
}

async function guardarConfiguracion(data) {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando configuración:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { tipo, configuracion } = await request.json();
    
    if (!tipo || !['nombres', 'ubicaciones'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de operación inválido' }, { status: 400 });
    }

    const data = await cargarConfiguracion();
    
    // Verificar que no haya otra operación activa
    if (data.estadoLotes.nombres.activo || data.estadoLotes.ubicaciones.activo) {
      return NextResponse.json({ 
        error: 'Ya hay una operación activa. Detén la operación actual antes de iniciar una nueva.' 
      }, { status: 409 });
    }

    // Iniciar la operación
    data.estadoLotes[tipo] = {
      activo: true,
      loteActual: 0,
      totalLotes: 0,
      pausado: false,
      inicio: new Date().toISOString()
    };

    // Actualizar configuración si se proporciona
    if (configuracion) {
      data.configuracion = { ...data.configuracion, ...configuracion };
    }

    await guardarConfiguracion(data);

    console.log(`[ADMIN_A3] Operación ${tipo} iniciada`);

    return NextResponse.json({ 
      message: `Operación ${tipo} iniciada correctamente`,
      estado: data.estadoLotes[tipo]
    });

  } catch (error) {
    console.error('[ADMIN_A3_INICIAR_OPERACION] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
