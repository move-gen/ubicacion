import React from "react";
import Image from "next/image";
import Link from "next/link";

const SkeletonSidebar = () => {
  return (
    <div className="md:w-60 bg-white h-screen flex-1 fixed hidden md:flex">
      <div className="flex flex-col space-y-6 w-full animate-pulse">
        <Link
          href="/"
          className="flex flex-row items-center justify-center w-full h-12"
        >
          <Image
            src="/images/mllogo.png"
            width={165}
            height={24}
            priority
            alt="Logo Miguel León"
            className="flex-shrink-0 drop-shadow-lg"
          />
        </Link>
        <div className="flex flex-col space-y-2 md:px-6">
          {Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="flex flex-row items-center p-2 px-4 rounded-lg bg-gray-100"
            >
              <div className="w-6 h-6 bg-gray-200 rounded-md"></div>
              <div className="ml-4 h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonSidebar;
