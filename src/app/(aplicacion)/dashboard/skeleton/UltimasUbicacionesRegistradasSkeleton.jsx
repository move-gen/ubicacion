// components/SkeletonUbicacionesRegistradas.js
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";

const SkeletonUbicacionesRegistradas = () => {
  const skeletonItems = [1, 2, 3, 4]; // Puedes ajustar la cantidad de elementos esqueleto según sea necesario

  return (
    <div className="gap-8 mx-auto max-w-4xl p-4 min-h-screen flex flex-col justify-center">
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className={`flex flex-col items-center md:flex-row md:items-start gap-4 w-full ${
            index !== skeletonItems.length - 1
              ? "border-b border-gray-300 pb-7"
              : ""
          }`}
        >
          <div className="w-full flex justify-center md:w-auto md:justify-start">
            <Avatar>
              <AvatarFallback>
                <MapPin color="#0D47A1" size={24} strokeWidth={1} />
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 grid gap-1 text-center md:text-left">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="flex flex-col items-center md:items-start">
              <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse my-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse my-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse my-1"></div>
              <div className="flex justify-center md:justify-start items-center gap-2 bg-[#F5F6F8] rounded-lg p-3 mt-2 md:mt-0">
                <div className="h-3 bg-gray-200 rounded w-10 animate-pulse"></div>
                <span className="h-3 bg-gray-200 rounded w-8 animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonUbicacionesRegistradas;
