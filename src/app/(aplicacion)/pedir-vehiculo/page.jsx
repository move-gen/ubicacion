import CardPrincipal from "./components/CardPrincipal";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import VehiculosManager from "./components/VehiculosManager";
import { getVehiculosEnvioComercial } from "@/lib/server-utils";
import BuscarVehiculoCard from "./components/PedirVehiculo"; // Importamos el componente de pedir vehículo

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Solicitar vehículo",
  description: "Localizador de vehículos",
};
export default async function PedirVehiculo() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();
  const vehiculos = await getVehiculosEnvioComercial(); // Datos de los vehículos obtenidos desde el servidor

  return (
    <div className="flex min-h-screen w-full flex-col ">
      {" "}
      {/* Fondo opcional para mejor visualización en móviles */}
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Sección con CardPrincipal y BuscarVehiculoCard */}
        <div className="flex flex-col md:flex-row w-full gap-4">
          {/* CardPrincipal que ocupa 100% en móviles y 3/4 en pantallas medianas y superiores */}
          <div className="w-full md:w-3/4">
            <CardPrincipal user={user} vehiculos={vehiculos} />
          </div>

          {/* BuscarVehiculoCard que ocupa 100% en móviles y 1/4 en pantallas medianas y superiores */}
          <div className="w-full md:w-1/4">
            <BuscarVehiculoCard className="w-full" />
          </div>
        </div>

        {/* VehiculosManager recibe la lista de vehículos */}
        <div className="w-full">
          <VehiculosManager vehiculos={vehiculos} />
        </div>
      </main>
    </div>
  );
}
