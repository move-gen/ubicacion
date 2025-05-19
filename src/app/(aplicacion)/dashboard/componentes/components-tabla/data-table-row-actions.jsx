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
import { MoreHorizontal, Cross, RefreshCw, RefreshCwOff } from "lucide-react";
import MarcarComoVendido from "../crud/MarcarComoVendido";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

export function DataTableRowActions({
  row,
  ubiTotal,
  ubicacionesFiltradasLogistica,
}) {
  const fila = row.original;

  const getSyncStatus = () => {
    //Ubicación
    if (fila.ubicacion.nombre === "Sin Ubicación") {
      return {
        icon: <RefreshCw width={15} height={15} color="gray" />,
        tooltip: "Escanee el vehículo para sincronizar con A3",
      };
    } else if (!fila.actualizadoA3) {
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
