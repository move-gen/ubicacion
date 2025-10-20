// app/api/cron-update/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { syncVehicleToA3 } from "@/lib/a3-sync";

// Contraseña secreta para proteger la API
const SECRET_KEY = process.env.API_CRON;

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
    const batchSize = 5; // Procesamos 5 coches por batch
    let lastProcessedId = 0;
    let totalActualizadosConExitoEnEstaEjecucion = 0;
    let cochesIntentadosEnEstaEjecucion = 0;
    const MAX_COCHES_POR_INVOCACION_CRON = 5; // Límite de coches a intentar por ejecución

    console.log(`[CRON_A3] Iniciando. Límite por ejecución: ${MAX_COCHES_POR_INVOCACION_CRON} coches.`);

    while (cochesIntentadosEnEstaEjecucion < MAX_COCHES_POR_INVOCACION_CRON) {
      // Traer un bloque de coches para actualizar
      const cochesParaActualizar = await prisma.coches.findMany({
        where: {
          pendienteA3: true,
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

      if (cochesParaActualizar.length === 0) {
        console.log("[CRON_A3] No más coches pendientes de actualizar en este ciclo.");
        break; 
      }

      for (const coche of cochesParaActualizar) {
        if (cochesIntentadosEnEstaEjecucion >= MAX_COCHES_POR_INVOCACION_CRON) {
            console.log("[CRON_A3] Límite de coches por invocación alcanzado dentro del bucle 'for'.");
            break; 
        }
        cochesIntentadosEnEstaEjecucion++;
        
        try {
          console.log(`[CRON_A3] Procesando (${cochesIntentadosEnEstaEjecucion}/${MAX_COCHES_POR_INVOCACION_CRON}): Matrícula ${coche.matricula}`);

          // Sincronizar con A3 usando el módulo central
          const result = await syncVehicleToA3(
            coche.matricula,
            coche.ubicacion?.nombreA3,
            '[CRON_A3]'
          );

          if (result.success) {
            // Marcar como sincronizado en la BD
            await prisma.coches.update({
              where: { id: coche.id },
              data: {
                pendienteA3: false,
                numeroReintentosA3: 0,
              },
            });

            totalActualizadosConExitoEnEstaEjecucion++;
            console.log(`[CRON_A3] Coche con matrícula ${coche.matricula} sincronizado correctamente con A3.`);
          } else {
            // Incrementar reintentos si falla
            await prisma.coches.update({
              where: { id: coche.id },
              data: {
                numeroReintentosA3: { increment: 1 },
              },
            });
            console.error(`[CRON_A3] Error procesando coche ${coche.matricula}: ${result.error}`);
          }
        } catch (error) {
          console.error(`[CRON_A3] Error inesperado procesando coche ${coche.matricula}: ${error.message}`);
          
          await prisma.coches.update({
            where: { id: coche.id },
            data: {
              numeroReintentosA3: { increment: 1 },
            },
          });
        }

        // Actualizar el último ID procesado
        lastProcessedId = coche.id; 
      } // Fin del bucle for (coches individuales)

      if (cochesIntentadosEnEstaEjecucion >= MAX_COCHES_POR_INVOCACION_CRON) {
        console.log(`[CRON_A3] Límite de ${MAX_COCHES_POR_INVOCACION_CRON} coches intentados en esta invocación alcanzado.`);
        break; // Salir del while si se alcanzó el límite
      }
    } // Fin del bucle while (lotes)

    console.log(`[CRON_A3] Finalizado ciclo de procesamiento. Intentados: ${cochesIntentadosEnEstaEjecucion}, Exitosos en A3: ${totalActualizadosConExitoEnEstaEjecucion}.`);
    return NextResponse.json({
      message: `Cron A3: ${totalActualizadosConExitoEnEstaEjecucion} de ${cochesIntentadosEnEstaEjecucion} coches intentados fueron actualizados con éxito en A3.`,
      intentados: cochesIntentadosEnEstaEjecucion,
      exitosos: totalActualizadosConExitoEnEstaEjecucion
    });
  } catch (error) {
    console.error("[CRON_A3] Error al ejecutar el cron job:", error);

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
