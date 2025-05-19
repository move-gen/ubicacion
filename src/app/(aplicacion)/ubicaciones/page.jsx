import TablaUbicaciones from "./ui/TablaUbicaciones";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { getUbicaciones } from "@/lib/server-utils";
import AddUbicacion from "./ui/AddUbicacion";
import { Suspense } from "react";
import SkeletonUbicaciones from "./skeleton/SkeletonTablaUbicaciones";
import SkeletonPopupMarkerMap from "./skeleton/SkeletonPopUp";
import dynamicImport from "next/dynamic";

// Establecer la renderización dinámica de la página o componente
export const dynamic = "force-dynamic";

// Importación dinámica del componente solo en el cliente
const PopupMarkerMap = dynamicImport(() => import("./ui/popup-marker-map"), {
  ssr: false,
});

export const metadata = {
  title: "Gestión de ubicaciones",
  description: "Gestión de ubicaciones",
};
export default async function Ubicaciones() {
  const ubicaciones = await getUbicaciones();
  return (
    <div className="flex min-h-screen w-full flex-col animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl w-full">
        <div className="mx-auto max-w-4xl sm:text-center w-full">
          <h2 className="py-10 text-3xl font-medium tracking-tight text-center text-colorPrincipal">
            GESTIÓN DE UBICACIONES
          </h2>
          <p className=" text-lg leading-8 text-center text-gray-600 font-light mb-10">
            Listado de distintas ubicaciones donde se pueden registrar los
            vehículos.
          </p>
        </div>
      </div>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-1">
          <Card
            className="col-span-1 md:col-span-3 lg:col-span-2 xl:col-span-2 shadow-lg"
            x-chunk="dashboard-02-chunk-01"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Ubicaciones</CardTitle>
                <CardDescription>
                  Para añadir una ubicación pulse el botón de la derecha.
                </CardDescription>
              </div>

              <AddUbicacion />
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SkeletonUbicaciones />}>
                <TablaUbicaciones data={ubicaciones} />
              </Suspense>
            </CardContent>
          </Card>
          <Card
            className="col-span-2 md:col-span-4 lg:col-span-1 xl:col-span-1 shadow-lg"
            x-chunk="dashboard-02-chunk-01"
          >
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2 w-full text-center">
                <CardTitle>Mapa de ubicaciones registradas</CardTitle>
                <div className="map-container z-0 mt-4">
                  <Suspense fallback={<SkeletonPopupMarkerMap />}>
                    <PopupMarkerMap ubicaciones={ubicaciones} />
                  </Suspense>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
