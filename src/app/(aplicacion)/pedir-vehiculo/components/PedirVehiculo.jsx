import { Meteors } from "@/components/ui/meteors";
import PedirVehiculoModal from "./PedirVehiculoModal"; // Importa el modal aquí
import { getUbicacionesTotal } from "@/lib/server-utils";

export default async function MeteoritosCard() {
  const ubicaciones = await getUbicacionesTotal();

  return (
    <div className="">
      <div className="w-full relative max-w-xs">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-teal-500 transform scale-[0.80] bg-red-500 rounded-full blur-3xl" />
        <div className="relative shadow-xl bg-gray-900 border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl flex flex-col justify-end items-start">
          <h1 className="font-bold text-xl text-white">Solicitar Vehículo</h1>
          <p className="font-normal text-base text-slate-500 mb-4 relative ">
            Pulse en el botón para poder solicitar un vehículo a logística.
          </p>

          {/* Modal */}
          <PedirVehiculoModal ubicaciones={ubicaciones} />

          {/* Efecto de Meteoros */}
          <Meteors number={20} />
        </div>
      </div>
    </div>
  );
}
