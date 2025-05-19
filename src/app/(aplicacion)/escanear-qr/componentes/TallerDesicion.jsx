import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStepper } from "@/components/ui/stepper";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export default function Taller({ manejarDecision, matricula, updateState }) {
  const { nextStep } = useStepper();
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [marca, setMarca] = useState("");
  const [kilometros, setKilometros] = useState("");

  // ✅ Comprobamos si existe el error específico "ITV_SEGURO_NO_VALIDO"

  // ✅ Formateo de número de kilómetros
  const formatNumber = (value) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ✅ Manejo del cambio en el input de kilómetros
  const handleChange = (e) => {
    let value = e.target.value.replace(/\./g, "");
    if (value.length <= 6 && !isNaN(value)) {
      setKilometros(value);
      updateState("kilometros", value);
    }
  };

  // ✅ Manejo del cierre del diálogo de confirmación
  const handleAlertClose = (confirm) => {
    setAlertOpen(false);
    if (confirm) {
      updateState("showAnimation2", true);
      nextStep();
    }
  };

  // ✅ Fetch de los datos del vehículo (marca) usando la matrícula
  const fetchData = async (matricula) => {
    try {
      const response = await fetch(`/api/datosVehiculo?matricula=${matricula}`);
      if (!response.ok) {
        throw new Error("No se pudo obtener los datos del vehículo.");
      }
      const result = await response.json();
      setMarca(result.marca);
    } catch (error) {
      console.error("Error fetching datosVehiculo:", error);
      setMarca("ERROR");
      updateState("errores", ["Código QR no válido, debe crearse de nuevo"]);
    }
  };

  // ✅ Ejecutar el fetch al montar el componente
  useEffect(() => {
    fetchData(matricula);
  }, []);

  return (
    <>
      {/* Tarjeta principal */}
      <Card className="w-[350px] shadow-lg">
        <CardHeader>
          <CardTitle>¿El vehículo irá a algún sitio?</CardTitle>
          <CardDescription>
            Si el vehículo no se va a mover de donde se encuentra, rellene los
            km y pulse en No se moverá. En caso contrario pulse en Llevar a otro
            lugar
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Marca del vehículo */}
          <Label>
            Marca y modelo
            <Input
              type="text"
              disabled
              className="mb-2 border p-2 rounded"
              placeholder={marca || "Cargando..."}
            />
          </Label>

          {/* Matrícula del vehículo */}
          <Label>Matrícula</Label>
          <Input
            type="text"
            disabled
            className="border p-2 rounded"
            placeholder={matricula}
          />

          {/* Kilómetros */}
          <Label>Kilómetros</Label>
          <Input
            type="text"
            required
            name="kilometros"
            className="border p-2 rounded"
            value={formatNumber(kilometros)}
            onChange={handleChange}
          />
        </CardContent>

        {/* Botones de acción */}
        <CardFooter className="flex justify-center p-4">
          <div className="flex space-x-4">
            {/* Botón: Llevar a otro lugar */}
            <Button
              variant="secondary"
              className="border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
              onClick={() => manejarDecision(true)}
            >
              Llevar a otro lugar
            </Button>

            {/* Botón: No se moverá */}
            <Button
              className="bg-colorPrincipal hover:bg-blue-700"
              onClick={() => setAlertOpen(true)}
              disabled={!kilometros}
            >
              No se moverá
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Diálogo de confirmación */}
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>
            ¿Está seguro de que no se moverá el vehículo?
          </AlertDialogTitle>
          <AlertDialogDescription>
            El vehículo no se va a mover de este lugar hacia un taller o agente
            externo.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="p-5"
              onClick={() => handleAlertClose(false)}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-colorPrincipal p-5"
              onClick={() => handleAlertClose(true)}
            >
              Sí
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
