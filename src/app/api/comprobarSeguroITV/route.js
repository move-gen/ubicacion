import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { obtenerFechaITV, comprobarSeguroITV } from "@/lib/funciones";
import { redirect } from "next/navigation";
//Compruebo el Seguro y la ITV

export async function GET(request) {
  try {
    const { isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      redirect("/login");
    }
    const { searchParams } = new URL(request.url);
    const matricula = searchParams.get("matricula");

    const actualizarVehiculo = await enviarVehiculoAPI(matricula);
    if (!actualizarVehiculo) {
      throw new Error("Error al actualizar el vehículo " + matricula);
    }
    const fechaITV = obtenerFechaITV(actualizarVehiculo.Param5);

    return NextResponse.json(
      comprobarSeguroITV(fechaITV, actualizarVehiculo.Caracteristica3)
    );
  } catch (error) {
    return NextResponse.json({ message: "Error " }, { status: 500 });
  }
}

const enviarVehiculoAPI = async (matricula) => {
  // Obtén la API key de las variables de entorno
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const apiKey = process.env.API_KEY;
  const A3_API_URL = process.env.A3_API_URL || 'http://212.64.162.34:8080';
  try {
    const response = await fetch(
      `${A3_API_URL}/api/articulo/${matricula}?externalFields=false`,
      {
        method: "GET",
        headers: {
          APIKEY: apiKey,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Vehículo no encontrado");
      } else {
        throw new Error("Error en la conexión");
      }
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.log("Error api: " + error);
    return null;
  }
};
