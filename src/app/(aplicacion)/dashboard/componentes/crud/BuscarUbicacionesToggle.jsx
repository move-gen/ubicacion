import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function BuscarUbiComboBox({
  nombreUbicacion,
  onSelect,
  ubiTotal,
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");

  const [ubicaciones, setUbicaciones] = React.useState([]);

  React.useEffect(() => {
    setUbicaciones(ubiTotal);
  }, []);

  const selectedUbicacion = ubiTotal.find(
    (ubicacion) => ubicacion.id.toString() === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between col-span-3"
        >
          {selectedUbicacion ? selectedUbicacion.nombre : nombreUbicacion}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Selecciona una ubicación..." />
          <CommandEmpty>No se han encontrado ubicaciones</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {ubicaciones.map((ubicacion) => (
                <CommandItem
                  key={ubicacion.id}
                  onSelect={() => {
                    const currentValue = ubicacion.id.toString();
                    setValue(currentValue);
                    setOpen(false);
                    if (onSelect) {
                      onSelect(currentValue);
                    }
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === ubicacion.id.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {ubicacion.nombre}
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
