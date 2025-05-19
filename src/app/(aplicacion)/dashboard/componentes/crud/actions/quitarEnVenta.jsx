"use server";

// Se utiliza en la tabla de eliminar coche dentro del dashboard
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
export const quitarEnVenta = async (formData, fila) => {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  try {
    const ubicaciones = await prisma.coches.update({
      where: {
        id: fila.id,
      },
      data: {
        enVenta: false,
        url: "",
      },
    });

    revalidatePath("/dashboard");
    return {
      message: "Quitado de la venta",
    };
  } catch (error) {
    return { message: "Error al quitar de la venta ", error: true };
  }
};
