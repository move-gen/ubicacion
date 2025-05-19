"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import grua from "./assets/grua.svg";
import { motion } from "framer-motion";

export default function CardPrincipal({ user }) {
  return (
    <Card
      className="relative bg-gradient-to-r from-colorPrincipal to-colorClaro shadow-lg rounded-lg xl:col-span-2 flex overflow-visible"
      x-chunk="dashboard-01-chunk-1"
    >
      <div className="flex-1 p-6 z-10">
        <CardHeader className="text-left">
          <CardTitle className="text-lg font-thin text-white">
            Bienvenido de vuelta 👋🏼
          </CardTitle>
          <h2 className="text-2xl font-bold text-white mt-2">
            {user?.given_name + " " + user?.family_name}
          </h2>
        </CardHeader>
        <CardContent className="text-left">
          <p className="text-white font-thin">
            Administra los vehículos pendientes de entrega
          </p>
        </CardContent>
        <CardFooter className="justify-left"></CardFooter>
      </div>
      <motion.div
        className="relative items-center justify-end pr-4 flex-1 hidden sm:flex"
        initial={{ opacity: 0, x: 50, y: -50 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 1 }}
        whileHover={{ scale: 1.05, rotate: 2 }}
        style={{ flexGrow: 1 }} // Aumenta el espacio disponible para la imagen
      >
        <Image
          src={grua}
          alt="Grua"
          className="object-contain"
          style={{
            position: "absolute",
            right: "0px", // Ajusta para que la imagen se vea más hacia fuera
            top: "-10px", // Controla cuánto sobresale por la parte superior
            height: "auto",
            maxHeight: "500px", // Aumenta el tamaño máximo de la imagen
            width: "auto",
            maxWidth: "120%", // Permite que la imagen mantenga su proporción y crezca un poco más
          }}
        />
      </motion.div>
    </Card>
  );
}
