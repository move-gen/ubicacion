import "server-only";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getCombinedCochesData = async () => {
  const [
    coches,
    ultimosCincoCoches,
    cochesVentaCount,
    ubicacionesTotal,
    cochesTransito,
  ] = await Promise.all([
    prisma.coches.findMany({
      select: {
        id: true,
        enVenta: true,
        matricula: true,
        marca: true,
        usuarioRegistro: true,
        updatedAt: true,
        actualizadoA3: true,
        ubicacion: {
          select: {
            nombre: true,
          },
        },
        vendidoLogistica: true,
      },
    }),
    prisma.coches.findMany({
      orderBy: {
        updatedAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        enVenta: true,
        matricula: true,
        marca: true,
        usuarioRegistro: true,
        updatedAt: true,
        ubicacion: {
          select: {
            nombre: true,
          },
        },
      },
    }),
    prisma.coches.groupBy({
      by: ["enVenta"],
      _count: {
        _all: true,
      },
    }),
    prisma.ubicaciones.findMany({
      select: {
        id: true,
        nombre: true,
      },
    }),
    prisma.coches.count({
      where: {
        ubicacion: {
          nombre: {
            contains: "transito",
          },
        },
      },
    }),
  ]);

  const cochesEnVentaCount =
    cochesVentaCount.find((group) => group.enVenta)?.["_count"]._all || 0;
  const cochesNoEnVentaCount =
    cochesVentaCount.find((group) => !group.enVenta)?.["_count"]._all || 0;

  const cochesVenta = [
    {
      nombre: "En Venta",
      numero: cochesEnVentaCount,
    },
    {
      nombre: "En Preparación",
      numero: cochesNoEnVentaCount,
    },
  ];
  revalidatePath("/dashboard");
  return {
    coches,
    ultimosCincoCoches,
    cochesVenta,
    ubicacionesTotal,
    cochesTransito,
  };
};

export const getCochesZona = async () => {
  const carCountsByLocation = await prisma.ubicaciones.findMany({
    select: {
      nombre: true,
      _count: {
        select: {
          coches: true,
        },
      },
    },
  });

  const result = carCountsByLocation.map((location) => ({
    name: location.nombre,
    value: location._count.coches,
  }));
  return result;
};

export const getUbicaciones = async () => {
  const ubicaciones = await prisma.ubicaciones.findMany();
  return ubicaciones;
};

export const getUbicacionesVehiculo = async (idCoche) => {
  const ubicaciones = await prisma.historialUbicaciones.findMany({
    where: {
      idCoche: idCoche,
    },
    select: {
      usuarioRegistro: true,
      fechaUbicacion: true,
      telefono: true,
      kilometros: true,
      ubicacion: {
        select: {
          nombre: true,
          latitud: true,
          longitud: true,
        },
      },
    },
  });
  return ubicaciones;
};

export const getCocheDetails = async (idCoche) => {
  const cocheDetails = await prisma.coches.findUnique({
    where: {
      id: idCoche,
    },
    select: {
      marca: true,
      matricula: true,
      empresa: true,
      actualizadoA3: true,
    },
  });
  return cocheDetails;
};

export const getUsuarios = async () => {
  try {
    // Usar KINDE_ISSUER_URL de las variables de entorno para la URL base de Kinde
    const kindeDomain = process.env.KINDE_ISSUER_URL;
    const tokenResponse = await fetch(`${kindeDomain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      cache: "no-store",
      body: new URLSearchParams({
        audience: `${kindeDomain}/api`, // La audiencia de la API de gestión de Kinde
        grant_type: "client_credentials",
        client_id: process.env.KINDE_CLIENT_ID,
        client_secret: process.env.KINDE_CLIENT_SECRET,
      }),
    });
    if (!tokenResponse.ok) {
      throw new Error("Error actualizando el token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Usar el access token para obtener la lista de usuarios
    const usersResponse = await fetch(
      `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users?page_size=400`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!usersResponse.ok) {
      throw new Error(`Error obteniendo usuarios ${usersResponse.statusText}`);
    }

    const usersData = await usersResponse.json();

    // 2. Obtener los puestos de los usuarios
    // Asumiendo que getPuestosUsuarios es una función asíncrona que devuelve una promesa
    const puestosUsuarios = await getPuestosUsuarios();

    // 3. Crear un mapa para acceder rápidamente al job_title por user_id
    const jobTitleMap = new Map();
    puestosUsuarios.forEach((puesto) => {
      jobTitleMap.set(puesto.user_id, puesto.job_title);
    });

    // 4. Mapear y combinar los datos de usuarios con sus puestos
    const usuariosCombinados = usersData.organization_users.map((usuario) => ({
      id: usuario.id, // Usar la ID original 'kb...'
      email: usuario.email,
      roles: usuario.roles,
      full_name: usuario.full_name,
      job_title: jobTitleMap.get(usuario.id) || "Sin puesto asignado", // Asignar job_title o un valor por defecto
    }));

    // 5. Devolver el array combinado de usuarios
    return usuariosCombinados;
  } catch (error) {
    return null;
  }
};

export const obtenerDatosAPI = async (matricula) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const apiKey = process.env.API_KEY;
  try {
    const response = await fetch(
      `http://212.64.162.34:8080/api/articulo/${matricula}?externalFields=false`,
      {
        method: "GET",
        headers: {
          APIKEY: apiKey,
          "Content-Type": "application/json",
        },
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

export const getVehiculosEnvioGestion = async () => {
  const vehiculosEnvio = await prisma.vehiculosEnvio.findMany({
    include: {
      coche: {
        select: {
          marca: true,
          matricula: true,
        },
      },
      ubicacionFinalDestino: {
        select: {
          nombre: true,
        },
      },
      ubicacion: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: {
      estado: "asc",
    },
  });

  return vehiculosEnvio;
};

export const getVehiculosEnvioComercial = async () => {
  const vehiculosEnvio = await prisma.vehiculosEnvio.findMany({
    include: {
      coche: {
        select: {
          marca: true,
          matricula: true,
        },
      },
      ubicacionFinalDestino: {
        select: {
          nombre: true,
        },
      },
      ubicacion: {
        select: {
          nombre: true,
        },
      },
    },
    orderBy: {
      fechaEstimadaDestino: "asc",
    },
  });

  return vehiculosEnvio;
};

export const getCountByEstado = async () => {
  const estadosCount = await prisma.vehiculosEnvio.groupBy({
    by: ["estado"], // Agrupa por el campo estado
    _count: {
      estado: true, // Cuenta la cantidad de cada estado
    },
  });

  const result = estadosCount.map((item) => {
    let nuevoNombre;
    switch (item.estado) {
      case "PTE_PREPARAR":
        nuevoNombre = "Pendiente de preparar";
        break;
      case "PREPARACION":
        nuevoNombre = "En preparación";
        break;
      case "ENVIADO":
        nuevoNombre = "En tránsito";
        break;
    }

    return {
      name: nuevoNombre,
      value: item._count.estado,
    };
  });

  return result;
};

export const getUbicacionesTotal = async () => {
  const ubicaciones = prisma.ubicaciones.findMany({
    where: {
      agenteExterno: false,
    },
    select: {
      id: true,
      nombre: true,
    },
  });
  return ubicaciones;
};

export const getPuestosUsuarios = async () => {
  const usuarios = await prisma.usuarios.findMany();

  return usuarios;
};
