"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import printDiv from "@/lib/imprimir-qr";
import { Button } from "@/components/ui/button";

// Import dinámico de tu animación Lottie, sin SSR
const AnimacionGenerarQR = dynamic(() => import("./AnimacionGenerarQR"), {
  ssr: false,
  loading: () => (
    <div className="h-48 flex items-center justify-center">
      <div className="w-24 h-24 bg-gray-200 rounded-md animate-pulse" />
    </div>
  ),
});

export default function PrintableArea({
  src,
  mostrarImpresion,
  permitirGenerar,
  data,
}) {
  return (
    <div className="printableArea justify-center flex flex-col items-center animate-in fade-in duration-500">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xs text-center">
        <div>
          <Image
            width={196}
            height={28}
            src="/images/mllogo.png"
            alt="Logo"
            className="mx-auto"
          />
        </div>

        {mostrarImpresion && permitirGenerar ? (
          <img
            width={188}
            height={188}
            className="mx-auto mb-4"
            src={src}
            alt="Generated QR Code"
          />
        ) : (
          <div className="animate-in fade-in duration-500">
            <AnimacionGenerarQR />
          </div>
        )}

        <p className="matricula border border-gray-300 p-4 bg-white rounded-lg mb-4">
          {data.matricula}
        </p>

        {permitirGenerar && mostrarImpresion && (
          <div className="flex justify-center">
            <Button
              className="botonImprimir block w-48 rounded-md bg-colorPrincipal p-3 text-sm font-semibold text-white shadow-sm hover:bg-colorClaro focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => printDiv(".printableArea")}
            >
              Imprimir QR
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
