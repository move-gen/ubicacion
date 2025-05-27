import "server-only";
import prisma from "@/lib/db";
// Quita revalidatePath y getKindeServerSession si no se usan en OTRAS funciones de este archivo
// que quieras mantener de tu commit abd738fec...
// import { revalidatePath } from "next/cache";
// import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

// --- Mantén tus OTRAS funciones de server-utils.js como estaban en el commit abd738fec... ---
// Ejemplo:
// export const getCombinedCochesData = async () => { ... }
// export const getCochesZona = async () => { ... }
// etc.

// --- Función getPuestosUsuarios con try...catch ---
export const getPuestosUsuarios = async () => {
  console.log("SRV_LOG: lib/server-utils.js - Llamando a getPuestosUsuarios...");
  try {
    // Asegúrate que el modelo se llama 'Usuarios' en tu schema.prisma y tiene los campos user_id y job_title
    // Si tu tabla se llama 'User' y el id de Kinde se guarda como 'kinde_id', ajusta esto:
    // const puestos = await prisma.User.findMany({ select: { kinde_id: true, job_title: true }});
    const puestos = await prisma.Usuarios.findMany({ // Usando "Usuarios" como en tu schema
        select: {
            user_id: true, // El ID del usuario de Kinde (ej. 'kp_...')
            job_title: true
        }
    });
    const resultado = puestos || [];
    console.log(`SRV_LOG: lib/server-utils.js - getPuestosUsuarios devolvió array. Longitud: ${resultado.length}`);
    return resultado;
  } catch (error) {
    console.error("SRV_LOG: lib/server-utils.js - Error crítico al obtener puestos de usuarios (getPuestosUsuarios):", error);
    return []; // Siempre devuelve un array vacío en caso de error
  }
};

// --- Función getUsuarios con try...catch y logging ---
export const getUsuarios = async () => {
  console.log("SRV_LOG: lib/server-utils.js - Llamando a getUsuarios...");
  try {
    const kindeDomain = process.env.KINDE_ISSUER_URL;
    if (!kindeDomain) {
      console.error("SRV_LOG: lib/server-utils.js - KINDE_ISSUER_URL no está configurada.");
      throw new Error("KINDE_ISSUER_URL no está configurada en las variables de entorno.");
    }
    // Añade verificaciones similares para KINDE_CLIENT_ID, KINDE_CLIENT_SECRET, ORG_CODE si es necesario
    if (!process.env.KINDE_CLIENT_ID) throw new Error("KINDE_CLIENT_ID no está configurada.");
    if (!process.env.KINDE_CLIENT_SECRET) throw new Error("KINDE_CLIENT_SECRET no está configurada.");
    if (!process.env.ORG_CODE) throw new Error("ORG_CODE no está configurada.");


    console.log("SRV_LOG: lib/server-utils.js - getUsuarios: Solicitando token a Kinde...");
    const tokenResponse = await fetch(`${kindeDomain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      cache: "no-store",
      body: new URLSearchParams({
        audience: `${kindeDomain}/api`,
        grant_type: "client_credentials",
        client_id: process.env.KINDE_CLIENT_ID,
        client_secret: process.env.KINDE_CLIENT_SECRET,
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

    const puestosUsuarios = await getPuestosUsuarios(); // Llama a la función con try-catch

    const jobTitleMap = new Map();
    if (Array.isArray(puestosUsuarios)) {
        puestosUsuarios.forEach((puesto) => {
          jobTitleMap.set(puesto.user_id, puesto.job_title); // Asegúrate que 'user_id' y 'job_title' son los nombres correctos de tu tabla 'Usuarios'
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
    console.error("SRV_LOG: lib/server-utils.js - Error crítico en getUsuarios:", error.message);
    // No solo error.message, loguea el error completo si es posible, o al menos su stack si está disponible.
    // console.error(error); // Descomenta para ver el objeto de error completo
    return []; // Siempre devuelve un array vacío en caso de error
  }
};

// --- Asegúrate de que el resto de funciones en este archivo sean las de tu commit abd738fec... ---
// --- o que también tengan manejo de errores si hacen llamadas a BD/API ---