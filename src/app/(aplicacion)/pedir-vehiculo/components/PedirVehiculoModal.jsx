"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import BuscarUbicacionesToggle from "@/app/(aplicacion)/dashboard/componentes/crud/BuscarUbicacionesToggle";
import { pedirVehiculoAction } from "../actions/pedirVehiculoAction";

export default function SolicitarVehiculo({ ubicaciones }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [matricula, setMatricula] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const confirmButtonRef = useRef(null);

  const handleOpenDialogCancelar = () => {
    setIsDialogOpen(false);
  };

  const handleInputChange = (e) => {
    let cleanedValue = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    if (/^[0-9]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 7);
    } else if (/^[A-Z]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 8);
    }
    setMatricula(cleanedValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar comportamiento predeterminado del formulario
    if (!matricula) {
      toast.error("Debe indicar la matrícula");
      return;
    }
    if (!ubicacion) {
      toast.error("Debe indicar la ubicación");
      return;
    }

    const formData = new FormData(e.target);
    if (confirmButtonRef.current) {
      confirmButtonRef.current.click();
    }
    // Mostrar inmediatamente el loading
    const loadingToastId = toast.loading("Solicitando vehículo...");

    try {
      const { message, error } = await pedirVehiculoAction(
        formData,
        ubicacion,
        matricula
      );

      toast.dismiss(loadingToastId); // Despedir el loading toast

      if (error) {
        toast.error(message); // Mostrar error en caso de fallo
      } else {
        toast.success(message); // Mostrar éxito y cerrar el modal
        setIsDialogOpen(false); // Cerrar el diálogo en caso de éxito
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Error al solicitar el coche ");
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="text-black bg-none border-r bg-white hover:underline hover:bg-slate-400"
          onClick={() => setIsDialogOpen(true)}
        >
          <div className="mr-3">
            <CirclePlus width={15} height={15} />
          </div>
          Pedir vehículo
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="relative">
          <DialogTitle className="text-center p-4 flex items-center justify-center">
            Solicitar un vehículo
          </DialogTitle>
          <DialogDescription className="text-center">
            Introduzca la matrícula del vehículo para realizar la solicitud a
            logística
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="matricula" className="text-right">
              Matrícula
            </Label>

            <Input
              id="matricula"
              name="matricula"
              value={matricula}
              onChange={handleInputChange}
              placeholder="Introduzca la matrícula..."
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ubicacion" className="text-right">
              Ubicación
            </Label>

            <BuscarUbicacionesToggle
              ubiTotal={ubicaciones}
              nombreUbicacion={"Seleccione Ubicación"}
              onSelect={setUbicacion}
              className="z-50"
            />
          </div>

          <DialogFooter className=" mt-6">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleOpenDialogCancelar}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              ref={confirmButtonRef}
              className="bg-colorPrincipal w-full"
            >
              Solicitar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
