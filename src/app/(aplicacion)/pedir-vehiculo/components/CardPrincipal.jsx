"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import concesionario from "./assets/concesionario.svg";

const imageVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
};

export default function CardPrincipal({ user }) {
  return (
    <Card
      className="relative bg-gradient-to-r p-5 from-colorPrincipal to-colorClaro shadow-lg rounded-lg xl:col-span-2 flex overflow-hidden"
      x-chunk="dashboard-01-chunk-1"
    >
      {/* Imagen alineada a la derecha y centrada verticalmente con animación */}
      <motion.div
        variants={imageVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5 }}
        className="absolute -top-4 transform -translate-y-1/2  -left-9 w-2/4 h-auto object-center"
      >
        <Image
          src={concesionario}
          priority
          alt="Concesionario"
          className="w-full h-full"
        />
      </motion.div>

      <div className="relative w-full h-full flex items-center justify-between">
        {/* Contenedor del texto de bienvenida */}
        <div className="pl-6 text-right w-full pr-6">
          <CardHeader className="text-right">
            <CardTitle className="text-lg font-thin text-white">
              Bienvenido de vuelta 👋🏼
            </CardTitle>
            <h2 className="text-2xl font-bold text-white mt-2">
              {user?.given_name + " " + user?.family_name}
            </h2>
          </CardHeader>
          <CardContent className="text-right">
            <p className="text-white font-thin">
              Administra los vehículos pendientes de entrega
            </p>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
