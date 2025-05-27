import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import TablaUsuarios from "./componentes/TablaUsuarios";
import AddUsuario from "./componentes/AddUsuario";
import SkeletonDataTable from "../dashboard/skeleton/DataTableSkeleton"; // Verifica que este path sea correcto
import { Suspense } from "react";
import { getUsuarios } from "@/lib/server-utils"; // Importa la función getUsuarios corregida

export const metadata = {
  title: "Gestión de usuarios",
  description: "Gestión de usuarios",
};

export const dynamic = "force-dynamic";

export default async function UsuariosPage() { // Nombre de componente cambiado a PascalCase
  console.log("SRV_LOG: /usuarios page.jsx - Inicio de renderizado.");
  let usuariosParaTabla = []; // Inicializar como array vacío por defecto absoluto

  try {
    console.log("SRV_LOG: /usuarios page.jsx - Llamando a getUsuarios (desde server-utils)...");
    const usuariosData = await getUsuarios(); // Esta función ahora tiene try-catch y logs

    if (Array.isArray(usuariosData)) {
      usuariosParaTabla = usuariosData;
      console.log(`SRV_LOG: /usuarios page.jsx - getUsuarios (de server-utils) devolvió un array. Longitud: ${usuariosParaTabla.length}`);
    } else {
      // Esto NO debería suceder si getUsuarios en server-utils.js está bien corregido.
      console.error(`SRV_LOG: /usuarios page.jsx - ¡ALERTA CRÍTICA! getUsuarios (de server-utils) NO devolvió un array. Devolvió:`, usuariosData);
      // Mantenemos usuariosParaTabla como [] por seguridad.
    }
  } catch (pageError) {
    // Este catch es por si la llamada a getUsuarios() o su procesamiento aquí mismo falla
    console.error("SRV_LOG: /usuarios page.jsx - Error AL LLAMAR o PROCESAR getUsuarios:", pageError);
    // Mantenemos usuariosParaTabla como [] por seguridad.
  }

  console.log(`SRV_LOG: /usuarios page.jsx - Prop 'data' para TablaUsuarios tendrá ${usuariosParaTabla.length} elementos.`);

  return (
    <div className="flex min-h-screen w-full flex-col animate-in fade-in duration-500">
      <div className="mx-auto max-w-7xl w-full">
        <div className="mx-auto max-w-4xl sm:text-center w-full">
          <h2 className="py-10 text-3xl font-medium tracking-tight text-center text-colorPrincipal">
            GESTIÓN DE USUARIOS
          </h2>
          <p className=" text-lg leading-8 text-center text-gray-600 font-light mb-10">
            Panel de operaciones para realizar las operaciones de añadir y
            eliminar usuarios.
          </p>
        </div>
        <main className="flex flex-col items-center justify-center w-full mt-8">
          <div className="w-full max-w-4xl">
            <Card
              className="md:col-span-3 lg:col-span-2 xl:col-span-2 shadow-lg text-left"
              // x-chunk="dashboard-02-chunk-01" // Atributo no estándar, puedes quitarlo si causa problemas
            >
              <CardHeader className="flex flex-row items-center ">
                <div className="grid gap-2">
                  <CardTitle className="text-left">Usuarios</CardTitle>
                  <CardDescription>
                    Para añadir un usuario pulse el botón de la derecha.
                  </CardDescription>
                </div>
                <AddUsuario />
              </CardHeader>
              <CardContent>
                <Suspense fallback={<SkeletonDataTable />}>
                  {/* TablaUsuarios ahora también tiene una defensa interna para la prop 'data' */}
                  <TablaUsuarios data={usuariosParaTabla} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}