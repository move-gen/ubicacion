"use client";

import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, CheckCircle, XCircle } from "lucide-react";

export default function MultiplesUbicaciones({ ubicaciones, updateState }) {
  const [selectedUbicacion, setSelectedUbicacion] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  // Manejar la selección de ubicación
  const handleUbicacionChange = (value) => {
    const ubicacionSeleccionada = ubicaciones.find(
      (ubicacion) => ubicacion.id === parseInt(value)
    );
    setSelectedUbicacion(ubicacionSeleccionada);
    setShowDialog(true); // Mostrar diálogo de confirmación
  };

  // Confirmar ubicación seleccionada
  const handleConfirm = () => {
    updateState("ubicacion", selectedUbicacion);
    updateState("multiplesUbicaciones", true);
    setShowDialog(false);
  };
  return (
    <Card className="w-full max-w-2xl mx-auto mt-5 p-6 bg-white shadow-lg rounded-lg">
      {/* Encabezado */}
      <CardHeader className="flex items-center space-x-3">
        <MapPin className="w-8 h-8 text-colorPrincipal" />
        <h2 className="text-2xl font-bold text-colorPrincipal">
          Selecciona la ubicación
        </h2>
      </CardHeader>

      {/* Descripción */}
      <CardContent>
        <p className="text-gray-600 mb-4">
          Selecciona exactamente la ubicación donde se encuentra el vehículo
          para continuar con el proceso.
        </p>

        {/* Select de ubicaciones */}
        <Select onValueChange={handleUbicacionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una ubicación" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Ubicaciones</SelectLabel>
              {ubicaciones.map((ubicacion) => (
                <SelectItem key={ubicacion.id} value={ubicacion.id}>
                  {ubicacion.nombre}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>

      {/* Diálogo de confirmación */}
      {showDialog && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
            <DialogHeader className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
              <DialogTitle className="text-2xl font-semibold text-colorPrincipal">
                ¿Estás en {selectedUbicacion?.nombre}?
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="mt-2 text-center text-gray-600">
              Has seleccionado la ubicación:{" "}
              <strong>{selectedUbicacion?.nombre}</strong>.
              <br />
              Confirma si estás en el lugar correcto para continuar.
            </DialogDescription>

            <div className="flex justify-between mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowDialog(false)}
                className="flex items-center space-x-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                <XCircle className="w-5 h-5" />
                <span>Cancelar</span>
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirm}
                className="flex items-center space-x-2 bg-colorPrincipal text-white hover:bg-colorPrincipal/90"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Confirmar</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
