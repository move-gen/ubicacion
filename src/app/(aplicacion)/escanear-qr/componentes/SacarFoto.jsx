import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { Camera, Repeat2, SwitchCamera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStepper } from "@/components/ui/stepper";

export default function SacarFoto({ foto, updateState }) {
  const { nextStep } = useStepper();
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");

  const videoConstraints = {
    facingMode: facingMode,
    width: 800,
    height: 600,
  };

  const capture = useCallback(() => {
    const foto = webcamRef.current.getScreenshot();
    updateState("foto", foto);
  }, [webcamRef, updateState]);

  const switchCamera = () => {
    setFacingMode((prevMode) =>
      prevMode === "environment" ? "user" : "environment"
    );
  };

  return (
    <>
      {foto ? (
        <div className="flex flex-col items-center">
          <img src={foto} alt="Foto del vehículo" />
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => updateState("foto", null)}
              className="w-full z-0 border-2 border-blue-200 text-black hover:bg-blue-200 hover:text-black"
            >
              <Repeat2 className="mr-2 h-4 w-4" />
              Retomar
            </Button>
            <Button
              onClick={nextStep}
              className="w-full bg-colorPrincipal border-2 hover:bg-blue-700 px-10"
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : (
        <div className="">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            screenshotQuality={1}
            forceScreenshotSourceSize={true}
            imageSmoothing={false}
          />

          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-4">
            <Button
              onClick={capture}
              className="bg-blue-900 hover:bg-colorPrincipal text-white font-bold py-2 px-4 rounded-full"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capturar
            </Button>
            <button
              className="p-2 bg-white rounded-full shadow-lg flex items-center justify-center"
              onClick={switchCamera}
            >
              <SwitchCamera size={24} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
