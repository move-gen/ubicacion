"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar"; // Asegúrate de que este es el componente de calendario correcto
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

export default function CalendarCard({
  onDateSelect,
  vehiculos,
  selectedDate,
}) {
  // Manejar la selección de fecha
  const handleDateChange = (date) => {
    onDateSelect(date);
  };

  // Verificar si hay vehículos programados para una fecha dada
  const hasVehiculo = (date) =>
    vehiculos.some(
      (vehiculo) =>
        format(new Date(vehiculo.fechaEstimadaDestino), "yyyy-MM-dd") ===
        format(date, "yyyy-MM-dd")
    );

  // Mostrar un indicador si hay vehículos en esa fecha
  const renderVehiculoIndicator = (date) => {
    if (hasVehiculo(date)) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="absolute w-8 h-8 border-2 border-red-500 rounded-full"></span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full shadow-md md:-mt-5">
      <CardHeader className="flex items-start justify-between">
        <div className="flex items-center">
          <CalendarIcon className="mr-2" /> {/* Ícono del calendario */}
          <CardTitle className="text-xl font-semibold">Calendario</CardTitle>
        </div>
        <p className="text-xs">
          Selecciona una fecha para ver los vehículos pendientes de entrega.
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center w-full">
          <Card className="shadow-md">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              locale={es}
              className="w-full max-w-xs md:max-w-md h-auto" // Ajuste de tamaño
              components={{
                DayContent: ({ date }) => (
                  <div className="relative w-full h-20 flex flex-col items-center justify-center">
                    {hasVehiculo(date) ? (
                      <div className="relative">
                        <span className="text-md font-medium z-10">
                          {format(date, "d")}
                        </span>
                        {renderVehiculoIndicator(date)}
                      </div>
                    ) : (
                      <span className="text-md font-medium">
                        {format(date, "d")}
                      </span>
                    )}
                  </div>
                ),
              }}
            />
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
