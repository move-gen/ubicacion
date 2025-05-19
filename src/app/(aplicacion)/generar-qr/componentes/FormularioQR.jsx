// app/(aplicacion)/generar-qr/FormularioQR.js
"use client";

import { useState } from "react";
import QRCode from "qrcode";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { crearQR } from "@/app/(aplicacion)/generar-qr/actions/crearQR";
import PrintableArea from "./PrintableArea";
import { Input } from "@/components/ui/input";
import FAQ from "../componentes/FAQ";
export default function FormularioQR() {
  const [src, setSrc] = useState(undefined);
  const [mostrarImpresion, setMostrarImpresion] = useState(false);
  const [permitirGenerar, setPermitirGenerar] = useState(false);
  const [data, setData] = useState({
    matricula: "",
  });

  const generate = async () => {
    try {
      if (!data.matricula) {
        toast.error("Por favor, ingrese la matrícula.");
        return;
      }
      if (!permitirGenerar) {
        toast.error("Compruebe que el formato sea correcto");
        return;
      }
      QRCode.toDataURL(
        `https://ubicacion.miguelleon.es/?car=${data.matricula.trim()}`,
        {
          errorCorrectionLevel: "H",
          scale: 15,
        }
      ).then(setSrc);
    } catch (error) {
      toast.error("Error al generar");
    }
    setMostrarImpresion(true);
  };

  const handleInputChange = (e) => {
    let cleanedValue = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();
    let permitirGenerar = false;

    if (/^[0-9]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 7);
      if (
        cleanedValue.length === 7 &&
        /^[0-9]{4}[A-Z]{3}$/.test(cleanedValue)
      ) {
        permitirGenerar = true;
      }
    } else if (/^[A-Z]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 8);
      if (cleanedValue.length === 8) {
        permitirGenerar = true;
      } else {
        permitirGenerar = false;
      }
    }

    setData({ ...data, matricula: cleanedValue });
    setPermitirGenerar(permitirGenerar);
    setMostrarImpresion(false);
  };

  return (
    <div className="flex flex-col lg:flex-row p-8 sm:p-10 lg:flex-auto items-center justify-center">
      <div className="lg:w-1/2 flex flex-col items-center">
        <div>
          <label className="block text-sm font-medium leading-6 text-gray-900">
            <h3 className="text-2xl font-bold text-centertracking-tight text-center mb-5 text-gray-900">
              Matrícula
            </h3>
            <p className="text-base leading-7 font-light mb-5 text-gray-600">
              Introduzca la matrícula del vehículo y pulse en Generar QR
            </p>
          </label>
          <div>
            <form
              action={async (formData) => {
                if (permitirGenerar) {
                  const { message, error } = await crearQR(formData);
                  if (error) {
                    toast.error(message);
                  } else {
                    toast.success(message);
                    generate();
                  }
                }
              }}
              className="space-y-6"
            >
              <Input
                className="placeholder:italic placeholder:text-slate-400 block mb-10 bg-white w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
                type="text"
                name="matricula"
                required
                placeholder="1111AAA"
                onChange={handleInputChange}
                value={data.matricula}
              />
              <Button
                type="submit"
                className="generarQRBoton mt-10 block w-full rounded-md bg-colorClaro px-3 py-2 text-center text-sm font-semibold text-white shadow-sm transition-transform duration-300 transform hover:scale-105 hover:bg-colorPrincipal"
              >
                Generar QR
              </Button>
              <FAQ />
            </form>
          </div>
        </div>
      </div>
      <div className="lg:w-1/2 flex justify-center mt-2">
        <PrintableArea
          src={src}
          mostrarImpresion={mostrarImpresion}
          permitirGenerar={permitirGenerar}
          data={data}
        />
      </div>
    </div>
  );
}
