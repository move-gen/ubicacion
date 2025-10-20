import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function POST(request) {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const user = await getUser();
  const data = await request.json();
  const {
    matricula,
    taller,
    telefono,
    ubicacion,
    personaEncargada,
    kilometros,
  } = data;
  try {
    // Compruebo que el coche exista y lo obtengo

    const coche = await prisma.coches.findUnique({
      where: {
        matricula: matricula,
      },
      select: {
        id: true,
        vendidoLogistica: true,
      },
    });
    if (!coche) {
      return NextResponse.json(
        { message: "QR no válido, debe crearlo de nuevo" },
        { status: 404 }
      );
    }
    console.log("[INFO]:", "Añado el vehículo " + coche.id);

    await prisma.historialUbicaciones.create({
      data: {
        idCoche: coche.id,
        idUbicacion: ubicacion.id,
        usuarioRegistro: user.given_name + " " + user.family_name,
        fechaUbicacion: new Date(),
        telefono: user.phone_number ? user.phone_number : "Interno",
        kilometros: parseInt(kilometros),
      },
    });
    let ubiID = ubicacion.id;
    let userRegistro = user.given_name + " " + user.family_name;
    // Si va al taller / Agente externo a repararse añado también la transacción
    if (taller && personaEncargada && telefono) {
      console.log("[INFO]:", "Añado el vehículo " + coche.id + " Al taller");

      await prisma.historialUbicaciones.create({
        data: {
          idCoche: coche.id,
          idUbicacion: parseInt(taller),
          usuarioRegistro: personaEncargada,
          fechaUbicacion: new Date(),
          telefono: telefono,
          kilometros: parseInt(kilometros),
        },
      });
      ubiID = parseInt(taller);
      userRegistro = personaEncargada;
    }

    await prisma.coches.update({
      where: {
        id: coche.id,
      },
      data: {
        idUbicacion: ubiID,
        usuarioRegistro: userRegistro,
        updatedAt: new Date(),
        pendienteA3: true, // Marcar como pendiente de sincronizar con A3
      },
    });
    //Si está como vendido logística, tengo que comprobar si la ubicación es correcta
    // Y la ubicación final es exactamente igual a esta, le tengo que dar de baja
    await comprobarYDarbajaVehiculoEnvio(coche, ubiID);
    revalidatePath("/dashboard");
    return NextResponse.json({
      ok: 0,
      ubiID: ubiID,
      cocheID: coche.id,
    });
  } catch (error) {
    console.log("[ERROR]:", error);
    return NextResponse.json(
      { message: "Error al actualizar la ubicación del vehículo ", ok: false },
      { status: 500 }
    );
  }
}

// Obtengo todas las ubicaciones que puedo utilizar para el selector de agentes externos/talleres en escanear-qr
export async function GET() {
  try {
    const { isAuthenticated } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      redirect("/login");
    }
    const ubicaciones = await prisma.ubicaciones.findMany({
      where: {
        agenteExterno: true,
      },
      select: {
        nombre: true,
        id: true,
      },
    });

    return NextResponse.json(ubicaciones);
  } catch (error) {
    return NextResponse.json(
      { message: "Error ubicación no detectada" },
      { status: 500 }
    );
  }
}

const comprobarYDarbajaVehiculoEnvio = async (coche, ubiID) => {
  if (!coche.vendidoLogistica) {
    console.log(
      `El coche con ID ${coche.id} no está marcado como vendido en logística.`
    );
    return;
  }

  // Obtener el registro de logística asociado al coche
  const logistica = await prisma.vehiculosEnvio.findUnique({
    where: {
      idCoche: coche.id,
    },
  });

  // Obtener la ubicación final destino del registro de logística
  const ubicacionFinalDestino = logistica.idUbicacionFinalDestino;

  // Comprobar si la ubicación final destino coincide con la ubicación actual (ubiID)
  if (ubicacionFinalDestino === ubiID) {
    // Dar de baja el registro de logística (marcar como inactivo)
    await prisma.vehiculosEnvio.delete({
      where: { id: logistica.id },
    });
    await prisma.coches.update({
      where: { id: coche.id },
      data: {
        vendidoLogistica: false,
      },
    });

    console.log(
      `Registro de logística con ID ${logistica.id} ha sido dado de baja.`
    );
  } else {
    //Actualizo la ubicación del coche
    await prisma.vehiculosEnvio.update({
      where: { id: logistica.id },
      data: {
        idUbicacion: ubiID,
        updatedAt: new Date(),
      },
    });
  }
};
