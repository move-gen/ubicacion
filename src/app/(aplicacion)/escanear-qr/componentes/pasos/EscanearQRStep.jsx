import { useEffect, useRef, useState } from "react";
import QrReader from "../../componentes/QrReader";
import { useStepper } from "@/components/ui/stepper";
import { Button } from "@/components/ui/button";
import AnimacionQREscaneado from "../AnimacionEscaneoQR";

const EscanearQRStep = ({ matricula, updateState }) => {
  const { nextStep } = useStepper();

  const buttonRef = useRef(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const [canRescan, setCanRescan] = useState(true); // Estado para permitir volver a escanear

  useEffect(() => {
    if (matricula && buttonRef.current && canRescan) {
      const parsedMatricula = obtenerMatricula(matricula);
      if (parsedMatricula) {
        setShowAnimation(true);
        setCanRescan(false); // No permitir volver a escanear durante la animación
        setTimeout(() => {
          buttonRef.current.click();
          updateState("matricula", parsedMatricula);
          setShowAnimation(false); // Ocultar animación
          setCanRescan(true); // Permitir volver a escanear
        }, 2000);
      } else {
      }
    }
  }, [matricula, canRescan]);

  function obtenerMatricula(matricula) {
    const regex = /car=([^&]+)/; // Captura los caracteres después de "car=" hasta un "&" o el final de la cadena
    const match = matricula.match(regex);
    return match ? match[1] : null; // Devuelve el grupo capturado o null si no hay coincidencias
  }

  return (
    <div className="flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
      {!showAnimation && canRescan && <QrReader updateState={updateState} />}
      {showAnimation && (
        <>
          <h2 className="text-3xl py-1 font-medium tracking-tight text-center text-colorPrincipal sm:text-4xl relative after:content-[''] after:block after:w-full after:h-1 after:bg-colorPrincipal after:mt-2 after:mx-auto">
            <span className="font-bold">Paso 2:</span> Añada información al
            vehículo
          </h2>
          <AnimacionQREscaneado />
        </>
      )}
      {matricula && (
        <Button ref={buttonRef} onClick={nextStep} className="hidden"></Button>
      )}
    </div>
  );
};

export default EscanearQRStep;
