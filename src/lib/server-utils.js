import "server-only";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache"; // Necesario para getCombinedCochesData
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"; // Necesario para obtenerDatosAPI
import { redirect } from "next/navigation"; // Necesario para obtenerDatosAPI

// --- Función getPuestosUsuarios (Versión corregida y estabilizada) ---
export const getPuestosUsuarios = async () => {
  console.log("SRV_LOG: lib/server-utils.js - Llamando a getPuestosUsuarios...");
  try {
    const puestos = await prisma.Usuarios.findMany({
        select: {
            user_id: true,
            job_title: true
        }
    });
    const resultado = puestos || [];
    console.log(`SRV_LOG: lib/server-utils.js - getPuestosUsuarios devolvió array. Longitud: ${resultado.length}`);
    return resultado;
  } catch (error) {
    console.error("SRV_LOG: lib/server-utils.js - Error crítico al obtener puestos de usuarios (getPuestosUsuarios):", error);
    return [];
  }
};

// --- Función getUsuarios (Versión corregida y estabilizada con M2M y verificaciones M2M) ---
export const getUsuarios = async () => {
  console.log("SRV_LOG: lib/server-utils.js - Llamando a getUsuarios...");
  try {
    const kindeDomain = process.env.KINDE_ISSUER_URL;
    if (!kindeDomain) {
      console.error("SRV_LOG: lib/server-utils.js - KINDE_ISSUER_URL no está configurada.");
      throw new Error("KINDE_ISSUER_URL no está configurada en las variables de entorno.");
    }
    if (!process.env.KINDE_M2M_CLIENT_ID) throw new Error("KINDE_M2M_CLIENT_ID no está configurada.");
    if (!process.env.KINDE_M2M_CLIENT_SECRET) throw new Error("KINDE_M2M_CLIENT_SECRET no está configurada.");
    if (!process.env.ORG_CODE) throw new Error("ORG_CODE no está configurada.");

    console.log("SRV_LOG: lib/server-utils.js - getUsuarios: Solicitando token a Kinde...");
    const tokenResponse = await fetch(`${kindeDomain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
      body: new URLSearchParams({
        audience: `${kindeDomain}/api`,
        grant_type: "client_credentials",
        client_id: process.env.KINDE_M2M_CLIENT_ID,
        client_secret: process.env.KINDE_M2M_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("SRV_LOG: lib/server-utils.js - getUsuarios: Respuesta de error del token de Kinde:", errorBody);
      throw new Error(`Error obteniendo token de Kinde: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    console.log("SRV_LOG: lib/server-utils.js - getUsuarios: Token de Kinde obtenido.");

    console.log("SRV_LOG: lib/server-utils.js - getUsuarios: Solicitando usuarios a Kinde API...");
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
      const errorBody = await usersResponse.text();
      console.error("SRV_LOG: lib/server-utils.js - getUsuarios: Respuesta de error al obtener usuarios de Kinde:", errorBody);
      throw new Error(`Error obteniendo usuarios de Kinde: ${usersResponse.status} ${usersResponse.statusText}`);
    }

    const usersData = await usersResponse.json();
    console.log("SRV_LOG: lib/server-utils.js - getUsuarios: Usuarios de Kinde obtenidos.");

    const puestosUsuarios = await getPuestosUsuarios();

    const jobTitleMap = new Map();
    if (Array.isArray(puestosUsuarios)) {
        puestosUsuarios.forEach((puesto) => {
          jobTitleMap.set(puesto.user_id, puesto.job_title);
        });
    }

    const kindeUsersArray = usersData.organization_users || [];
    const usuariosCombinados = kindeUsersArray.map((usuario) => ({
      id: usuario.id,
      email: usuario.email,
      roles: usuario.roles || [],
      full_name: usuario.full_name,
      job_title: jobTitleMap.get(usuario.id) || "Sin puesto asignado",
    }));
    
    console.log(`SRV_LOG: lib/server-utils.js - getUsuarios devolvió array combinado. Longitud: ${usuariosCombinados.length}`);
    return usuariosCombinados;

  } catch (error) {
    console.error("SRV_LOG: lib/server-utils.js - Error crítico en getUsuarios:", error.message, error.stack);
    return [];
  }
};

// --- Nuevas funciones integradas ---

export const getCombinedCochesData = async () => {
  try {
    console.log("SRV_LOG: Llamando a getCombinedCochesData...");
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
    revalidatePath("/dashboard"); // Considerar si esta revalidación es siempre necesaria aquí
    console.log("SRV_LOG: getCombinedCochesData completado.");
    return {
      coches,
      ultimosCincoCoches,
      cochesVenta,
      ubicacionesTotal,
      cochesTransito,
    };
  } catch (error) {
    console.error("SRV_LOG: Error en getCombinedCochesData:", error);
    return { coches: [], ultimosCincoCoches: [], cochesVenta: [], ubicacionesTotal: [], cochesTransito: 0 };
  }
};

export const getCochesZona = async () => {
  try {
    console.log("SRV_LOG: Llamando a getCochesZona...");
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
    console.log("SRV_LOG: getCochesZona completado.");
    return result;
  } catch (error) {
    console.error("SRV_LOG: Error en getCochesZona:", error);
    return [];
  }
};

export const getUbicaciones = async () => {
  try {
    console.log("SRV_LOG: Llamando a getUbicaciones...");
    const ubicaciones = await prisma.ubicaciones.findMany();
    console.log(`SRV_LOG: getUbicaciones devolvió ${ubicaciones ? ubicaciones.length : 'null/undefined'} ubicaciones.`);
    return ubicaciones;
  } catch (error) {
    console.error("SRV_LOG: Error en getUbicaciones:", error);
    return [];
  }
};

export const getUbicacionesVehiculo = async (idCoche) => {
  try {
    console.log(`SRV_LOG: Llamando a getUbicacionesVehiculo para idCoche: ${idCoche}...`);
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
          select: { // Corregido el select incompleto
            nombre: true,
            latitud: true,
            longitud: true,
          },
        },
      },
    });
    console.log("SRV_LOG: getUbicacionesVehiculo completado.");
    return ubicaciones;
  } catch (error) {
    console.error("SRV_LOG: Error en getUbicacionesVehiculo:", error);
    return [];
  }
};

export const getCocheDetails = async (idCoche) => {
  try {
    console.log(`SRV_LOG: Llamando a getCocheDetails para idCoche: ${idCoche}...`);
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
    console.log("SRV_LOG: getCocheDetails completado.");
    return cocheDetails;
  } catch (error) {
    console.error("SRV_LOG: Error en getCocheDetails:", error);
    return null;
  }
};

export const obtenerDatosAPI = async (matricula) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    // En lugar de redirect, que no funciona en Route Handlers o funciones server-side puras,
    // podríamos devolver un error o un objeto indicando no autorizado.
    // Por ahora, mantendré el redirect si esto se llama desde un Server Component / Action context.
    // Si se llama desde una API route, esto podría necesitar un manejo diferente.
    console.warn("SRV_LOG: obtenerDatosAPI - Usuario no autenticado intentando acceder.");
    redirect("/login"); 
  }
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("SRV_LOG: obtenerDatosAPI - API_KEY no está configurada.");
    throw new Error("API_KEY no está configurada.");
  }
  try {
    console.log(`SRV_LOG: Llamando a obtenerDatosAPI para matricula: ${matricula}...`);
    const response = await fetch(
      `http://10.0.64.131:8080/api/articulo/${matricula}?externalFields=false`,
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
        console.warn(`SRV_LOG: obtenerDatosAPI - Vehículo no encontrado para matricula: ${matricula}`);
        // Devolver null o un objeto específico en lugar de lanzar error directamente
        // para que el llamador pueda manejarlo.
        return { error: "Vehículo no encontrado", status: 404 };
      } else {
        const errorText = await response.text();
        console.error(`SRV_LOG: obtenerDatosAPI - Error en la conexión: ${response.status}`, errorText);
        return { error: `Error en la conexión: ${response.status}`, status: response.status };
      }
    }
    const data = await response.json();
    console.log("SRV_LOG: obtenerDatosAPI completado.");
    return data;
  } catch (error) {
    console.error("SRV_LOG: Error en obtenerDatosAPI:", error);
    return { error: error.message || "Error desconocido en la API externa" };
  }
};

export const getVehiculosEnvioGestion = async () => {
  try {
    console.log("SRV_LOG: Llamando a getVehiculosEnvioGestion...");
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
    console.log("SRV_LOG: getVehiculosEnvioGestion completado.");
    return vehiculosEnvio;
  } catch (error) {
    console.error("SRV_LOG: Error en getVehiculosEnvioGestion:", error);
    return [];
  }
};

export const getVehiculosEnvioComercial = async () => {
  try {
    console.log("SRV_LOG: Llamando a getVehiculosEnvioComercial...");
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
    console.log("SRV_LOG: getVehiculosEnvioComercial completado.");
    return vehiculosEnvio;
  } catch (error) {
    console.error("SRV_LOG: Error en getVehiculosEnvioComercial:", error);
    return [];
  }
};

export const getCountByEstado = async () => {
  try {
    console.log("SRV_LOG: Llamando a getCountByEstado...");
    const estadosCount = await prisma.vehiculosEnvio.groupBy({
      by: ["estado"],
      _count: {
        estado: true,
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
        default:
          nuevoNombre = item.estado; // Mantener el estado original si no hay mapeo
      }

      return {
        name: nuevoNombre,
        value: item._count.estado,
      };
    });
    console.log("SRV_LOG: getCountByEstado completado.");
    return result;
  } catch (error) {
    console.error("SRV_LOG: Error en getCountByEstado:", error);
    return [];
  }
};

export const getUbicacionesTotal = async () => {
  try {
    console.log("SRV_LOG: Llamando a getUbicacionesTotal...");
    const ubicaciones = await prisma.ubicaciones.findMany({
      where: {
        agenteExterno: false,
      },
      select: {
        id: true,
        nombre: true,
      },
    });
    console.log("SRV_LOG: getUbicacionesTotal completado.");
    return ubicaciones;
  } catch (error) {
    console.error("SRV_LOG: Error en getUbicacionesTotal:", error);
    return [];
  }
};
