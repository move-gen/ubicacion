// NavigationButton.jsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { useStepper } from "@/components/ui/stepper";
import QRescaneado from "@/app/(aplicacion)/escanear-qr/componentes/QREscaneado";
import ErrorEscaneo from "../ErrorLottie";
import QREsperar from "../QREsperar";
import toast from "react-hot-toast";
import Error from "../Error";

const NavigationButton = ({ state, updateState }) => {
  const { resetSteps, hasCompletedAllSteps } = useStepper();
  const { matricula, foto } = state;

  // ✅ Estado para controlar la carga y los errores
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Función para enviar los datos a la API
  const handleUpload = async () => {
    setLoading(true); // Iniciamos el estado de carga

    try {
      const res = await fetch("/api/add-imagen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matricula,
          foto,
        }),
      });

      const response = await res.json();
      if (res.ok) {
        toast.success(response.message || "Vehículo añadido correctamente");
        updateState("uploadError", false);
        updateState("isButtonVisible", true);
      } else {
        updateState("errores", response.message);
        throw new Error();
      }
    } catch (error) {
      toast.error(error.message || "Ha ocurrido un error");
      updateState("uploadError", true);
    } finally {
      setLoading(false); // Terminamos el estado de carga
    }
  };

  // ✅ Ejecuta la función de subida de datos cuando se complete el último paso
  useEffect(() => {
    if (hasCompletedAllSteps) {
      handleUpload();
    }
  }, [hasCompletedAllSteps]);

  // ✅ Función para resetear los pasos
  const handleReset = () => {
    resetSteps();
    updateState("isButtonVisible", false);
    window.location.reload(); // 🔄 Recargamos la página al reiniciar
  };
  const hasErrors = Object.keys(state.errores).length > 0;

  return (
    <div>
      {/* 🕒 Pantalla de espera mientras se realiza la carga */}
      <>
        {loading && (
          <div className="flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
            <h2 className="text-3xl py-1 font-medium tracking-tight text-center text-colorPrincipal sm:text-4xl">
              Añadiendo vehículo
            </h2>
            <h3 className="mt-2 text-center">
              Por favor espere. No actualice la página
            </h3>
            <QREsperar />
          </div>
        )}
        {/* ✅ Pantalla de éxito */}
        {!loading &&
          hasCompletedAllSteps &&
          !state.uploadError &&
          state.isButtonVisible && (
            <div className="flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
              <h2 className="text-3xl py-1 font-medium tracking-tight text-center text-colorPrincipal sm:text-4xl">
                Vehículo añadido <div className="font-bold">correctamente</div>
              </h2>
              <QRescaneado />
            </div>
          )}
        {/* ⚠️ Pantalla de error */}
        {!loading && hasCompletedAllSteps && state.uploadError && hasErrors && (
          <Error errores={state.error} />
        )}
        {/* 🆕 Botón para escanear un nuevo vehículo */}
        <div className="w-full flex justify-center gap-2 mt-4">
          {!loading &&
            hasCompletedAllSteps &&
            !state.uploadError &&
            state.isButtonVisible && (
              <Button
                size="sm"
                onClick={handleReset}
                className="bg-colorClaro hover:bg-colorPrincipal"
              >
                <CirclePlus className="mr-2 h-4 w-4" />
                Escanear nuevo vehículo
              </Button>
            )}
        </div>
      </>
    </div>
  );
};

export default NavigationButton;
