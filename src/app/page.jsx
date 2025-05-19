"use client";
import { redirect, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { Hero } from "@/components/inicio/Hero";
import Link from "next/link";

function SearchParamsHandler() {
  const searchParams = useSearchParams();
  const [redireccion, setRedireccion] = useState(null);
  const car = searchParams.get("car");

  useEffect(() => {
    async function busqueda(search) {
      if (!search) {
        return;
      }
      try {
        const response = await fetch(
          `/api/redireccion?car=${encodeURIComponent(search)}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        if (!data || data.error) {
          setRedireccion(
            "https://encuentratucoche.miguelleon.es?utm_source=ubicacion.miguelleon.es&utm_medium=qr_ubicacion&utm_campaign=ubicacion"
          );
        } else {
          setRedireccion(
            data +
              "?utm_source=ubicacion.miguelleon.es&utm_medium=qr_ubicacion&utm_campaign=ubicacion"
          );
        }
      } catch (error) {
        setRedireccion(
          "https://encuentratucoche.miguelleon.es?utm_source=ubicacion.miguelleon.es&utm_medium=qr_ubicacion&utm_campaign=ubicacion"
        );
      }
    }

    busqueda(car);
  }, [car]);

  useEffect(() => {
    if (redireccion) {
      redirect(redireccion);
    }
  }, [redireccion]);

  return null;
}

export default function HomePage() {
  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Image
          src="/images/mllogo.png"
          alt="logo"
          width={160}
          height={15}
          className="shadow-sm"
        />
        <span className="sr-only">Miguel León</span>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <div className="hidden md:inline-flex h-9  items-center justify-center rounded-md bg-colorPrincipal px-4 py-2 text-sm font-medium text-gray-50 shadow-lg transition-colors hover:bg-colorClaro focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300">
              Iniciar sesión
            </div>
          </Link>
        </div>
      </header>

      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>

      <Hero />
      <div className="text-white version">version 1.8.5</div>
    </>
  );
}
