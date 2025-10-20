import { Card, CardHeader, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ChevronLeft, RefreshCw, RefreshCwOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import SkeletonPopupMarkerMap from "../../../ubicaciones/skeleton/SkeletonPopUp";
import Link from "next/link";
import TablaUbicaciones from "./componentes/TablaUbicacionesCoche";
import { getUbicacionesVehiculo, getCocheDetails } from "@/lib/server-utils";
import Imagen from "./componentes/Imagen";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Seguro from "./componentes/Seguro";
import ITV from "./componentes/ITV";
import { obtenerDatosAPI } from "@/lib/server-utils";
import TituloVehiculo from "./componentes/TituloVehiculo";
import { notFound } from "next/navigation";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
const PopupMarkerMap = dynamic(() => import("./componentes/Mapa"), {
  ssr: false,
});

export async function generateMetadata({ params }) {
  const detallesCoche = await getCocheDetails(parseInt(params.matricula));
  if (!detallesCoche) {
    notFound();
  }

  return {
    title: `${detallesCoche?.marca}`,
    description: `Información detallada del ${detallesCoche?.matricula}.`,
  };
}

export default async function Coches({ params }) {
  const [ubicacionesCoche, detallesCoche] = await Promise.all([
    getUbicacionesVehiculo(parseInt(params.matricula)),
    getCocheDetails(parseInt(params.matricula)),
    ,
  ]);
  if (!detallesCoche) {
    notFound();
  }

  const datosMovimiento = await obtenerDatosAPI(detallesCoche.matricula);

  const itv = datosMovimiento?.Param5;
  const seguro = datosMovimiento?.Caracteristica3;

  let ultimaUbicacion = null;
  let fechaHoraFormateada = "";

  if (ubicacionesCoche && ubicacionesCoche.length > 0) {
    ultimaUbicacion = await ubicacionesCoche[ubicacionesCoche.length - 1];
    const fecha = new Date(ultimaUbicacion.fechaUbicacion);
    const fechaFormateada = fecha.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const horaFormateada = fecha.toLocaleTimeString("es-ES", {
      timeZone: "Atlantic/Canary",
      hour: "2-digit",
      minute: "2-digit",
    });
    fechaHoraFormateada = `${fechaFormateada} | ${horaFormateada}`;
  }
  const respuestaActualizado =
    ultimaUbicacion.ubicacion.nombre === "Sin Ubicación"
      ? "Escanee el vehículo para sincronizar"
      : detallesCoche.pendienteA3
      ? "Pendiente de sincronización con el A3"
      : "Sincronizado con el A3";
  return (
    <div className="flex min-h-screen w-full flex-col animate-in fade-in duration-500">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-1">
          <Card
            className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 shadow-lg"
            x-chunk="dashboard-02-chunk-01"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="flex items-center">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    size="icon"
                    className="mr-3 bg-colorFondo hover:bg-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <TituloVehiculo
                  marca={detallesCoche.marca}
                  seguro={seguro}
                  itv={itv}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Fecha de ITV
                  </Label>
                  <div className="relative mt-1 text-left">
                    <ITV itv={itv} />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Estado del seguro
                  </Label>
                  <div className="relative mt-1 text-left">
                    <Seguro seguro={seguro} />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Persona
                  </Label>
                  <div className="mt-1">
                    <Input
                      type="text"
                      name="persona"
                      className="font-medium"
                      placeholder={ultimaUbicacion.usuarioRegistro}
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </Label>
                  <div className="mt-1">
                    <Input
                      type="tel"
                      name="telefono"
                      className="font-medium"
                      placeholder={ultimaUbicacion.telefono}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="flex flex-col items-center">
                  <Card className="p-2">
                    <Imagen matricula={detallesCoche.matricula} />
                  </Card>
                  <TooltipProvider>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger>
                        <Card
                          className={`p-2 mt-3 border-2 rounded-md ${
                            ultimaUbicacion.ubicacion.nombre === "Sin Ubicación"
                              ? ""
                              : !detallesCoche.pendienteA3
                              ? "border-green-500"
                              : "border-red-500"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            {ultimaUbicacion.ubicacion.nombre ===
                            "Sin Ubicación" ? (
                              <RefreshCw width={15} height={15} color="black" />
                            ) : !detallesCoche.pendienteA3 ? (
                              <RefreshCw width={15} height={15} color="green" />
                            ) : (
                              <RefreshCwOff
                                width={15}
                                height={15}
                                color="red"
                              />
                            )}

                            {/* Matrícula del vehículo */}
                            <div className="ml-2">
                              {detallesCoche.matricula}
                            </div>
                          </div>
                        </Card>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{respuestaActualizado}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex flex-col items-start justify-center">
                  <div className="w-full">
                    <Label className="block text-sm font-medium text-gray-700">
                      Empresa
                    </Label>
                    <div className="mt-1">
                      <Input
                        type="text"
                        name="empresa"
                        className="font-medium"
                        placeholder={detallesCoche.empresa}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-4 w-full">
                    <Label className="block text-sm font-medium text-gray-700">
                      Última ubicación registrada
                    </Label>
                    <div className="mt-1 text-left">
                      <Input
                        type="text"
                        name="ubicacion"
                        className="font-medium"
                        placeholder={ultimaUbicacion.ubicacion.nombre}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mt-4 w-full">
                    <Label className="block text-sm font-medium text-gray-700">
                      Fecha
                    </Label>
                    <div className="mt-1 text-left">
                      <Input
                        type="text"
                        name="fecha"
                        className="font-medium "
                        placeholder={fechaHoraFormateada}
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              </div>
              <TablaUbicaciones data={ubicacionesCoche} />
            </CardContent>
          </Card>
          <div
            className="col-span-2 md:col-span-4 lg:col-span-1 xl:col-span-1 shadow-lg z-0"
            x-chunk="dashboard-02-chunk-01"
          >
            <Suspense fallback={<SkeletonPopupMarkerMap />}>
              <PopupMarkerMap ubicaciones={ubicacionesCoche} />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
