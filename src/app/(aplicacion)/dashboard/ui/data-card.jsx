import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SparkArea from "./spark-area";
import { Suspense } from "react";
import SkeletonSparkAreaChart from "../skeleton/SkeletonSpark";
const DataCardWithGraph = ({
  title,
  chartdata,
  IconComponent,
  value,
  description,
}) => {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <IconComponent className="w-4 h-4" />
      </CardHeader>
      <CardContent className="flex  justify-between items-end">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div>
          <Suspense fallback={<SkeletonSparkAreaChart />}>
            <SparkArea chartdata={chartdata} />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCardWithGraph;
