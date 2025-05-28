"use server";

// Se utiliza en el botón de eliminar ubicación dentro de ubicaciones
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";

export const eliminarUsuario = async (formData, id) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  try {
    // Usar KINDE_ISSUER_URL de las variables de entorno para la URL base de Kinde
    const kindeDomain = process.env.KINDE_ISSUER_URL;
    const tokenResponse = await fetch(`${kindeDomain}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        audience: `${kindeDomain}/api`, // La audiencia de la API de gestión de Kinde
        grant_type: "client_credentials",
        client_id: process.env.KINDE_M2M_CLIENT_ID,
        client_secret: process.env.KINDE_M2M_CLIENT_SECRET,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Error actualizando el token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Usar el access token para obtener la lista de usuarios
    const usersResponse = await fetch(
      `${kindeDomain}/api/v1/user?id=${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!usersResponse.ok) {
      const errorBody = await usersResponse.text();
      console.error("Error eliminando usuario de Kinde:", errorBody);
      throw new Error(`Error eliminando usuario de Kinde: ${usersResponse.status} ${usersResponse.statusText}`);
    }

    // Eliminar usuario de la base de datos local
    await prisma.usuarios.delete({
      where: {
        user_id: id,
      },
    });

    revalidatePath("/usuarios");
    return {
      message: "Usuario eliminado correctamente.",
    };
  } catch (error) {
    console.error("Error en la acción eliminarUsuario:", error);
    return { message: "Error al eliminar el usuario.", error: true };
  }
};
