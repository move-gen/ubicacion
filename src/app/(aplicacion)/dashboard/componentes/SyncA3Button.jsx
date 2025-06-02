"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { syncAllPendingA3Updates } from "../actions/syncAllA3Action";
import toast from "react-hot-toast";
import { RefreshCw } from "lucide-react"; // Icono para el botón

export default function SyncA3Button() {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(null); // Para mostrar cuántos quedan
  const [lastResult, setLastResult] = useState(null);

  // Opcional: Cargar el conteo inicial de pendientes al montar el componente
  // Esto requeriría una server action adicional solo para contar.
  // Por ahora, lo dejaremos simple y el conteo se actualizará después del primer clic.

  const handleSyncAll = async () => {
    setIsLoading(true);
    setLastResult(null);
    const toastId = toast.loading("Iniciando sincronización general con A3...");

    try {
      const result = await syncAllPendingA3Updates();
      setLastResult(result);

      if (result.error) {
        toast.error(`Error en sincronización: ${result.error}`, { id: toastId });
      } else {
        let message = result.message || "Sincronización procesada.";
        if (typeof result.quedan_pendientes === 'number') {
          setPendingCount(result.quedan_pendientes);
          message += ` Quedan ${result.quedan_pendientes} pendientes.`;
        }
        toast.success(message, { id: toastId, duration: 5000 });
      }

      if (result.errores && result.errores.length > 0) {
        console.error("[SyncAllA3 Errores Detallados]:", result.errores);
        // Podrías mostrar estos errores detallados de alguna forma más visible si es necesario
      }

    } catch (e) {
      toast.error(`Excepción durante la sincronización: ${e.message}`, { id: toastId });
      console.error("[SyncAllA3 Excepción General]:", e);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-start">
      <Button
        onClick={handleSyncAll}
        disabled={isLoading}
        className="ml-auto gap-2 bg-orange-500 hover:bg-orange-600 text-white transition-transform duration-300 transform hover:scale-105 flex items-center"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        {isLoading ? "Sincronizando A3..." : "Sincronizar Todo con A3"}
      </Button>
      {pendingCount !== null && !isLoading && (
        <p className="text-xs text-gray-600 mt-1 ml-auto">
          {pendingCount > 0 ? `${pendingCount} coches aún pendientes.` : "Todos los coches sincronizados."}
        </p>
      )}
      {/* Opcional: Mostrar último resultado detallado
      {lastResult && !isLoading && (
        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded">
          {JSON.stringify(lastResult, null, 2)}
        </pre>
      )}
      */}
    </div>
  );
}
