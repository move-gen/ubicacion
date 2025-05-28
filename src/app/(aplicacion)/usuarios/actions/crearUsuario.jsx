"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/db";
export const crearUsuario = async (formData) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const nombre = formData.get("nombre").trim();
  const apellidos = formData.get("apellidos").trim();
  const email = formData.get("email");
  const rol = formData.get("rol");
  const puesto = formData.get("puesto");
  try {
    let id;
    // Usar KINDE_ISSUER_URL de las variables de entorno para la URL base de Kinde
    const kindeDomain = process.env.KINDE_ISSUER_URL;
    const tokenResponse = await fetch(
      `${kindeDomain}/oauth2/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        cache: "no-store",
        body: new URLSearchParams({
          audience: `${kindeDomain}/api`, // La audiencia de la API de gestión de Kinde
          grant_type: "client_credentials",
          client_id: process.env.KINDE_M2M_CLIENT_ID,
          client_secret: process.env.KINDE_M2M_CLIENT_SECRET,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Error actualizando el token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    const inputBody = JSON.stringify({
      profile: {
        given_name: nombre,
        family_name: apellidos,
      },
      organization_code: process.env.ORG_CODE,
      identities: [
        {
          type: "email",
          details: {
            email: email,
          },
        },
      ],
    });

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
    // Usar el access token para obtener la lista de usuarios
    const usersResponse = await fetch(
      `${kindeDomain}/api/v1/user`,
      {
        method: "POST",
        body: inputBody,
        headers: headers,
        cache: "no-store",
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (body) {
        id = body.id;
        if (!id) {
          throw new Error();
        }
      });
    if (rol.includes("administrador-leon")) {
      // Usar el ID del rol de administrador de las variables de entorno
      const adminRoleId = process.env.KINDE_ROLE_ID_ADMIN;
      const body = JSON.stringify({
        role_id: adminRoleId,
      });
      await fetch(
        `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users/${id}/roles`,
        {
          method: "POST",
          body: body,
          headers: headers,
          cache: "no-store",
        }
      );
    }
    if (rol.includes("empleado-generar-qr")) {
      // Usar el ID del rol de empleado de las variables de entorno
      const empleadoQrRoleId = process.env.KINDE_ROLE_ID_EMPLEADO_QR;
      const body = JSON.stringify({
        role_id: empleadoQrRoleId,
      });
      await fetch(
        `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users/${id}/roles`,
        {
          method: "POST",
          body: body,
          headers: headers,
          cache: "no-store",
        }
      );
    }
    console.log(id);
    await prisma.usuarios.create({
      data: {
        job_title: puesto,
        user_id: id,
      },
    });
    revalidatePath("/usuarios");
    return {
      message: nombre + " registrado correctamente",
    };
  } catch (error) {
    return { message: "Error al crear", error: true };
  }
};
