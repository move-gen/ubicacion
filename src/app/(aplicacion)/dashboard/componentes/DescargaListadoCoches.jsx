"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function ExportButton({ data }) {
  const handleDownload = () => {
    // Obtener la fecha actual en formato español (dd-mm-yyyy)
    const today = new Date().toLocaleDateString("es-ES").replace(/\//g, "-"); // Reemplazar "/" por "-" para el nombre del archivo

    // Encabezados del CSV
    const headers = ["Marca", "Matrícula", "Ubicación"];

    // Generar las filas del CSV
    const csvRows = [
      headers.join(";"), // Agregar encabezados separados por comas
      ...data.map((item) =>
        [item.marca, item.matricula, item.ubicacion.nombre].join(";")
      ),
    ];

    // Unir las filas en un string separado por saltos de línea
    const csvContent = csvRows.join("\n");

    // Agregar el BOM para garantizar compatibilidad con Excel
    const bom = "\uFEFF";

    // Crear un Blob con el contenido del CSV y el BOM
    const blob = new Blob([bom + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);

    // Crear un enlace temporal para descargar el archivo
    const link = document.createElement("a");
    link.href = url;
    link.download = `Listado_de_coches_${today}.csv`; // Nombre del archivo con fecha actual
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Liberar el objeto URL temporal
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      onClick={handleDownload}
      className="ml-auto gap-2 bg-colorPrincipal transition-transform duration-300 transform hover:scale-105 flex items-center"
    >
      Exportar datos
      <Download className="h-4 w-4" />
    </Button>
  );
}
