"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const modificarUsuario = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }

  const rol = formData.get("rol");
  try {
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
          client_id: process.env.KINDE_CLIENT_ID,
          client_secret: process.env.KINDE_CLIENT_SECRET,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Error actualizando el token");
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    //Miro a ver el rol que tiene asignado el usuario en cuestión
    let rolUsuario;
    let idRolUsuario;
    const userRoles = await fetch(
      `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users/${fila.id}/roles`,
      {
        method: "GET",
        headers: headers,
        cache: "no-store",
      }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (body) {
        if (body.roles && body.roles.length > 0) {
          rolUsuario = body.roles[0].key;
          idRolUsuario = body.roles[0].id;
        } else {
          rolUsuario = ""; // Si 'roles' no tiene elementos, asigna una cadena vacía
        }
      });

    //Si soy administrador o empleado puedo cambiarme entre ellos
    if (rolUsuario) {
      const inputBody = JSON.stringify({
        users: [
          {
            id: fila.id,
            roles: [rol],
          },
        ],
      });
      //Si soy admin o generador y quiero ser escanear debo eliminarme mi permiso
      if (rol.includes("escanear")) {
        const usersResponse = await fetch(
          `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users/${fila.id}/roles/${idRolUsuario}`,
          {
            method: "DELETE",
            headers: headers,
            cache: "no-store",
          }
        )
          .then(function (res) {
            return res.json();
          })
          .then(function (body) {
            if (body.code != "OK") {
              throw new Error();
            }
          });
      } else {
        //En caso de que no quiera ser escanear me actualizo el permiso
        const usersResponse = await fetch(
          `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users`,
          {
            method: "PATCH",
            body: inputBody,
            headers: headers,
            cache: "no-store",
          }
        )
          .then(function (res) {
            return res.json();
          })
          .then(function (body) {
            if (body.code != "OK") {
              throw new Error();
            }
          });
      }
    } else {
      // El usuario no tiene ningún rol (escanear QR)
      let rolAsignado;
      if (rol.includes("administrador")) {
        rolAsignado = process.env.KINDE_ROLE_ID_ADMIN;
      } else if (rol.includes("empleado")) {
        rolAsignado = process.env.KINDE_ROLE_ID_EMPLEADO_QR;
      }
      const bodyPOST = JSON.stringify({
        role_id: rolAsignado,
      });

      // ATENCIÓN: La URL original aquí era "ubicacion-ml.com" sin ".kinde."
      // Asumo que es un typo y debería ser el mismo kindeDomain.
      const userRespuesta = await fetch(
        `${kindeDomain}/api/v1/organizations/${process.env.ORG_CODE}/users/${fila.id}/roles`,
        {
          method: "POST",
          body: bodyPOST,
          headers: headers,
          cache: "no-store",
        }
      )
        .then(function (res) {
          return res.json();
        })
        .then(function (body) {
          if (body.code != "OK") {
            throw new Error();
          }
        });
    }
    revalidatePath("/usuarios");
    return {
      message: "Permiso actualizado correctamente",
    };
  } catch (error) {
    return { message: "Error al actualizar ", error: true };
  }
};
