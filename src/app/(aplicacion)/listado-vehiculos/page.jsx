import CardPrincipal from "./components/TarjetaPrincipal";
import TarjetaSecundaria from "./components/TarjetaSecundaria";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import CardsGrid from "./components/CardsLeyenda";
import Tabla from "./components/Tabla";
import { Wrench, SprayCan, Ship } from "lucide-react"; // Ejemplo de íconos, puedes elegir otros
import { getCountByEstado } from "@/lib/server-utils";

export const metadata = {
  title: "Estado de los vehículos",
  description: "Localizador de vehículos",
};

// Datos de las tarjetas
const cardsData = [
  {
    id: "1",
    title: "Pendientes de preparar",
    Icon: Wrench,
    description:
      "Vehículos recién vendidos y que necesitan empezarse a preparar.",
    iconColor: "text-red-400",
    borderColor: "bg-red-300",
  },
  {
    id: "2",
    title: "En preparación",
    Icon: SprayCan,
    description: "Vehículos que actualmente están en proceso de preparación.",
    iconColor: "text-orange-400",
    borderColor: "bg-orange-300",
  },
  {
    id: "3",
    title: "En transporte",
    Icon: Ship,
    description:
      "Vehículos que están actualmente en transporte hacia su destino.",
    iconColor: "text-green-400",
    borderColor: "bg-green-300",
  },
];
export const dynamic = "force-dynamic";

export default async function ListadoVehiculos() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const estados = await getCountByEstado();
  return (
    <>
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-2">
            {/* Tarjeta Principal */}
            <div className="col-span-1">
              <CardPrincipal user={user} />
            </div>
            {/* Tarjeta Secundaria */}
            <div className="col-span-1">
              <TarjetaSecundaria estados={estados} />
            </div>
          </div>

          {/* Componente de las tarjetas */}
          <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 xl:grid-cols-3 mt-4">
            {cardsData.map((card) => (
              <CardsGrid
                key={card.id}
                title={card.title}
                Icon={card.Icon}
                description={card.description}
                iconColor={card.iconColor}
                borderColor={card.borderColor}
              />
            ))}
          </div>

          <Tabla />
        </main>
      </div>
    </>
  );
}
