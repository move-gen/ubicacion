// Pasos.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Step, Stepper } from "@/components/ui/stepper";
import EscanearQRStep from "./pasos/EscanearQRStep";
import SacarFotoStep from "./pasos/SacarFotoStep";
import { Camera, QrCode, UserRoundPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import AddEncargadoStep from "./pasos/AddEncargadoStep";
import NavigationButton from "./pasos/BotonNavegacion";
import AnimacionFoto from "./AnimacionFoto";
import Error from "./Error";
import MultiplesUbicaciones from "./pasos/MultiplesUbicaciones";

// Definimos los pasos de forma reutilizable
const steps = [
  { label: "Escanear QR", icon: QrCode },
  { label: "Añadir encargado", icon: UserRoundPlus },
  { label: "Sacar foto", icon: Camera },
];

export default function Pasos({ ubicacionInicialDelUsuario }) {
  // Estado inicial con múltiples propiedades relacionadas con el flujo del formulario
  const [state, setState] = useState({
    matricula: null,
    llevarAlTaller: false,
    foto: null,
    personaEncargada: null,
    telefono: null,
    taller: null,
    kilometros: "",
    showAnimation2: false,
    respuesta: null,
    estadoSeguroITV: null,
    ubicacion: null,
    errores: [],
    ubicaciones: [],
    multiplesUbicaciones: false,
    isButtonVisible: false,
  });

  // Helper para actualizar el estado
  const updateState = useCallback((key, value) => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  }, []);

  // Desestructuración del estado
  const { respuesta, errores } = state;

  // ✅ Función para obtener las ubicaciones asociadas a una ubicación inicial
  useEffect(() => {
    const fetchUbicaciones = async () => {
      if (!ubicacionInicialDelUsuario) return;

      try {
        const res = await fetch(
          `/api/obtener-ubicaciones?ubicacion=${encodeURIComponent(
            JSON.stringify(ubicacionInicialDelUsuario)
          )}`
        );

        if (!res.ok) {
          throw new Error("Error al obtener las ubicaciones.");
        }

        const response = await res.json();
        updateState("ubicaciones", response);
        //Si es un único resultado, lo establecemos como ubicación
        if (response.length === 1) {
          updateState("ubicacion", response[0]);
        }
      } catch (error) {
        updateState("errores", [
          ...errores,
          "Hay un error con la ubicación de su dispositivo. Compruebe la localización y vuelva a intentarlo.",
          "En caso de repetirse el error, por favor contacte con administración.",
        ]);
      }
    };

    fetchUbicaciones();
  }, []);

  useEffect(() => {
    const actualizarPrimeraParte = async () => {
      try {
        const res = await fetch("/api/escanear-qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            matricula: state.matricula,
            ubicacion: state.ubicacion,
            taller: state.taller,
            personaEncargada: state.personaEncargada,
            telefono: state.telefono,
            kilometros: state.kilometros,
          }),
        });
        const response = await res.json();
        if (res.ok) {
          updateState("respuesta", response.ok); //Respuesta 0 => todo bien, 1 => error
        } else {
          updateState("respuesta", 1);
          updateState("errores", [...errores, response.message]);
        }
      } catch (error) {
        console.error("Error actualizar el vehículo:", error);
        updateState("errores", [...errores, "Error al actualizar el vehículo"]);
      }
    };
    if (state.showAnimation2) {
      actualizarPrimeraParte(state);
      const timer = setTimeout(() => {
        updateState("showAnimation2", false);
      }, 1000);

      return () => clearTimeout(timer); // Limpiamos el temporizador
    }
  }, [state.showAnimation2]);
  const hasErrors = Object.keys(state.errores).length > 0;

  // ✅ Render principal
  return (
    <div className="flex w-full flex-col gap-4 py-2">
      <Stepper
        initialStep={0}
        steps={steps}
        styles={{
          "step-button-container": cn(
            "data-[current=true]:border-colorClaro data-[current=true]:bg-blue-50",
            "data-[active=true]:bg-colorPrincipal data-[active=true]:border-colorPrincipal"
          ),
          "horizontal-step":
            "data-[completed=true]:[&:not(:last-child)]:after:bg-colorPrincipal",
        }}
      >
        {/* Paso 1: Escanear QR */}
        <Step key={steps[0].label} {...steps[0]}>
          <EscanearQRStep
            matricula={state.matricula}
            updateState={updateState}
          />
        </Step>

        {/* Paso 2: Añadir encargado y verificar ubicaciones múltiples */}

        <Step key={steps[1].label} {...steps[1]}>
          {hasErrors ? (
            <Error
              errores={state.errores}
              onContinue={() => {
                updateState("errores", []);
                updateState("llevarAlTaller", false);
              }}
            />
          ) : state.ubicaciones.length > 1 && !state.multiplesUbicaciones ? (
            <MultiplesUbicaciones
              ubicaciones={state.ubicaciones}
              updateState={updateState}
            />
          ) : (
            <AddEncargadoStep
              matricula={state.matricula}
              updateState={updateState}
              state={state}
            />
          )}
        </Step>

        {/* Paso 3: Sacar foto */}
        <Step key={steps[2].label} {...steps[2]}>
          {respuesta === 1 ? (
            <Error errores={state.errores} />
          ) : state.showAnimation2 ? (
            <div className="flex flex-col items-center justify-center my-2 border bg-secondary text-primary rounded-md p-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
              <h2 className="text-3xl py-1 font-medium tracking-tight text-center text-colorPrincipal sm:text-4xl relative after:content-[''] after:block after:w-full after:h-1 after:bg-colorPrincipal after:mt-2 after:mx-auto">
                <span className="font-bold">Paso 3:</span> Saque una foto al
                vehículo
              </h2>
              <AnimacionFoto />
            </div>
          ) : hasErrors ? (
            <Error errores={state.errores} />
          ) : (
            <SacarFotoStep foto={state.foto} updateState={updateState} />
          )}
        </Step>

        {/* Botón de navegación */}
        <NavigationButton state={state} updateState={updateState} />
      </Stepper>
    </div>
  );
}
