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
import { SquarePen } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { modificarUbicacion } from "./actions/modificarUbicacion";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

export default function ModificarUbicacion({ fila }) {
  const [nombre, setNombre] = useState("");
  const [nombreAMostrar, setNombreAMostrar] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [agenteExterno, setAgenteExterno] = useState(
    Boolean(fila.agenteExterno)
  );
  const [nombreA3, setNombreA3] = useState(null);
  const [errorA3, setErrorA3] = useState(null);

  const handleChange = (e) => {
    let value = e.target.value.toUpperCase(); // Convierte a mayúsculas y elimina espacios

    if (value.length > 8) {
      setErrorA3("Máximo 8 caracteres permitidos");
      value = value.slice(0, 8); // Recorta el valor a los primeros 8 caracteres
    } else {
      setErrorA3(null); // Resetea el error si está dentro del límite
    }

    setNombreA3(value);
  };

  const router = useRouter();
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <SquarePen width={15} height={15} />
            </div>
            Modificar ubicación
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modificar ubicación</DialogTitle>
            <DialogDescription>
              Modifique los parámetros de la ubicación {fila.nombre}
            </DialogDescription>
          </DialogHeader>
          <form
            action={async (formData) => {
              const { message, error } = await modificarUbicacion(
                formData,
                fila
              );
              if (error) {
                toast.error(message);
              } else {
                toast.success(message);
              }
              router.refresh();
            }}
          >
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Ubicación
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={fila.nombre}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre a mostrar en API
                </Label>
                <Input
                  id="nombreAMostrar"
                  name="nombreAMostrar"
                  value={nombreAMostrar}
                  onChange={(e) => setNombreAMostrar(e.target.value)}
                  placeholder={fila.nombreAMostrar}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="latitud" className="text-right">
                  Latitud
                </Label>
                <Input
                  id="latitud"
                  name="latitud"
                  value={latitud}
                  onChange={(e) => {
                    setLatitud(e.target.value.replace(/,/g, "."));
                  }}
                  placeholder={fila.latitud}
                  className="col-span-3"
                  type="number"
                  step="any"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="longitud" className="text-right">
                  Longitud
                </Label>
                <Input
                  id="longitud"
                  name="longitud"
                  value={longitud}
                  onChange={(e) =>
                    setLongitud(e.target.value.replace(/,/g, "."))
                  }
                  placeholder={fila.longitud}
                  className="col-span-3"
                  type="number"
                  step="any"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre en A3
                </Label>
                <div className="col-span-3">
                  <Input
                    id="nombreA3"
                    name="nombreA3"
                    value={nombreA3}
                    onChange={handleChange}
                    placeholder={fila.nombreA3}
                    className="col-span-3"
                  />
                  {errorA3 && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errorA3}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="agenteExterno" className="text-right">
                  Agente Externo
                </Label>
                <Checkbox
                  id="agenteExterno"
                  name="agenteExterno"
                  defaultChecked={agenteExterno}
                  onCheckedChange={(e) => {
                    setAgenteExterno(Boolean(e));
                  }}
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
