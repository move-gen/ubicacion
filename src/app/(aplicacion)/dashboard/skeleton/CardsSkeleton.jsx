// components/skeleton/SkeletonCard.js
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SkeletonCard = () => {
  return (
    <Card className="shadow-lg animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </CardTitle>
        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
      </CardHeader>
      <CardContent className="flex justify-between items-end">
        <div>
          <div className="h-6 bg-gray-300 rounded w-16 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-32"></div>
        </div>
        <div className="h-8 w-20 sm:h-10 sm:w-36 bg-gray-300 rounded-lg"></div>
      </CardContent>
    </Card>
  );
};

export default SkeletonCard;
