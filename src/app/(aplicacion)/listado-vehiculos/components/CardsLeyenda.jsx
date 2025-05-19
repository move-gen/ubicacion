// CardsGrid.js

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Importación desde shadcn/ui

// Componente de tarjeta que recibe las propiedades de una tarjeta específica
export default function CardsGrid({
  title,
  Icon,
  description,
  iconColor,
  borderColor,
}) {
  return (
    <Card className="group p-2 shadow-md hover:shadow-lg transition-shadow rounded-lg border-2 border-transparent relative overflow-hidden">
      {/* Borde superior que se rellena al hacer hover */}
      <div
        className={`absolute top-0 left-0 h-1 ${borderColor} w-[25%] transition-all duration-1000 group-hover:w-full`}
      ></div>

      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{title}</CardTitle>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <p className="text-base text-gray-700">{description}</p>
      </CardContent>
    </Card>
  );
}
