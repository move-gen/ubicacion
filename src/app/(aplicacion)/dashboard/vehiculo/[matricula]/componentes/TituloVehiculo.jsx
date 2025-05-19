import { CardTitle } from "@/components/ui/card";
import { CircleCheck, Ban } from "lucide-react";
import { obtenerFechaITV } from "@/lib/funciones";

export default function TituloVehiculo({ marca, seguro, itv }) {
  const fechaITV = obtenerFechaITV(itv);
  return (
    <>
      {fechaITV >= new Date() && seguro !== "NO MOVER" && seguro ? (
        <CircleCheck color="green" className="mr-1" />
      ) : (
        <Ban color="red" className="mr-1" />
      )}
      <CardTitle className="mr-1">{marca}</CardTitle>
    </>
  );
}
