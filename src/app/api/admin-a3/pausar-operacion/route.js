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
      estadoLotes: {
        nombres: { activo: false, loteActual: 0, totalLotes: 0, pausado: false },
        ubicaciones: { activo: false, loteActual: 0, totalLotes: 0, pausado: false }
      }
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

    const { tipo } = await request.json();
    
    if (!tipo || !['nombres', 'ubicaciones'].includes(tipo)) {
      return NextResponse.json({ error: 'Tipo de operación inválido' }, { status: 400 });
    }

    const data = await cargarConfiguracion();
    
    // Verificar que la operación esté activa
    if (!data.estadoLotes[tipo].activo) {
      return NextResponse.json({ 
        error: `No hay operación ${tipo} activa para pausar` 
      }, { status: 400 });
    }

    // Pausar la operación
    data.estadoLotes[tipo].pausado = true;
    data.estadoLotes[tipo].pausadoEn = new Date().toISOString();

    await guardarConfiguracion(data);

    console.log(`[ADMIN_A3] Operación ${tipo} pausada`);

    return NextResponse.json({ 
      message: `Operación ${tipo} pausada correctamente`,
      estado: data.estadoLotes[tipo]
    });

  } catch (error) {
    console.error('[ADMIN_A3_PAUSAR_OPERACION] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
