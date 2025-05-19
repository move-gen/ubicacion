"use client";

import { DonutChart, Legend } from "@tremor/react";

const valueFormatter = (number) =>
  ` ${Intl.NumberFormat("es-ES").format(number).toString() + " coches"}`;

const DonutWithLegend = ({ cochesVenta }) => {
  return (
    <>
      <DonutChart
        data={cochesVenta}
        category="numero"
        index="nombre"
        valueFormatter={valueFormatter}
        colors={["blue", "cyan"]}
      />
      <Legend
        categories={
          cochesVenta.map((item) => item.nombre) || ["En Venta", "No En Venta"]
        }
        colors={["blue", "cyan"]}
        className="max-w-xs"
      />
    </>
  );
};

export default DonutWithLegend;
