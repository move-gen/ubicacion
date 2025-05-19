"use client";
import { SparkAreaChart } from "@tremor/react";

const SparkArea = ({ chartdata }) => {
  return (
    <SparkAreaChart
      data={chartdata}
      categories={["value"]}
      index={"month"}
      colors={["emerald"]}
      className="h-8 w-20 sm:h-10 sm:w-36"
    />
  );
};

export default SparkArea;
