"use client";

import { useState } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import { eliminarCocheListado } from "../actions/eliminarCocheLogistica";
export default function BotonEliminar({ fila }) {
  const { isAuthenticated, getPermission, isLoading } = useKindeBrowserClient();
  const permissions = getPermission("crud:ubicacion_coches");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!isAuthenticated) {
    // Si el usuario no está autenticado, no mostramos nada
    return null;
  }

  if (!permissions.isGranted) {
    // Si el usuario no tiene los permisos necesarios, no mostramos nada
    return null;
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault(); // Evita el comportamiento por defecto del formulario

    const formData = new FormData(e.target);

    // Mostrar inmediatamente el loading
    const loadingToastId = toast.loading("Eliminando vehículo...");

    try {
      const { message, error } = await eliminarCocheListado(formData, fila);

      toast.dismiss(loadingToastId); // Despedir el loading toast

      if (error) {
        toast.error(message); // Mostrar error en caso de fallo
      } else {
        toast.success(message); // Mostrar éxito
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Error al eliminar el coche");
    }

    setIsDialogOpen(false); // Cierra el modal
  };

  return (
    !isLoading && (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center text-red-600 hover:text-red-800 transition-colors duration-300 text-sm sm:text-base"
            onClick={() => setIsDialogOpen(true)}
          >
            <Trash color="red" className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este registro? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button variant="destructive" type="submit">
                Eliminar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    )
  );
}
