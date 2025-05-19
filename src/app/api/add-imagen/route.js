import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export async function POST(request) {
  const { isAuthenticated } = getKindeServerSession();
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
  const data = await request.json();
  const { matricula, foto } = data;
  if (!foto) {
    return NextResponse.json(
      { message: "No se ha añadido la imagen del vehículo" },
      { status: 400 }
    );
  }

  // Extraer datos base64
  const matches = foto.match(/^data:image\/jpeg;base64,(.+)$/);
  if (!matches) {
    return NextResponse.json(
      { message: "Utilice otro navegador porque no es compatible" },
      { status: 500 }
    );
  }
  const base64Data = matches[1];
  const buffer = Buffer.from(base64Data, "base64");
  try {
    await prisma.coches.update({
      where: {
        matricula: matricula,
      },
      data: {
        updatedAt: new Date(),
        imagen: buffer,
      },
    });

    revalidatePath("/dashboard");
    return NextResponse.json({
      message: "Vehículo " + matricula + " registrado correctamente ",
    });
  } catch (error) {
    console.log("error " + error);
    return NextResponse.json(
      {
        message: "Ha ocurrido un error al guardar la foto ",
      },
      {
        status: 500,
      }
    );
  }
}
