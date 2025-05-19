import { Globe, Car, Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UbicacionesRegistradas from "./componentes/UbicacionesRegistradas";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import CardPrincipal from "./componentes/CardPrincipal";
import { CardSecundaria } from "./componentes/CardSecundaria";
import DonutWithLegend from "./ui/donut-with-legend";
import { BarListChart } from "./ui/bar-list-chart";
import { chartdata } from "./constant";
import DataCardWithGraph from "./ui/data-card";
import {
  getCombinedCochesData,
  getCochesZona,
  getUbicacionesTotal,
} from "@/lib/server-utils";
import { Suspense } from "react";
import SkeletonDataTable from "./skeleton/DataTableSkeleton";
import CardPrincipalSkeleton from "./skeleton/CardPrincipalSkeleon";
import DonutWithLegendSkeleton from "./skeleton/DonutSkeleton";
import SkeletonUbicacionesRegistradas from "./skeleton/UltimasUbicacionesRegistradasSkeleton";
import SkeletonCard from "./skeleton/CardsSkeleton";
import { DataTable } from "./componentes/components-tabla/data-table";
import columns from "./componentes/components-tabla/columns";
import ExportButton from "./componentes/DescargaListadoCoches";
export const metadata = {
  title: "Panel de localizador de vehículos",
  description: "Localizador de vehículos",
};

export const dynamic = "force-dynamic";

async function fetchData() {
  const { getUser } = getKindeServerSession();

  const [combinedDataResult, userResult] = await Promise.allSettled([
    getCombinedCochesData(),
    getUser(),
  ]);

  const combinedData =
    combinedDataResult.status === "fulfilled" ? combinedDataResult.value : null;
  const user = userResult.status === "fulfilled" ? userResult.value : null;

  return { combinedData, user };
}

export default async function Dashboard() {
  const { combinedData, user } = await fetchData();
  const datosZona = await getCochesZona();
  const ubicacionesFiltradasLogistica = await getUbicacionesTotal();
  if (!combinedData) {
    return <div>Actualice la página para obtener los datos</div>;
  }

  const {
    coches,
    ultimosCincoCoches,
    cochesVenta,
    ubicacionesTotal,
    cochesTransito,
  } = combinedData;
  const dataCards = [
    {
      title: "Preparación",
      chartdata,
      IconComponent: Wrench,
      value: cochesVenta[1].numero,
      description: "coches en preparación",
    },
    {
      title: "En venta",
      chartdata,
      IconComponent: Globe,
      value: cochesVenta[0].numero,
      description: "coches publicados",
    },
    {
      title: "Tránsito",
      chartdata,
      IconComponent: Car,
      value: cochesTransito,
      description: "vehículos en tránsito",
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 ">
          <Suspense fallback={<CardPrincipalSkeleton />}>
            <CardPrincipal user={user} />
          </Suspense>
          <CardSecundaria actualizadoA3={true} />
          <Suspense fallback={<SkeletonCard />}>
            {dataCards.map((dataCard, index) => (
              <DataCardWithGraph key={index} {...dataCard} />
            ))}
          </Suspense>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 animate-in fade-in duration-300">
          <Card className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1 overflow-hidden shadow-lg">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2 w-full">
                <CardTitle>Localizador de coches</CardTitle>
                <CardDescription>
                  Gráfico sobre los coches en venta y en preparación
                </CardDescription>
                <span className="mt-2 flex items-center w-full justify-center flex-col gap-6">
                  <Suspense fallback={<DonutWithLegendSkeleton />}>
                    <DonutWithLegend cochesVenta={cochesVenta} />
                  </Suspense>
                </span>
              </div>
            </CardHeader>
          </Card>
          <Card className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Vehículos por zonas</CardTitle>
              <CardDescription>
                Número de vehículos en cada ubicación
              </CardDescription>
              <div>
                <Suspense fallback={<SkeletonCard />}>
                  <BarListChart datosZona={datosZona} />
                </Suspense>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 animate-in fade-in duration-300">
          <Card className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-2 shadow-lg">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Localizador de coches</CardTitle>
                <CardDescription>
                  Encuentre la ubicación de los vehículos
                </CardDescription>
              </div>
              <ExportButton data={coches} />
            </CardHeader>
            <CardContent>
              <Suspense fallback={<SkeletonDataTable />}>
                <DataTable
                  data={coches}
                  columns={columns}
                  ubiTotal={ubicacionesTotal}
                  ubicacionesFiltradasLogistica={ubicacionesFiltradasLogistica}
                />
              </Suspense>
            </CardContent>
          </Card>
          <Card className="col-span-1 flex justify-center items-center min-h-screen sm:col-span-2 md:col-span-1 lg:col-span-1 xl:col-span-1 overflow-hidden shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl mb-1 text-center">
                Últimos vehículos escaneados
              </CardTitle>
              <Suspense fallback={<SkeletonUbicacionesRegistradas />}>
                <UbicacionesRegistradas coches={ultimosCincoCoches} />
              </Suspense>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
