import { Icon } from "@iconify/react";

export const SIDENAV_ITEMS = [
  {
    title: "Panel de control",
    path: "/dashboard",
    icon: <Icon icon="lucide:layout-grid" width="20" height="20" />,
    requirePermissions: ["crud:ubicacion_coches"],
  },
  {
    title: "Ubicaciones",
    path: "/ubicaciones",
    icon: <Icon icon="lucide:map-pinned" width="20" height="20" />,
    requirePermissions: ["crud:ubicacion_coches"],
  },
  {
    title: "Usuarios",
    path: "/usuarios",
    icon: <Icon icon="lucide:users-round" width="20" height="20" />,
    requirePermissions: ["crud:ubicacion_coches"],
  },
  {
    title: "Estado coches",
    path: "/listado-vehiculos",
    icon: <Icon icon="lucide:car" width="20" height="20" />,
    requirePermissions: ["generar:qr"],
  },
  {
    title: "Generador QR",
    path: "/generar-qr",
    icon: <Icon icon="lucide:qr-code" width="20" height="20" />,
    requirePermissions: ["generar:qr"],
  },
  {
    title: "Pedir Vehículo",
    path: "/pedir-vehiculo",
    icon: <Icon icon="lucide:circle-plus" width="20" height="20" />,
  },
  {
    title: "Escanear QR",
    path: "/escanear-qr",
    icon: <Icon icon="lucide:scan-line" width="20" height="20" />,
  },
];
