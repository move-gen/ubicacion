const SkeletonEscanearQR = () => {
  return (
    <div className="bg-gray-50 py-10 sm:py-10 animate-pulse">
      <div className="mx-auto max-w-2xl sm:text-center flex flex-col items-center">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3 mx-auto mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
        <div className="h-48 w-48 bg-gray-200 rounded mb-6"></div>
        <div className="w-full flex justify-center mt-2 pb-2">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonEscanearQR;
