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
import { eliminarCoche } from "./actions/eliminarCocheAction";
export default function EliminarCoche({ fila }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <X width={15} height={15} color="red" />
            </div>
            Eliminar Coche
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            action={async (formData) => {
              const { message, error } = await eliminarCoche(formData, fila);
              if (error) {
                toast.error(message);
              } else {
                toast.success(message);
              }
            }}
            className="space-y-6 "
          >
            <DialogHeader>
              <DialogTitle>
                ¿Está seguro de que desea eliminar el coche {fila.matricula}?
              </DialogTitle>
              <DialogDescription>
                Una vez eliminado, no se puede volver atrás.
              </DialogDescription>
            </DialogHeader>
            <input value="" className="hidden" name="" />
            <DialogFooter>
              <Button variant="destructive">Eliminar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
