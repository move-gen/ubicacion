import { Wrench, SprayCan, Ship } from "lucide-react"; // Ejemplo de íconos, puedes elegir otros

export const estados = [
  {
    id: 1,
    value: "PTE_PREPARAR",
    label: "Pendiente de preparar",
    icon: Wrench,
    color: "bg-red-300 text-red-400",
  },
  {
    id: 2,
    value: "PREPARACION",
    label: "En preparación",
    icon: SprayCan,
    color: "bg-orange-300 text-orange-400",
  },
  {
    id: 3,
    value: "ENVIADO",
    label: "En transporte",
    icon: Ship,
    color: "bg-green-300 text-green-400",
  },
];
