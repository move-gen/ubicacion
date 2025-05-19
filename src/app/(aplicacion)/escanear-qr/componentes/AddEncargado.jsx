import * as React from "react";
import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useStepper } from "@/components/ui/stepper";

export default function Encargado({
  manejarDecision,
  updateState,
  state: { matricula, personaEncargada, telefono, taller, kilometros, errores },
}) {
  const { nextStep } = useStepper();
  const [talleres, setTalleres] = useState([]);
  const [open, setOpen] = useState(false);

  // Formateo del número de kilómetros
  const formatNumber = (value) => value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  // Manejo del cambio en los kilómetros
  const handleChangeKilometros = (e) => {
    let value = e.target.value.replace(/\./g, "");
    if (value.length <= 6 && !isNaN(value)) {
      updateState("kilometros", value);
    }
  };

  // Manejo del cambio en el nombre
  const handleChangeName = (e) => {
    const value = e.target.value;
    updateState(
      "personaEncargada",
      value.charAt(0).toUpperCase() + value.slice(1)
    );
  };

  // Manejo del cambio en el teléfono
  const handleTelefonoChange = (e) => {
    // Elimina cualquier carácter que no sea un número
    let value = e.target.value.replace(/\D/g, "");

    // Formatea el número en grupos de 3 dígitos separados por espacios
    value = value.replace(/(\d{3})(?=\d)/g, "$1 ");

    // Actualiza el valor del input
    e.target.value = value.trim();

    updateState("telefono", value);
  };

  // Fetch de talleres al montar el componente
  useEffect(() => {
    fetch("/api/escanear-qr")
      .then((response) => response.json())
      .then((data) => {
        setTalleres(data);
      })
      .catch((error) => console.error("Error fetching talleres:", error));
  }, []);

  useEffect(() => {
    const comprobarSeguroITV = async () => {
      try {
        const res = await fetch(
          `/api/comprobarSeguroITV?matricula=${matricula}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Error al comprobar el seguro/ITV.");
        }

        const resultado = await res.json();

        // ✅ Inicializamos un array vacío para los errores
        const nuevosErrores = [];

        // ✅ Comprobamos si la ITV no es válida
        if (!resultado.fechaITVValida) {
          nuevosErrores.push(
            "El vehículo no tiene la ITV en vigor. Por favor, asegúrese de que la ITV esté actualizada."
          );
        }

        // ✅ Comprobamos si el seguro no es válido
        if (!resultado.seguroValido) {
          nuevosErrores.push(
            "El vehículo no tiene un seguro válido. No está permitido mover el vehículo sin un seguro vigente."
          );
        }

        // ✅ Si hay errores, agregamos el código "ITV_SEGURO_NO_VALIDO"
        if (nuevosErrores.length > 0) {
          nuevosErrores.push(
            "No está permitido moverlo.",
            "Para ubicarlo, escanéelo donde se encuentra.",
            "ITV_SEGURO_NO_VALIDO" // Código que usaremos para mostrar el botón "Continuar"
          );
          updateState("errores", nuevosErrores);
          return false;
        }

        // ✅ Si todo es válido, actualizamos el estado
        if (resultado.todoValido) {
          updateState("estadoSeguroITV", resultado);
          return true;
        }

        // ✅ Si alguna comprobación falla inesperadamente
        updateState("errores", [
          "Error desconocido al validar el seguro o la ITV.",
        ]);
      } catch (error) {
        // ✅ Error en la llamada a la API
        updateState("errores", [
          "Error al comprobar el Seguro o la ITV. Por favor, intente de nuevo.",
        ]);
        console.error("Error al comprobar seguro/ITV:", error);
        return null;
      }
    };

    comprobarSeguroITV();
  }, [matricula]);

  const selectedTallerObj = talleres.find((t) => t.id.toString() === taller);

  return (
    <Card className="w-[350px] shadow-lg">
      <CardHeader>
        <CardTitle>Persona encargada</CardTitle>
        <CardDescription>
          Añade los datos de la persona que se llevará el vehículo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!taller) {
              alert("Por favor, selecciona un taller.");
              return;
            }
            nextStep();
            updateState("showAnimation2", true);
          }}
          className="space-y-6"
        >
          {/* Nombre */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              name="nombre"
              placeholder="Nombre de la persona"
              required
              value={personaEncargada}
              onChange={handleChangeName}
            />
          </div>

          {/* Teléfono */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="tel">Teléfono</Label>
            <Input
              id="tel"
              name="telefono"
              type="tel"
              placeholder="Teléfono de la persona"
              required
              value={telefono}
              onChange={handleTelefonoChange}
              maxLength="11"
              minLength="9"
            />
          </div>

          {/* Kilómetros */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="kilometros">Kilómetros</Label>
            <Input
              id="kilometros"
              name="kilometros"
              placeholder="Kilómetros del vehículo"
              value={formatNumber(kilometros)}
              onChange={handleChangeKilometros}
              required
            />
          </div>

          {/* Selección de taller */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="taller">Agente externo</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between"
                >
                  {selectedTallerObj ? selectedTallerObj.nombre : "Seleccionar"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Buscar" />
                  <CommandEmpty>No se han encontrado resultados</CommandEmpty>
                  <CommandGroup>
                    <CommandList>
                      {talleres.map((taller) => (
                        <CommandItem
                          key={taller.id}
                          name="taller"
                          onSelect={() => {
                            updateState("taller", taller.id.toString());
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              taller.id.toString() === taller
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {taller.nombre}
                        </CommandItem>
                      ))}
                    </CommandList>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Botones */}
          <div className="flex justify-between space-x-4">
            <Button
              variant="secondary"
              type="button"
              onClick={() => manejarDecision(false)}
            >
              Volver atrás
            </Button>
            <Button
              type="submit"
              className="bg-colorPrincipal hover:bg-blue-700"
              disabled={!taller}
            >
              Confirmar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
