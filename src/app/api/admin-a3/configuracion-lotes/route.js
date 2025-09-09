import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import fs from 'fs/promises';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'data', 'admin-a3-config.json');

// Configuración por defecto
const DEFAULT_CONFIG = {
  tamañoLoteNombres: 10,
  tamañoLoteUbicaciones: 5,
  pausaEntreLotes: 1000,
  maxReintentos: 3,
  timeout: 30000
};

const DEFAULT_ESTADO = {
  nombres: { activo: false, loteActual: 0, totalLotes: 0, pausado: false },
  ubicaciones: { activo: false, loteActual: 0, totalLotes: 0, pausado: false }
};

async function cargarConfiguracion() {
  try {
    await fs.mkdir(path.dirname(CONFIG_PATH), { recursive: true });
    const data = await fs.readFile(CONFIG_PATH, 'utf8');
    const parsed = JSON.parse(data);
    return {
      configuracion: { ...DEFAULT_CONFIG, ...parsed.configuracion },
      estadoLotes: { ...DEFAULT_ESTADO, ...parsed.estadoLotes },
      historialLotes: parsed.historialLotes || []
    };
  } catch (error) {
    return {
      configuracion: DEFAULT_CONFIG,
      estadoLotes: DEFAULT_ESTADO,
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

export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await cargarConfiguracion();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[ADMIN_A3_CONFIGURACION_LOTES] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { configuracion } = await request.json();
    
    if (!configuracion) {
      return NextResponse.json({ error: 'Configuración requerida' }, { status: 400 });
    }

    const data = await cargarConfiguracion();
    data.configuracion = { ...data.configuracion, ...configuracion };
    
    await guardarConfiguracion(data);

    return NextResponse.json({ message: 'Configuración guardada correctamente' });

  } catch (error) {
    console.error('[ADMIN_A3_CONFIGURACION_LOTES] Error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
