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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SquarePen, TriangleAlert } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import toast from "react-hot-toast";
import { modificarUsuario } from "../actions/modificarUsuario";
export default function ModificarUsuario({ fila }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <SquarePen width={15} height={15} />
            </div>
            Modificar Rol
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{fila.full_name}</DialogTitle>

            <DialogDescription>
              Modifique los permisos del usuario.
            </DialogDescription>
            <Alert className="mt-2 py-2">
              <TriangleAlert color="red" className="h-4 w-4" />
              <AlertTitle>Recuerde</AlertTitle>
              <AlertDescription>
                Para que los cambios surtan efecto, el usuario debe cerrar
                sesión y volver a iniciarla.
              </AlertDescription>
            </Alert>
          </DialogHeader>
          <form
            action={async (formData) => {
              const { message, error } = await modificarUsuario(formData, fila);
              if (error) {
                toast.error(message);
              } else {
                toast.success(message);
              }
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="latitud" className="text-right">
                  Rol
                </Label>
                <Select required name="rol">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rol</SelectLabel>
                      <SelectItem value="administrador-leon">
                        Administrador
                      </SelectItem>
                      <SelectItem value="empleado-generar-qr">
                        Generador QR
                      </SelectItem>
                      <SelectItem value="escanear-qr">Escanear QR</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
