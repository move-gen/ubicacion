// app/api/cron-update/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { fetchWithTimeout, retry } from "@/lib/api-utils"; // Importar utilidades

// Contraseña secreta para proteger la API
const SECRET_KEY = process.env.API_CRON;
const apiKey = process.env.API_KEY;

// Método GET para ejecutar el cron job
export async function GET(req) {
  // Verificar que se envió la contraseña correcta
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("x-secure-token");

  if (secret !== SECRET_KEY) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Verificar el estado del cron job
    let cronStatus = await prisma.cronStatus.findFirst();

    if (!cronStatus) {
      // Crear el estado inicial si no existe
      cronStatus = await prisma.cronStatus.create({
        data: {
          isRunning: false,
        },
      });
    }

    // 2. Verificar si el cron job ha estado en ejecución por más de 24 horas
    if (cronStatus.isRunning && cronStatus.startedAt) {
      const elapsedTime = new Date() - new Date(cronStatus.startedAt);
      const oneDayInMs = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

      if (elapsedTime > oneDayInMs) {
        // Si ha pasado más de 24 horas, interrumpir y reiniciar
        console.warn(
          "[WARNING]: El cron job ha estado ejecutándose por más de 24 horas. Reiniciando..."
        );

        await prisma.cronStatus.update({
          where: { id: cronStatus.id },
          data: {
            isRunning: false,
            finishedAt: new Date(),
          },
        });

        return NextResponse.json({
          message: "El cron job ha sido reiniciado automáticamente.",
        });
      }

      // Si aún no han pasado 24 horas, devolver un mensaje de que sigue en ejecución
      return NextResponse.json({
        message: "El cron job sigue en ejecución.",
        startedAt: cronStatus.startedAt,
      });
    }

    // 3. Marcar el cron job como "en ejecución"
    await prisma.cronStatus.update({
      where: { id: cronStatus.id },
      data: {
        isRunning: true,
        startedAt: new Date(),
      },
    });

    console.log("[INFO]: Cron listo para ejecutarse");

    // 4. Ejecutar la lógica del cron job (actualizar coches)
    const batchSize = 1; // Tamaño del bloque reducido para pruebas y evitar timeouts
    let lastProcessedId = 0; // ID del último coche procesado
    let totalActualizados = 0;

    while (true) {
      // Traer un bloque de coches para actualizar
      const cochesParaActualizar = await prisma.coches.findMany({
        where: {
          actualizadoA3: true,
          id: { gt: lastProcessedId },
        },
        take: batchSize,
        select: {
          id: true,
          matricula: true,
          ubicacion: {
            select: {
              nombreA3: true,
            },
          },
        },
      });

      if (cochesParaActualizar.length === 0) break; // Si ya no hay más registros, salimos del bucle

      for (const coche of cochesParaActualizar) {
        try {
          console.log(`Actualizando coche con matrícula: ${coche.matricula}`);

          const url = `http://212.64.162.34:8080/api/articulo/${coche.matricula}`;
          const body = {
            Caracteristica1: coche.ubicacion?.nombreA3,
          };

          // Realizar la solicitud a la API externa con reintentos y timeout
          await retry(async () => {
            const response = await fetchWithTimeout(url, { // Usar la función importada
              method: "PUT",
              headers: {
                APIKEY: apiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(body),
            });
            if (!response.ok) {
              let errorBodyText = "No se pudo leer el cuerpo del error de A3 (posiblemente vacío o error de red).";
              try {
                // Intenta clonar la respuesta para leerla sin consumirla
                const clonedResponse = response.clone(); 
                errorBodyText = await clonedResponse.text();
                if (!errorBodyText) { // Si el texto está vacío
                    errorBodyText = "El cuerpo de la respuesta de error de A3 está vacío.";
                }
              } catch (e) {
                console.warn("Advertencia: No se pudo leer el cuerpo de la respuesta de error de A3.", e.message);
              }
              // Lanza un error más detallado
              throw new Error(`Error al actualizar coche ${coche.matricula} (URL: ${url}) mediante la API. Status: ${response.status}. A3 Response: ${errorBodyText}`);
            }
          });

          // Si fue exitoso, reiniciar los reintentos y marcar como actualizado
          await prisma.coches.update({
            where: { id: coche.id },
            data: {
              actualizadoA3: false,
              numeroReintentosA3: 0,
            },
          });

          totalActualizados++;
          console.log(
            `Coche con matrícula ${coche.matricula} actualizado correctamente.`
          );
        } catch (error) {
          // El error ya debería ser más detallado gracias al throw anterior
          console.error(`Error procesando coche ${coche.matricula}: ${error.message}`);

          // Incrementar los reintentos si falla
          await prisma.coches.update({
            where: { id: coche.id },
            data: {
              numeroReintentosA3: { increment: 1 },
            },
          });
        }

        // Actualizar el último ID procesado
        lastProcessedId = coche.id;
      }
    }

    return NextResponse.json({
      message: `${totalActualizados} coches actualizados correctamente.`,
    });
  } catch (error) {
    console.error("Error al ejecutar el cron job:", error);

    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  } finally {
    // 5. Marcar el cron job como "finalizado"
    await prisma.cronStatus.update({
      where: { id: 1 },
      data: {
        isRunning: false,
        finishedAt: new Date(),
      },
    });

    // Revalidar la caché del dashboard
    revalidatePath("/dashboard");

    console.log("[INFO]: Cron job finalizado correctamente.");
  }
}

// Las funciones fetchWithTimeout y retry se han movido a @/lib/api-utils.js
// y se importan al principio del archivo.
