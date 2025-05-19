"use client";
import React, { useMemo, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Car } from "lucide-react";

export default function VehiculosCard({
  vehiculos,
  selectedDate,
  onVehiculoClick,
  selectedVehiculo,
}) {
  const dateRefs = useRef({});

  // Filtrar vehículos con y sin fecha estimada de destino
  const vehiculosConFecha = useMemo(() => {
    return vehiculos.filter((vehiculo) => vehiculo.fechaEstimadaDestino); // Solo vehículos con fecha
  }, [vehiculos]);

  const vehiculosSinFecha = useMemo(() => {
    return vehiculos.filter((vehiculo) => !vehiculo.fechaEstimadaDestino); // Vehículos sin fecha
  }, [vehiculos]);

  // Agrupar los vehículos por fecha
  const groupedVehiculos = useMemo(() => {
    return vehiculosConFecha.reduce((groups, vehiculo) => {
      const fechaDestino = format(
        new Date(vehiculo.fechaEstimadaDestino),
        "yyyy-MM-dd"
      );

      if (!groups[fechaDestino]) {
        groups[fechaDestino] = [];
      }
      groups[fechaDestino].push(vehiculo);
      return groups;
    }, {});
  }, [vehiculosConFecha]);

  // Obtener las fechas ordenadas
  const sortedDates = useMemo(
    () => Object.keys(groupedVehiculos),
    [groupedVehiculos]
  );

  useEffect(() => {
    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
      const ref = dateRefs.current[formattedSelectedDate];
      if (ref && ref.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [selectedDate]);

  return (
    <Card className="h-full p-3 mt-2">
      <ScrollArea className="h-full">
        <CardContent className="h-56">
          <div className="space-y-6">
            {/* Mostrar vehículos sin fecha al inicio si existen */}
            {vehiculosSinFecha.length > 0 && (
              <div key="sin-fecha">
                <div className="mb-4">
                  <h2 className="text-normal font-light">
                    Vehículos sin fecha asignada
                  </h2>
                </div>
                <div className="space-y-4">
                  {vehiculosSinFecha.map((vehiculo) => (
                    <Card
                      key={vehiculo.id}
                      className={`group shadow-sm cursor-pointer transition-colors duration-300 ${
                        selectedVehiculo && selectedVehiculo.id === vehiculo.id
                          ? "bg-colorPrincipal text-white" // Vehículo seleccionado
                          : "hover:bg-colorPrincipal" // Efecto hover solo en el fondo
                      }`}
                      onClick={() => onVehiculoClick(vehiculo)} // Manejar clic en vehículo
                    >
                      <CardHeader className="flex justify-between items-center">
                        <div className="flex items-center">
                          {/* Icono del coche */}
                          <Car
                            size={40}
                            className={`transition-colors duration-300 ${
                              selectedVehiculo &&
                              selectedVehiculo.id === vehiculo.id
                                ? "text-white" // Cuando está seleccionado
                                : "text-gray-500 group-hover:text-white" // Por defecto gris, cambia a blanco en hover
                            }`}
                          />

                          {/* Divisor vertical */}
                          <div
                            className={`border-l mx-4 h-10 transition-colors duration-300 ${
                              selectedVehiculo &&
                              selectedVehiculo.id === vehiculo.id
                                ? "border-white" // Cuando está seleccionado
                                : "border-gray-300 group-hover:border-white" // Por defecto gris, cambia a blanco en hover
                            }`}
                          ></div>

                          {/* Contenido a la derecha del divisor */}
                          <div>
                            <div
                              className={`text-lg font-semibold transition-colors duration-300 ${
                                selectedVehiculo &&
                                selectedVehiculo.id === vehiculo.id
                                  ? "text-white" // Cuando está seleccionado
                                  : "text-black group-hover:text-white" // Por defecto negro, cambia a blanco en hover
                              }`}
                            >
                              {vehiculo.coche.matricula}
                            </div>
                            <div
                              className={`text-sm transition-colors duration-300 ${
                                selectedVehiculo &&
                                selectedVehiculo.id === vehiculo.id
                                  ? "text-white" // Cuando está seleccionado
                                  : "text-gray-600 group-hover:text-white" // Por defecto gris, cambia a blanco en hover
                              }`}
                            >
                              {vehiculo.coche.marca}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar vehículos con fecha agrupados por fecha */}
            {sortedDates.length > 0 ? (
              sortedDates.map((date) => {
                const vehiculosForDate = groupedVehiculos[date];

                const formattedDate = format(new Date(date), "d 'de' MMMM", {
                  locale: es,
                });

                if (!dateRefs.current[date]) {
                  dateRefs.current[date] = React.createRef();
                }

                return (
                  <div key={date} ref={dateRefs.current[date]}>
                    {/* Cabecera de Fecha */}
                    <div className="mb-4">
                      <h2 className="text-normal font-light">
                        {formattedDate}
                      </h2>
                    </div>
                    {/* Lista de Vehículos para la Fecha */}
                    <div className="space-y-4">
                      {vehiculosForDate.map((vehiculo) => (
                        <Card
                          key={vehiculo.id}
                          className={`group shadow-sm cursor-pointer transition-colors duration-300 ${
                            selectedVehiculo &&
                            selectedVehiculo.id === vehiculo.id
                              ? "bg-colorPrincipal text-white" // Vehículo seleccionado
                              : selectedDate &&
                                format(
                                  new Date(vehiculo.fechaEstimadaDestino),
                                  "yyyy-MM-dd"
                                ) === format(selectedDate, "yyyy-MM-dd")
                              ? "bg-blue-200 text-black" // Resaltar vehículos de la fecha seleccionada, texto no blanco
                              : "hover:bg-colorPrincipal" // Efecto hover solo en el fondo
                          }`}
                          onClick={() => onVehiculoClick(vehiculo)} // Manejar clic en vehículo
                        >
                          <CardHeader className="flex justify-between items-center">
                            <div className="flex items-center">
                              {/* Icono del coche */}
                              <Car
                                size={40}
                                className={` transition-colors duration-300 ${
                                  selectedVehiculo &&
                                  selectedVehiculo.id === vehiculo.id
                                    ? "text-white" // Cuando está seleccionado
                                    : "text-gray-500 group-hover:text-white" // Por defecto gris, cambia a blanco en hover
                                }`}
                              />

                              {/* Divisor vertical */}
                              <div
                                className={`border-l mx-4 h-10 transition-colors duration-300 ${
                                  selectedVehiculo &&
                                  selectedVehiculo.id === vehiculo.id
                                    ? "border-white" // Cuando está seleccionado
                                    : "border-gray-300 group-hover:border-white" // Por defecto gris, cambia a blanco en hover
                                }`}
                              ></div>

                              {/* Contenido a la derecha del divisor */}
                              <div>
                                <div
                                  className={`text-lg font-semibold transition-colors duration-300 ${
                                    selectedVehiculo &&
                                    selectedVehiculo.id === vehiculo.id
                                      ? "text-white" // Cuando está seleccionado
                                      : selectedDate &&
                                        format(
                                          new Date(
                                            vehiculo.fechaEstimadaDestino
                                          ),
                                          "yyyy-MM-dd"
                                        ) === format(selectedDate, "yyyy-MM-dd")
                                      ? "text-black" // Cuando tiene el fondo azul suave, texto negro
                                      : "text-black group-hover:text-white" // Por defecto negro, cambia a blanco en hover
                                  }`}
                                >
                                  {vehiculo.coche.matricula}
                                </div>
                                <div
                                  className={`text-sm transition-colors duration-300 ${
                                    selectedVehiculo &&
                                    selectedVehiculo.id === vehiculo.id
                                      ? "text-white" // Cuando está seleccionado
                                      : selectedDate &&
                                        format(
                                          new Date(
                                            vehiculo.fechaEstimadaDestino
                                          ),
                                          "yyyy-MM-dd"
                                        ) === format(selectedDate, "yyyy-MM-dd")
                                      ? "text-gray-600" // Texto gris cuando el fondo es azul suave
                                      : "text-gray-600 group-hover:text-white" // Por defecto gris, cambia a blanco en hover
                                  }`}
                                >
                                  {vehiculo.coche.marca}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : vehiculosConFecha.length > 0 || vehiculosSinFecha.length > 0 ? (
              // Aquí iría el contenido que muestra los vehículos con fecha o sin fecha
              <>{/* Mostrar los vehículos */}</>
            ) : (
              <p>No hay vehículos disponibles.</p>
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}
