"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import Geolocalizacion from "@/app/(aplicacion)/escanear-qr/componentes/Geolocalizacion";
import SkeletonEscanearQR from "./Skeleton/EscanearQRSkeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Import dinámico de AnimacionQR y Pasos (Stepper), sin SSR y con un loading fallback
const AnimacionQR = dynamic(() => import("./componentes/AnimacionQR"), {
  ssr: false,
  loading: () => (
    <div className="w-16 h-16 animate-pulse bg-gray-200 rounded-full" />
  ),
});

const Pasos = dynamic(() => import("./componentes/Stepper"), {
  ssr: false,
  // Aquí podrías reutilizar SkeletonEscanearQR o crear otro skeleton
  loading: () => <SkeletonEscanearQR />,
});

export default function EscanearQR() {
  const { isLoading } = useKindeBrowserClient();
  const [showStepper, setShowStepper] = useState(false);
  const [ubicacionInicialDelUsuario, setUbicacionInicialDelUsuario] = useState({
    longitud: 0,
    latitud: 0,
  });

  const startScan = () => {
    setShowStepper(true);
  };

  if (isLoading) {
    return <SkeletonEscanearQR />;
  }

  return (
    <div className="animate-in fade-in duration-300">
      {showStepper && (
        // Pasos se cargará sólo cuando showStepper sea true
        <Pasos ubicacionInicialDelUsuario={ubicacionInicialDelUsuario} />
      )}

      <div className="mx-auto mt-5 max-w-2xl sm:text-center flex flex-col items-center">
        {!showStepper && (
          <>
            <h2 className="text-3xl py-1 font-medium tracking-tight text-colorPrincipal sm:text-4xl">
              ESCANEAR QR
            </h2>
            <p className="mt-6 text-lg leading-8 font-light text-center text-gray-600 mb-2">
              Acepte los permisos de ubicación y cámara para proceder a
              registrar la ubicación del vehículo.
            </p>
            <div
              onClick={
                ubicacionInicialDelUsuario.latitud !== 0 ? startScan : undefined
              }
            >
              {/* AnimacionQR se carga dinámicamente y muestra un pulso mientras */}
              <AnimacionQR />
            </div>
          </>
        )}

        <Geolocalizacion
          setUbicacionInicialDelUsuario={setUbicacionInicialDelUsuario}
        />

        {ubicacionInicialDelUsuario.latitud === 0 && (
          <div className="flex items-center text-red-500 mb-5">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 mr-2">
              <X className="text-white" />
            </div>
            Compruebe si tiene activa la ubicación en su teléfono para poder
            comenzar. Cierre el navegador y vuelva a abrir la página.
          </div>
        )}

        {!showStepper && ubicacionInicialDelUsuario.latitud !== 0 && (
          <footer className="w-full flex justify-center mt-2 pb-2">
            <Button
              onClick={startScan}
              className="flex justify-center items-center bg-colorClaro hover:bg-colorPrincipal text-white font-bold py-3 px-4 rounded"
            >
              Empezar escaneo
            </Button>
          </footer>
        )}
      </div>
    </div>
  );
}
