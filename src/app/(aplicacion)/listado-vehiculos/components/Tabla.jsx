import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
  CardTitle,
} from "@/components/ui/card";
import { Suspense } from "react";
import SkeletonDataTable from "../../dashboard/skeleton/DataTableSkeleton";
import { DataTable } from "./components-tabla/data-table";
import { getVehiculosEnvioGestion } from "@/lib/server-utils";

export default async function Tabla() {
  const vehiculosEnvio = await getVehiculosEnvioGestion();
  return (
    <Card className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-2 shadow-lg">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Listado de vehículos</CardTitle>
          <CardDescription>
            Modifique los estados de los vehículos y márquelos para envio
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<SkeletonDataTable />}>
          <DataTable data={vehiculosEnvio} />
        </Suspense>
      </CardContent>
    </Card>
  );
}
