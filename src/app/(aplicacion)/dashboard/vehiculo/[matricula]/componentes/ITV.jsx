import { Input } from "@/components/ui/input";
import { CircleCheck, Ban } from "lucide-react";
import { obtenerFechaITV } from "@/lib/funciones";

export default function ITV({ itv }) {
  const fechaITV = obtenerFechaITV(itv);
  const diasRestantes = fechaITV ? calcularDiasRestantes(fechaITV) : null;
  const mostrarColor = fechaITV >= new Date();
  return (
    <>
      <Input
        type="text"
        name="itv"
        className={`font-medium pl-10 border ${
          mostrarColor ? "border-green-500" : "border-red-500"
        }`}
        readOnly
        placeholder={
          mostrarColor
            ? `Quedan ${diasRestantes} días (${itv})`
            : `Sin ITV (${itv})`
        }
      />

      {mostrarColor ? (
        <CircleCheck
          color="green"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        />
      ) : (
        <Ban
          color="red"
          className="absolute left-2 top-1/2 transform -translate-y-1/2"
        />
      )}
    </>
  );
}

const calcularDiasRestantes = (fecha) => {
  const hoy = new Date();
  const diferenciaTiempo = fecha - hoy; // Diferencia en milisegundos
  const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)); // Convertir a días
  return diasRestantes;
};
