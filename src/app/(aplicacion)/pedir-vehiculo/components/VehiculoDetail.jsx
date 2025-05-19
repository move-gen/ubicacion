import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CocheRojo from "./CocheLottieRojo";
import { estados } from "../../listado-vehiculos/components/components-tabla/estados";
import { Car, Calendar, MapPin, User } from "lucide-react"; // Iconos adicionales
import CocheNaranja from "./CocheLottieNaranja";
export default function VehiculoDetail({ vehiculo }) {
  if (!vehiculo) {
    return <p>Selecciona un vehículo para ver los detalles.</p>;
  }

  let formattedFechaDestino = "Sin fecha";
  if (vehiculo.fechaEstimadaDestino) {
    formattedFechaDestino = format(
      new Date(vehiculo.fechaEstimadaDestino),
      "d 'de' MMMM yyyy",
      { locale: es }
    );
  }

  // Buscar el estado del vehículo en la lista de estados
  const estadoVehiculo = estados.find(
    (estado) => estado.value === vehiculo.estado
  );

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200 relative">
      {/* Animación Lottie más arriba y a la izquierda */}
      <div className="absolute top-[-40px] -right-10 w-36 h-36 z-10">
        {vehiculo.estado === "PTE_PREPARAR" ? (
          <CocheRojo />
        ) : vehiculo.estado === "PREPARACION" ? (
          <CocheNaranja />
        ) : null}
      </div>

      {/* Estado del vehículo con color y ícono */}
      {estadoVehiculo && (
        <div
          className={`absolute top-4 left-0 py-2 px-4 rounded flex items-center bg-gradient-to-r from-colorFondo to-${estadoVehiculo.color
            .split(" ")[0]
            .replace("bg-", "")}`}
        >
          {" "}
          {/* Ícono del estado siempre en negro */}
          <estadoVehiculo.icon className="w-5 h-5 mr-2 text-black" />
          {/* Etiqueta del estado */}
          <span className="text-black">{estadoVehiculo.label}</span>
        </div>
      )}

      {/* Detalles del vehículo */}
      <div className="p-4 mt-16">
        {/* Título en una sola línea */}
        <h2 className="text-xl text-left font-bold mb-4">
          {vehiculo.coche.marca}
        </h2>

        {/* Fecha estimada de destino */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Fecha Estimada de llegada
          </p>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            {formattedFechaDestino}
          </div>
        </div>

        {/* Origen */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-1">Desde</p>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            {vehiculo.ubicacion.nombre}
          </div>
        </div>

        {/* Destino */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-1">Hasta</p>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-blue-500" />
            {vehiculo.ubicacionFinalDestino.nombre}
          </div>
        </div>

        {/* Observaciones */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Observaciones
          </p>
          <p className="text-gray-600">{vehiculo.observaciones || "Ninguna"}</p>
        </div>
      </div>
    </div>
  );
}
