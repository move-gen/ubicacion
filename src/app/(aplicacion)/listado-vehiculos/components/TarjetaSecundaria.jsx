"use client";

import { useMemo } from "react";
import { BarList } from "@tremor/react";
import SkeletonCard from "../../dashboard/skeleton/CardsSkeleton";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Suspense } from "react";

export default function TarjetaSecundaria({ estados }) {
  // Calcular la suma total de los valores en datosZona utilizando useMemo
  const totalValue = useMemo(() => {
    return estados.reduce((acc, item) => acc + item.value, 0);
  }, [estados]);

  return (
    <Card className="col-span-1 sm:col-span-2 md:col-span-1 lg:col-span-2 xl:col-span-2 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Estado de los vehículos</CardTitle>
        <CardDescription>
          Vehículos actualmente pendientes de preparación y envío
        </CardDescription>
        <div>
          <Suspense fallback={<SkeletonCard />}>
            <BarList
              data={estados}
              className="mx-auto"
              showAnimation={true}
              sortOrder="none"
            />
            <div className="flex justify-between mt-4">
              <p className="font-semibold">Total</p>
              <p className="font-semibold">{totalValue}</p>
            </div>
          </Suspense>
        </div>
      </CardHeader>
    </Card>
  );
}
