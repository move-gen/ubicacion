import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(request) {
  const { isAuthenticated } = getKindeServerSession();

  // Protección básica
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  // Verificar variables de entorno críticas
  const envStatus = {
    API_KEY: process.env.API_KEY ? "✅ Configurada" : "❌ No configurada",
    DATABASE_URL: process.env.DATABASE_URL ? "✅ Configurada" : "❌ No configurada",
    KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID ? "✅ Configurada" : "❌ No configurada",
    NODE_ENV: process.env.NODE_ENV || "undefined",
    // Solo mostrar primeros y últimos caracteres por seguridad
    API_KEY_PARTIAL: process.env.API_KEY 
      ? `${process.env.API_KEY.substring(0, 8)}...${process.env.API_KEY.substring(process.env.API_KEY.length - 8)}`
      : "No disponible"
  };

  return NextResponse.json({
    message: "Estado de variables de entorno",
    variables: envStatus,
    timestamp: new Date().toISOString()
  });
}
