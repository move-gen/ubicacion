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
import { eliminarUsuario } from "../actions/eliminarUsuario";

export default function EliminarUsuarios({ fila }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <X width={15} height={15} color="red" />
            </div>
            Eliminar Usuario
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            action={async (formData) => {
              const { message, error } = await eliminarUsuario(
                formData,
                fila.id
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
                ¿Está seguro de que desea eliminar al usuario {fila.full_name}?
              </DialogTitle>
              <DialogDescription>
                Una vez eliminado, no se puede volver atrás.
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
