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

import { User2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { modificarPuesto } from "../actions/modificarPuesto";
import { useState } from "react";
export default function ModificarUsuario({ fila }) {
  const [puesto, setPuesto] = useState(fila.job_title);
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <User2 width={15} height={15} />
            </div>
            Modificar Puesto
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{fila.full_name}</DialogTitle>

            <DialogDescription>
              Modifique el puesto del usuario.
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const { message, error } = await modificarPuesto(formData, fila);
              if (error) {
                toast.error(message);
              } else {
                toast.success(message);
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Puesto
                </Label>

                <Input
                  id="puesto"
                  value={puesto}
                  name="puesto"
                  onChange={(e) => setPuesto(e.target.value)}
                  placeholder="Puesto"
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="bg-colorPrincipal">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
