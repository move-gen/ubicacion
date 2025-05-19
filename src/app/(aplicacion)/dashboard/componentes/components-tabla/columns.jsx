"use client";
import { Badge } from "@/components/ui/badge";
import { DataTableRowActions } from "./data-table-row-actions";

export const getColumns = (ubiTotal, ubicacionesFiltradasLogistica) => [
  {
    accessorKey: "marca",
    header: "Vehículo",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("marca")}</div>
    ),
  },
  {
    accessorKey: "matricula",
    header: "Matrícula",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("matricula")}</div>
    ),
  },
  {
    accessorKey: "enVenta",
    header: <p className="text-center">Qr Activo</p>,
    cell: ({ row }) => {
      const enVenta = row.getValue("enVenta");
      return (
        <Badge
          variant="outline"
          className={
            enVenta
              ? "bg-green-500 text-white px-4 items-center justify-center"
              : "bg-red-500 px-4 text-white items-center justify-center"
          }
        >
          {enVenta ? "Sí" : "No"}
        </Badge>
      );
    },
  },

  {
    accessorKey: "ubicacion",
    header: "Ubicación",
    cell: ({ row }) => {
      return <div className="capitalize">{row.original.ubicacion.nombre}</div>;
    },
    filterFn: (row, id, value) => {
      const rowValue = row.getValue(id)?.nombre || "";
      return value.some((v) => rowValue.includes(v));
    },
  },

  {
    id: "actions",
    cell: ({ row }) => (
      <DataTableRowActions
        row={row}
        ubiTotal={ubiTotal}
        ubicacionesFiltradasLogistica={ubicacionesFiltradasLogistica}
      />
    ),
  },
];

export default getColumns;
