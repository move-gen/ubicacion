"use client";
import ModificarCoche from "../crud/ModificarCoche";
import QuitarEnVenta from "../crud/QuitarEnVenta";
import EliminarCoche from "../crud/EliminarCoche";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Cross, RefreshCw, RefreshCwOff, UploadCloud } from "lucide-react"; // Añadir UploadCloud o similar
import MarcarComoVendido from "../crud/MarcarComoVendido";
import { useState } from "react"; // Importar useState
import { forceA3UpdateForCar } from "../../actions/forceA3UpdateAction"; // Importar la server action
import toast from "react-hot-toast"; // Para notificaciones
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"; // Importar DropdownMenuItem

export function DataTableRowActions({
  row,
  ubiTotal,
  ubicacionesFiltradasLogistica,
}) {
  const fila = row.original;
  const [isUpdatingA3, setIsUpdatingA3] = useState(false);

  const handleForceA3Update = async () => {
    setIsUpdatingA3(true);
    toast.loading(`Actualizando ${fila.matricula} en A3...`, { id: "a3-update-toast" });
    try {
      const result = await forceA3UpdateForCar(fila.matricula);
      if (result.error) {
        toast.error(`Error para ${fila.matricula}: ${result.error}`, { id: "a3-update-toast" });
        console.error("[ForceA3Update Error]", result.error, result.a3_status, result.a3_response_body);
      } else {
        toast.success(result.message || `Actualización para ${fila.matricula} procesada.`, { id: "a3-update-toast" });
        console.log("[ForceA3Update Success]", result.message, result.a3_status, result.a3_response_body);
        // Aquí podrías querer forzar una revalidación o actualización de los datos de la tabla si es necesario
      }
    } catch (e) {
      toast.error(`Excepción al actualizar ${fila.matricula}: ${e.message}`, { id: "a3-update-toast" });
      console.error("[ForceA3Update Exception]", e);
    }
    setIsUpdatingA3(false);
  };

  const getSyncStatus = () => {
    //Ubicación
    if (fila.ubicacion.nombre === "Sin Ubicación") {
      return {
        icon: <RefreshCw width={15} height={15} color="gray" />,
        tooltip: "Escanee el vehículo para sincronizar con A3",
      };
    } else if (!fila.pendienteA3) {
      return {
        icon: <RefreshCw width={15} height={15} color="green" />,
        tooltip: "Sincronizado con A3",
      };
    } else {
      return {
        icon: <RefreshCwOff width={15} height={15} color="red" />,
        tooltip: "Pendiente sincronización con A3",
      };
    }
  };

  const syncStatus = getSyncStatus();

  return (
    <DropdownMenu>
      <div className="justify-between flex items-center">
        <MarcarComoVendido
          fila={fila}
          ubicacionesFiltradasLogistica={ubicacionesFiltradasLogistica}
        />
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger>
              <div>{syncStatus.icon}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{syncStatus.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-4 h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </div>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Opciones</DropdownMenuLabel>
        <Link
          className="flex items-center"
          href={`/dashboard/vehiculo/${fila.id}`}
        >
          <Button variant="ghost">
            <>
              <div className="mr-3">
                <Cross width={15} height={15} />
              </div>
              Más información
            </>
          </Button>
        </Link>
        <ModificarCoche fila={fila} ubiTotal={ubiTotal} />
        {fila.enVenta ? (
          <>
            <DropdownMenuSeparator />
            <QuitarEnVenta fila={fila} />
          </>
        ) : null}

        <DropdownMenuSeparator />
        <EliminarCoche fila={fila} />
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleForceA3Update} disabled={isUpdatingA3}>
          <UploadCloud className="mr-2 h-4 w-4" />
          {isUpdatingA3 ? "Actualizando A3..." : "Forzar Actualización A3"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
