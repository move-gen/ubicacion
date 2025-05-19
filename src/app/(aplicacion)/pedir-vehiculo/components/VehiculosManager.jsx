"use client";
import React, { useState, useMemo, useEffect } from "react";
import CalendarCard from "./CalendarComponent"; // Componente de calendario
import VehiculosCard from "./VehiculosCard"; // Componente que ahora maneja los vehículos
import VehiculoDetail from "./VehiculoDetail"; // Componente para los detalles del vehículo
import { Search } from "lucide-react"; // Ícono de búsqueda

export default function VehiculosManager({ vehiculos }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVehiculo, setSelectedVehiculo] = useState(null); // Estado para el vehículo seleccionado
  const [searchQuery, setSearchQuery] = useState(""); // Estado para el término de búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery); // Estado con debounce

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedVehiculo(null); // Resetear vehículo seleccionado al cambiar la fecha
  };

  const handleVehiculoClick = (vehiculo) => {
    setSelectedVehiculo(vehiculo); // Establecer el vehículo seleccionado
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300); // 300 ms de retraso

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Filtrar vehículos basados en el término de búsqueda con debounce
  const filteredVehiculos = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return vehiculos;
    }
    const lowerCaseQuery = debouncedSearch.toLowerCase();
    return vehiculos.filter((vehiculo) =>
      [
        vehiculo.coche.marca,
        vehiculo.coche.matricula,
        vehiculo.estado,
        vehiculo.ubicacion.nombre,
        vehiculo.ubicacionFinalDestino.nombre,
      ].some((field) => field.toLowerCase().includes(lowerCaseQuery))
    );
  }, [debouncedSearch, vehiculos]);

  return (
    <div className="flex flex-col md:grid md:grid-cols-3 gap-4">
      <div className="h-full">
        <CalendarCard
          onDateSelect={handleDateSelect}
          vehiculos={vehiculos}
          selectedDate={selectedDate}
        />
      </div>
      <div className="h-full flex flex-col">
        {/* Campo de búsqueda con ícono */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar vehículos..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Buscar vehículos"
          />
        </div>
        {/* Mostrar mensaje si no hay vehículos filtrados */}
        {filteredVehiculos.length === 0 ? (
          <p className="text-center text-gray-500">
            No se encontraron vehículos.
          </p>
        ) : (
          <VehiculosCard
            vehiculos={filteredVehiculos} // Pasar vehículos filtrados
            selectedDate={selectedDate}
            onVehiculoClick={handleVehiculoClick} // Manejador de clics en el vehículo
            selectedVehiculo={selectedVehiculo} // Vehículo seleccionado
          />
        )}
      </div>
      <div className="h-full">
        <VehiculoDetail vehiculo={selectedVehiculo} />{" "}
      </div>
    </div>
  );
}
