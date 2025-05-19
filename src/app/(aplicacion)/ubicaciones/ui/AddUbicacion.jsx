"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import toast from "react-hot-toast";
import { crearUbicacion } from "./actions/crearUbicacion";
import { Checkbox } from "@/components/ui/checkbox";

export default function AddUbicacion() {
  const [nombre, setNombre] = useState("");
  const [nombreAMostrar, setNombreAMostrar] = useState("");
  const [latitud, setLatitud] = useState("");
  const [longitud, setLongitud] = useState("");
  const [agenteExterno, setAgenteExterno] = useState(null);
  const [nombreA3, setNombreA3] = useState(null);
  const [errorA3, setErrorA3] = useState(null);

  const handleChange = (e) => {
    let value = e.target.value.toUpperCase(); // Convierte a mayúsculas y elimina espacios

    if (value.length > 8) {
      setErrorA3("Máximo 8 caracteres permitidos");
      value = value.slice(0, 8); // Recorta a los primeros 8 caracteres
    } else {
      setErrorA3(null); // Resetea el error si está dentro del límite
    }

    setNombreA3(value);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="ml-auto gap-1 bg-colorPrincipal transition-transform duration-300 transform hover:scale-105"
        >
          Añadir ubicación
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir ubicación</DialogTitle>
          <DialogDescription>
            Introduzca las coordenadas de una ubicación. Entre en Google Maps,
            pulse botón derecho y copiar coordenadas
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            const { message, error } = await crearUbicacion(formData);
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
                Ubicación
              </Label>

              <Input
                id="nombre"
                value={nombre}
                name="nombre"
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Taller Miguel León Las Palmas"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre a mostrar en API
              </Label>

              <Input
                id="nombreAMostrar"
                value={nombreAMostrar}
                name="nombreAMostrar"
                onChange={(e) => setNombreAMostrar(e.target.value)}
                placeholder="Miguel León Las Palmas"
                className="col-span-3"
                required
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
                onChange={(e) => setLatitud(e.target.value.replace(/,/g, "."))}
                placeholder="28.097073498081567"
                className="col-span-3"
                type="number"
                step="any"
                required
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
                onChange={(e) => setLongitud(e.target.value.replace(/,/g, "."))}
                placeholder="-15.443125223669142"
                className="col-span-3"
                type="number"
                step="any"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre del parámetro en A3
              </Label>

              <div className="col-span-3">
                <Input
                  id="nombreA3"
                  value={nombreA3}
                  name="nombreA3"
                  onChange={handleChange}
                  placeholder="Máx. 8 caracteres"
                  required
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
  );
}
