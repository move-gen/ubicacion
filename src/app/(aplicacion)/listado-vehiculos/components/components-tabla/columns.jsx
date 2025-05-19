"use client";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "./data-table-row-actions";
import { DataTableColumnHeader } from "./data-table-column-header";

export const getColumns = () => [
  {
    accessorFn: (row) => row.coche.marca,
    header: "Vehículo",
    cell: ({ getValue }) => <div className="capitalize">{getValue()}</div>,
  },
  {
    accessorFn: (row) => row.coche.matricula,
    id: "matricula",
    header: "Matrícula",
    cell: ({ getValue }) => <div className="capitalize">{getValue()}</div>,
  },
  {
    accessorFn: (row) => row.usuarioAsignado,
    id: "usuarioAsignado",
    header: "Asignado por",
    cell: ({ getValue }) => <div className="capitalize">{getValue()}</div>,
  },

  {
    accessorKey: "ubicacion",
    header: "Ubicación Actual",
    cell: ({ row }) => {
      return <div className="capitalize">{row.original.ubicacion.nombre}</div>;
    },
  },
  {
    accessorKey: "ubicacionDestino",
    header: "Destino Final",
    cell: ({ row }) => {
      return (
        <div className="capitalize">
          {row.original.ubicacionFinalDestino.nombre}
        </div>
      );
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    id: "estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado");

      // Define los gradientes de fondo y texto según el estado
      let gradient = "";
      let estadoTexto = estado; // Variable para ajustar el texto mostrado

      switch (estado) {
        case "PTE_PREPARAR":
          gradient = "bg-gradient-to-r from-red-200 to-red-300"; // Gradiente de rojo
          estadoTexto = "Pendiente de preparar";
          break;
        case "PREPARACION":
          gradient = "bg-gradient-to-r from-orange-200 to-orange-300"; // Gradiente de naranja
          estadoTexto = "En preparación";
          break;
        case "ENVIADO":
          gradient = "bg-gradient-to-r from-green-200 to-green-300"; // Gradiente de verde
          estadoTexto = "En transporte";
          break;
      }

      return (
        <Badge
          variant="outline"
          className={`${gradient}  py-1.5 text-center hover:shadow-sm font-medium `}
        >
          {estadoTexto}
        </Badge>
      );
    },

    filterFn: (row, id, filterValues) => {
      return filterValues.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Fecha de entrada" />
    ),
    cell: ({ row }) => {
      const fechaRaw = row.getValue("createdAt");

      // Verifica que el valor de fechaRaw es válido
      const fecha = new Date(fechaRaw);

      // Comprueba si la fecha es válida
      const isValidDate = !isNaN(fecha.getTime());

      // Convierte la fecha a string solo si es válida, de lo contrario muestra un mensaje de error o un formato predeterminado
      const fechaFormateada = isValidDate
        ? fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Fecha no válida";

      return <div className="capitalize">{fechaFormateada}</div>;
    },
  },
  {
    accessorKey: "fechaEstimadaDestino",
    header: "Fecha estimada de llegada al destino",
    cell: ({ row }) => {
      const fechaRaw = row.getValue("fechaEstimadaDestino");
      if (!fechaRaw) {
        return <div>Fecha no asignada</div>;
      }
      const fecha = new Date(fechaRaw);
      // Comprueba si la fecha es válida
      const isValidDate = !isNaN(fecha.getTime());

      // Convierte la fecha a string solo si es válida, de lo contrario muestra un mensaje de error o un formato predeterminado
      const fechaFormateada = isValidDate
        ? fecha.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Fecha no válida";
      // Verifica que el valor de fechaRaw es válido
      return <div className="capitalize">{fechaFormateada}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },

  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

export default getColumns;
