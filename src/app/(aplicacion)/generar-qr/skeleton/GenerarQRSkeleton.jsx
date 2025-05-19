// components/SkeletonGenerarQR.js
import React from "react";

const SkeletonGenerarQR = () => {
  return (
    <div className="py-10 sm:py-10 animate-pulse">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="mt-6 h-6 bg-gray-200 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="mx-auto mt-16 max-w-2xl bg-gray-100 rounded-3xl ring-1 shadow-lg ring-gray-200 sm:mt-20 lg:mx-0 lg:flex lg:max-w-none">
          <div className="p-8 sm:p-10 lg:flex-auto">
            <div>
              <div className="block text-sm font-medium leading-6 text-gray-900">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              </div>
              <div className="mt-2 space-y-6">
                <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonGenerarQR;
