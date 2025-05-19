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
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { eliminarUbicacion } from "./actions/eliminarUbicacion";
export default function EliminarUbicacion({ fila }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <X width={15} height={15} color="red" />
            </div>
            Eliminar Ubicacion
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            action={async (formData) => {
              const { message, error } = await eliminarUbicacion(
                formData,
                fila
              );
              if (error) {
                toast.error(message);
              } else {
                toast.success(message);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>
                ¿Está seguro de que desea eliminar la ubicación {fila.nombre}?
              </DialogTitle>
              <DialogDescription>
                Una vez eliminado, no se puede volver atrás. Los registros que
                estén asignados se reasignarán a Sin Ubicación
              </DialogDescription>
            </DialogHeader>
            <input name="input" value="" className="hidden"></input>
            <DialogFooter>
              <Button variant="destructive">Eliminar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
