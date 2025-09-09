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

export async function POST() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await cargarConfiguracion();
    
    // Limpiar historial
    data.historialLotes = [];

    await guardarConfiguracion(data);

    console.log('[ADMIN_A3] Historial limpiado');

    return NextResponse.json({ 
      message: 'Historial limpiado correctamente'
    });

  } catch (error) {
    console.error('[ADMIN_A3_LIMPIAR_HISTORIAL] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
