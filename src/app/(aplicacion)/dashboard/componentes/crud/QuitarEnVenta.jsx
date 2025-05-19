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
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { quitarEnVenta } from "./actions/quitarEnVenta";
export default function QuitarEnVenta({ fila }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <Delete width={15} height={15} color="gray" />
            </div>
            Quitar de la venta
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form
            action={async (formData) => {
              const { message, error } = await quitarEnVenta(formData, fila);
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
                ¿Está seguro de que deseas quitarlo de la venta?
              </DialogTitle>
              <DialogDescription>
                Una vez quitado de la venta, tienes que volver a introducir una
                url para volverlo a poner en venta.
              </DialogDescription>
            </DialogHeader>
            <input value="" className="hidden" name="" />
            <DialogFooter>
              <Button variant="destructive">Quitar de la venta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
