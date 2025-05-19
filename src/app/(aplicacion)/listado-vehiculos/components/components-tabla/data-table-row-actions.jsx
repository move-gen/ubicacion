"use client";

import { Button } from "@/components/ui/button";
import { Edit, Car, CalendarIcon } from "lucide-react";
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { format, setDefaultOptions } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { estados } from "./estados";
import { modificarCocheLogistica } from "../actions/modificarCocheLogistica";
import BotonEliminar from "./BotonEliminar";
import { ScrollArea } from "@/components/ui/scroll-area";
// Configuración global para el idioma español y que el calendario comience en lunes
setDefaultOptions({
  locale: es,
});

export function DataTableRowActions({ row }) {
  const fila = row.original;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [estado, setEstado] = useState(fila.estado);
  const [observaciones, setObservaciones] = useState(fila.observaciones || "");
  const [fechaFinalizacion, setFechaFinalizacion] = useState(
    fila.fechaEstimadaDestino
  );
  const confirmButtonRef = useRef(null);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleOpenDialogCancelar = () => {
    setIsDialogOpen(false);
  };
  const handleCloseDialog = () => {
    if (estado === "ENVIADO" && !fechaFinalizacion) {
      toast.error(
        "Debe especificarse una fecha de finalización cuando el estado es en Transporte."
      );
      return;
    }
    setIsDialogOpen(false);
  };

  const handleEstadoChange = (newEstado) => {
    setEstado(newEstado);
  };

  const handleFechaChange = (date) => {
    setFechaFinalizacion(date);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar comportamiento predeterminado del formulario
    if (estado === "ENVIADO" && !fechaFinalizacion) {
      return;
    }

    const formData = new FormData(e.target);
    if (confirmButtonRef.current) {
      confirmButtonRef.current.click();
    }
    // Mostrar inmediatamente el loading
    const loadingToastId = toast.loading("Modificando vehículo...");

    try {
      const { message, error } = await modificarCocheLogistica(
        formData,
        fila,
        estado,
        observaciones,
        fechaFinalizacion
      );

      toast.dismiss(loadingToastId); // Despedir el loading toast

      if (error) {
        toast.error(message); // Mostrar error en caso de fallo
      } else {
        toast.success(message); // Mostrar éxito
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Error al modificar el coche");
    }
  };

  return (
    <>
      {/* Botón de Modificar */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors duration-300 text-sm sm:text-base"
          onClick={handleOpenDialog}
        >
          <Edit className="mr-2 h-4 w-4 sm:h-5 sm:w-5" color="black" />
        </Button>
        <BotonEliminar fila={fila} />
      </div>

      {/* Diálogo para modificar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-lg sm:max-w-2xl p-4 sm:p-6 bg-white rounded-2xl shadow-xl">
          {/* ScrollArea envuelve el contenido del formulario */}
          <ScrollArea className="max-h-[80vh] sm:max-h-none">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Header del Diálogo */}
              <DialogHeader className="border-b pb-2 sm:pb-4 mb-2 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="flex items-center mb-2 sm:mb-0">
                    <Car className="h-6 w-6 sm:h-8 sm:w-8 text-colorPrincipal mr-2 sm:mr-3" />
                    <div>
                      <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                        Modificar Vehículo
                      </DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm text-gray-500">
                        Actualiza la información del vehículo, asigna un nuevo
                        estado y añade observaciones.
                      </DialogDescription>
                    </div>
                  </div>
                  {/* Información Principal: Matrícula, Marca y Modelo */}
                  <div className="text-left sm:text-right text-xs sm:text-sm">
                    <p className="font-medium text-gray-700">
                      Matrícula:{" "}
                      <span className="font-semibold text-gray-900">
                        {fila.coche?.matricula || "No disponible"}
                      </span>
                    </p>
                    <p className="font-medium text-gray-700">
                      Marca y Modelo:{" "}
                      <span className="font-semibold text-gray-900">
                        {fila.coche?.marca || "No disponible"}
                      </span>
                    </p>
                  </div>
                </div>
              </DialogHeader>

              {/* Panel Izquierda: Usuario Asignado | Panel Derecha: Fecha de Entrada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
                {/* Usuario Asignado */}
                <div className="bg-gray-50 p-2 sm:p-4 rounded-md shadow">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Asignado por:
                  </label>
                  <p className="mt-1 text-gray-900 font-medium text-xs sm:text-sm">
                    {fila.usuarioAsignado || "Desconocido"}
                  </p>
                </div>
                {/* Fecha de Entrada */}
                <div className="bg-gray-50 p-2 sm:p-4 rounded-md shadow">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700">
                    Fecha de entrada:
                  </label>
                  <p className="mt-1 text-gray-900 font-medium text-xs sm:text-sm">
                    {fila.createdAt
                      ? format(new Date(fila.createdAt), "dd/MM/yyyy", {
                          locale: es,
                        })
                      : "Fecha no disponible"}
                  </p>
                </div>
              </div>

              {/* Selección de Estado Actual */}
              <p className="text-xs sm:text-sm font-medium text-gray-700">
                Seleccione el estado actual del vehículo:
              </p>
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                {estados.map((estadoItem) => {
                  const Icono = estadoItem.icon; // Asigna el icono correspondiente desde el objeto
                  return (
                    <div
                      key={estadoItem.id}
                      className="relative w-full sm:w-1/3"
                    >
                      <div
                        className={`group p-2 sm:p-4 shadow-md transition-shadow rounded-lg cursor-pointer relative overflow-hidden ${
                          estado === estadoItem.value
                            ? "shadow-2xl"
                            : "shadow-md"
                        }`}
                        onClick={() => handleEstadoChange(estadoItem.value)}
                      >
                        {/* Barra superior que muestra color solo si está activo */}
                        <div
                          className={`absolute top-0 left-0 h-1 w-full transition-all duration-300 ${
                            estado === estadoItem.value
                              ? estadoItem.color.split(" ")[0]
                              : "bg-transparent"
                          }`}
                        ></div>

                        <div className="flex flex-row items-center justify-between p-2 sm:p-3">
                          {/* Icono del estado */}
                          <Icono
                            className={`w-5 h-5 sm:w-6 sm:h-6 ${
                              estadoItem.color.split(" ")[1]
                            }`}
                          />
                          <p className="text-sm font-medium text-gray-700 ml-1 sm:ml-2">
                            {estadoItem.label}
                          </p>
                        </div>
                      </div>

                      {/* Badge que muestra 'Seleccionado' si el estado está activo, ubicado debajo de la tarjeta */}
                      {estado === estadoItem.value && (
                        <div className="mt-1 flex justify-center">
                          <span className="text-xs font-semibold text-white bg-blue-800 rounded-full px-2 py-0.5">
                            Seleccionado
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Contenedor del Calendario y Observaciones en la misma fila */}
              <div
                className={`grid gap-2 sm:gap-4 ${
                  estado === "ENVIADO"
                    ? "grid-cols-1 sm:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {/* Observaciones */}
                <div className="p-2 sm:p-4 rounded-md shadow bg-gray-50">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Observaciones:
                  </label>
                  <Textarea
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Añade observaciones..."
                    className="mt-1 w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-xs sm:text-sm"
                  />
                </div>

                {/* Calendario solo activo cuando el estado es "ENVIADO" */}
                {estado === "ENVIADO" && (
                  <div className="p-2 sm:p-4 rounded-md bg-gray-50 shadow flex items-center justify-center">
                    <div className="w-full">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 text-center mb-1 sm:mb-2">
                        Fecha estimada de llegada al destino:
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full pl-2 sm:pl-3 text-left font-normal text-xs sm:text-sm"
                          >
                            {fechaFinalizacion ? (
                              format(fechaFinalizacion, "PPP")
                            ) : (
                              <span>Seleccionar fecha</span>
                            )}
                            <CalendarIcon
                              className="ml-auto h-4 w-4 sm:h-5 sm:w-5 opacity-50"
                              color="blue"
                            />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 z-50"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={fechaFinalizacion}
                            onSelect={handleFechaChange}
                            disabled={{ before: new Date() }} // Permitir solo fechas futuras
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer del Diálogo (Botones de Acción) */}
              <DialogFooter className="mt-4 sm:mt-6 space-y-2 sm:space-y-0 space-x-0 sm:space-x-3 border-t pt-2 sm:pt-4 flex flex-col sm:flex-row">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 transition-colors duration-300 text-xs sm:text-sm w-full sm:w-auto mb-2 sm:mb-0"
                  onClick={handleOpenDialogCancelar}
                  type="button"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  className="bg-blue-600 text-white hover:bg-colorPrincipal transition-colors duration-300 text-xs sm:text-sm w-full sm:w-auto"
                  ref={confirmButtonRef}
                  onClick={handleCloseDialog}
                >
                  Guardar cambios
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
