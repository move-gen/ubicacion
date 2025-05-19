"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { pedirVehiculoAction } from "../../../pedir-vehiculo/actions/pedirVehiculoAction";
import { useState } from "react";
import { Label } from "@/components/ui/label";
import BuscarUbicacionesToggle from "@/app/(aplicacion)/dashboard/componentes/crud/BuscarUbicacionesToggle";
export default function MarcarComoVendido({
  fila,
  ubicacionesFiltradasLogistica,
}) {
  const [ubicacion, setUbicacion] = useState("");
  const handleSubmit = async (e) => {
    if (!ubicacion) {
      toast.error("Debe indicar la ubicación");
      return;
    }

    const formData = new FormData(e.target);

    // Mostrar inmediatamente el loading
    const loadingToastId = toast.loading("Solicitando vehículo...");

    try {
      const { message, error } = await pedirVehiculoAction(
        formData,
        ubicacion,
        fila.matricula
      );

      toast.dismiss(loadingToastId); // Despedir el loading toast

      if (error) {
        toast.error(message); // Mostrar error en caso de fallo
      } else {
        toast.success(message); // Mostrar éxito y cerrar el modal
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Error al solicitar el coche ");
    }
  };
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Ship
              width={15}
              height={15}
              color={fila.vendidoLogistica ? "green" : "red"} // Cambia 'red' por el color deseado
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          {!fila.vendidoLogistica && (
            <form action={handleSubmit} className="space-y-6 ">
              <DialogHeader>
                <DialogTitle>
                  ¿Está seguro de que desea marcar como vendido el vehículo{" "}
                  {fila.matricula}?
                </DialogTitle>
                <DialogDescription>
                  Una vez marcado como vendido y se desea volver atrás hay que
                  eliminarlo en el panel de estado de coches
                </DialogDescription>
              </DialogHeader>
              <input value="" className="hidden" name="" />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ubicacion" className="text-right">
                  Ubicación
                </Label>

                <BuscarUbicacionesToggle
                  ubiTotal={ubicacionesFiltradasLogistica}
                  nombreUbicacion={"Seleccione Ubicación"}
                  onSelect={setUbicacion}
                  className="z-50"
                />
              </div>
              <DialogFooter>
                <Button variant="default" type="submit">
                  Guardar
                </Button>
              </DialogFooter>
            </form>
          )}
          {fila.vendidoLogistica && <p>Vehículo en el panel Estado coches</p>}
        </DialogContent>
      </Dialog>
    </>
  );
}
