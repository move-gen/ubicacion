// components/SkeletonDonutChart.js
import React from "react";

const SkeletonDonutChart = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-pulse flex items-center justify-center h-40 w-40 bg-gray-200 rounded-full"></div>
      <div className="flex flex-col space-y-2 mt-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
};

export default SkeletonDonutChart;
