// Indica si hay varias ubicaciones o no donde se encuentra
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import haversine from "haversine-distance";
import {redirect} from "next/navigation";
export async function GET(request) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const { searchParams } = new URL(request.url);
  const ubicacionParam = searchParams.get("ubicacion");
  if (!ubicacionParam) {
    return NextResponse.json(
      { message: "Error al obtener las ubicaciones" },
      { status: 400 }
    );
  }
  const ubicacion = JSON.parse(decodeURIComponent(ubicacionParam));
  try {
    // Compruebo si leyó la ubicación precisa
    const target = {
      latitude: parseFloat(ubicacion.latitud),
      longitude: parseFloat(ubicacion.longitud),
    };
    if ((target.latitude || target.longitude) === 0) {
      return NextResponse.json(
        {
          message:
            "Ubicación no detectada, compruebe los permisos de ubicación del teléfono",
        },
        { status: 404 }
      );
    }
    const ubicaciones = await prisma.ubicaciones.findMany();

    const threshold = 50; // Define el umbral en metros

    const ubicacionesCumplenUmbral = ubicaciones.filter((ubicacion) => {
      const lat = parseFloat(ubicacion.latitud);
      const lon = parseFloat(ubicacion.longitud);
      const ubicacionBBDD = { latitude: lat, longitude: lon };
      // Calcula la distancia usando haversine
      const distance = haversine(ubicacionBBDD, target);
      // Verifica si la distancia está dentro del umbral
      return distance <= threshold;
    });
    if (ubicacionesCumplenUmbral.length === 0) {
      return NextResponse.json(
        {
          message:
            "Ubicación donde se encuentra el vehículo no registrada. Muévase al centro de la ubicación. Si sigue con problemas por favor contacte con administración",
        },
        { status: 404 }
      );
    }

    // Si hay ubicaciones que cumplen el umbral, devolverlas en un array

    return NextResponse.json(ubicacionesCumplenUmbral);
  } catch (error) {
    return NextResponse.json(
      { message: "Error al obtener las ubicaciones" },
      { status: 500 }
    );
  }
}
