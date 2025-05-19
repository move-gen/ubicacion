"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/dist/server/api-utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const modificarPuesto = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const puesto = formData.get("puesto");
  try {
    await prisma.usuarios.update({
      where: {
        user_id: fila.id,
      },
      data: {
        job_title: puesto,
      },
    });
    revalidatePath("/usuarios");
    return {
      message: "Puesto actualizado correctamente",
    };
  } catch (error) {
    return { message: "Error al actualizar ", error: true };
  }
};
