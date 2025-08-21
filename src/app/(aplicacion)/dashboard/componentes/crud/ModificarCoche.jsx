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
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import BuscarUbicacionesToggle from "./BuscarUbicacionesToggle";
import { modificarCoche } from "./actions/modificarCoche";

export default function ModificarCoche({ fila, ubiTotal }) {
  const [marca, setMarca] = useState("");
  const [matricula, setMatricula] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [url, setURL] = useState("");
  const [enVenta, setEnVenta] = useState(fila.enVenta);
  const [kilometros, setKilometros] = useState("");
  const [kmDisabled, setKmDisabled] = useState(true);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  const handleChange = (e) => {
    let value = e.target.value.replace(/\./g, "");
    if (value.length <= 6 && !isNaN(value)) {
      setKilometros(value);
    }
  };

  const handleSelect = (selectedValue) => {
    setUbicacion(selectedValue);
    setKmDisabled(false); // Habilitar el campo de kilómetros al cambiar la ubicación
    setIsSaveDisabled(true); // Desactivar el botón de guardar hasta que se ingresen los kilómetros
    setKilometros(""); // Reiniciar el valor de kilómetros al cambiar la ubicación
  };

  const handleInputChange = (e) => {
    let cleanedValue = e.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase();

    if (/^[0-9]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 7);
    } else if (/^[A-Z]/.test(cleanedValue)) {
      cleanedValue = cleanedValue.slice(0, 8);
    }
    setMatricula(cleanedValue);
  };

  const handleMarcaChange = (e) => {
    setMarca(e.target.value);
  };

  useEffect(() => {
    if (marca || matricula || ubicacion || url || kilometros || enVenta) {
      if (ubicacion && !kilometros) {
        setIsSaveDisabled(true);
      } else {
        setIsSaveDisabled(false);
      }
    } else {
      setIsSaveDisabled(true);
    }
  }, [marca, matricula, ubicacion, url, kilometros]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evitar comportamiento predeterminado del formulario

    const formData = new FormData(e.target);

    // Mostrar inmediatamente el loading
    const loadingToastId = toast.loading("Modificando vehículo...");

    try {
      const { message, error } = await modificarCoche(
        formData,
        fila,
        ubicacion,
        enVenta
      );

      toast.dismiss(loadingToastId); // Despedir el loading toast

      if (error) {
        toast.error(message); // Mostrar error en caso de fallo
      } else {
        toast.success(message); // Mostrar éxito
      }
    } catch (err) {
      toast.dismiss(loadingToastId);
      toast.error("Error al modificar el coche");
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <div className="mr-3">
              <SquarePen width={15} height={15} />
            </div>
            Modificar datos
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <DialogTitle>Modificar los datos del vehículo</DialogTitle>
              <DialogDescription>
                Modifique los datos del registro de vehículo {fila.matricula}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Marca
                </Label>
                <Input
                  id="marca"
                  value={marca}
                  name="marca"
                  onChange={handleMarcaChange}
                  placeholder={fila.marca}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="matricula" className="text-right">
                  Matricula
                </Label>
                <Input
                  id="matricula"
                  name="matricula"
                  value={matricula}
                  onChange={handleInputChange}
                  placeholder={fila.matricula}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="matricula" className="text-right">
                  Ubicación
                </Label>
                <BuscarUbicacionesToggle
                  onSelect={handleSelect}
                  nombreUbicacion={fila.ubicacion.nombre}
                  ubiTotal={ubiTotal}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="kilometros" className="text-right">
                  Kilómetros
                </Label>
                <Input
                  id="kilometros"
                  name="kilometros"
                  value={kilometros}
                  type="text"
                  onChange={handleChange}
                  placeholder=""
                  className="col-span-3"
                  disabled={kmDisabled}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="enVenta" className="text-right">
                  URL de venta
                </Label>
                <Input
                  id="enVenta"
                  name="url"
                  value={url}
                  onChange={(e) => {
                    setURL(e.target.value);
                  }}
                  placeholder="https://encuentratucoche.miguelleon.es/coches/dacia/sandero/1550347"
                  className="col-span-3"
                  type="url"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                className="bg-colorPrincipal"
                disabled={isSaveDisabled}
              >
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
