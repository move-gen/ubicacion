import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock } from "lucide-react";
import { MapPin } from "lucide-react";

export default function UbicacionesRegistradas({ coches }) {
  return (
    <div className="mx-auto mbmax-w-4xl p-4 min-h-screen flex flex-col justify-center gap-8 sm:gap-6 md:gap-4 lg:gap-2">
      {coches.map((coche, index) => {
        const hora = new Date(coche.updatedAt).toLocaleString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "Atlantic/Canary",
        });

        return (
          <div
            key={coche.id}
            className={`flex flex-col items-center md:flex-row md:items-start gap-4 p-5 w-full ${
              index !== coches.length - 1 ? "border-b border-gray-300" : ""
            }`}
          >
            <div className="w-full flex justify-center md:w-auto md:justify-start">
              <Avatar>
                <AvatarFallback>
                  <MapPin color="#0D47A1" size={24} strokeWidth={1} />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1 grid gap-1 text-center md:text-left">
              <p className="text-sm font-bold leading-none">{coche.marca}</p>
              <div className="flex flex-col items-center md:items-start">
                <p className="text-sm text-muted-foreground">
                  {coche.matricula}
                </p>
                <p className="text-sm text-muted-foreground">
                  {coche.ubicacion.nombre}
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  {coche.usuarioRegistro}
                </p>

                <div className="flex justify-center md:justify-start items-center gap-2 bg-[#F5F6F8] rounded-lg p-3 mt-2 md:mt-0">
                  <Clock color="#112763" width={18} height={18} />
                  <span className="text-sm">{hora}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
