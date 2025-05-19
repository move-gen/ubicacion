import { Card, CardFooter } from "@/components/ui/card";
import Link from "next/link";
export function CardSecundaria() {
  return (
    <>
      <Card
        className="shadow-lg rounded-lg xl:col-span-1 bg-ubi bg-cover bg-center flex-col transition-transform duration-300 transform hover:scale-105"
        x-chunk="dashboard-01-chunk-2"
      >
        <Link href="/ubicaciones" rel="noopener noreferrer">
          <div className="bg-gradient-to-t from-black to-transparent"></div>
          <CardFooter className="flex flex-col justify-end items-start h-full mb-8">
            <p className="text-colorVerde text-left">Añadir Ubicaciones</p>
            <p className="text-white text-left">
              Comprueba las ubicaciones existentes
            </p>
          </CardFooter>
        </Link>
      </Card>
    </>
  );
}
