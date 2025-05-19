"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Bell, Car, AlertCircle, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";

const NotificationBell = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [open, setOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ Autenticación y permisos
  const { isAuthenticated, getPermission, isLoading } = useKindeBrowserClient();

  // ✅ Verificamos permisos
  useEffect(() => {
    if (!isLoading) {
      const permission = getPermission("crud:ubicacion_coches");
      if (isAuthenticated && permission.isGranted) {
        setIsAdmin(true);
      }
    }
  }, [isAuthenticated, getPermission, isLoading]);

  // ✅ Fetch de notificaciones
  useEffect(() => {
    if (isAdmin) {
      const fetchNotificaciones = async () => {
        try {
          const res = await fetch("/api/comprobar-a3");
          const data = await res.json();
          setNotificaciones(data);
        } catch (error) {
          console.error("Error al obtener notificaciones:", error);
        }
      };

      fetchNotificaciones();
    }
  }, [isAdmin]);

  // ✅ Filtrado dinámico para Reintentos (>5)
  const cochesConMasDe5Reintentos = useMemo(() => {
    return notificaciones
      .filter((item) => item.numeroReintentosA3 > 5)
      .sort((a, b) => b.numeroReintentosA3 - a.numeroReintentosA3);
  }, [notificaciones]);
  // ✅ Filtrado dinámico general para el badge (pero lo eliminamos más adelante)
  // const notificacionesConReintentos = useMemo(() => {
  //   return notificaciones.filter((item) => item.numeroReintentosA3 > 0);
  // }, [notificaciones]);
  if (isLoading) {
    return (
      <div className="relative flex items-center justify-center p-2 rounded-full bg-gray-100">
        <div className="animate-pulse w-6 h-6 bg-gray-200 rounded-md"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="relative flex items-center justify-center p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Bell className="w-6 h-6 text-gray-700" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Notificaciones de A3
          </DialogTitle>
          <DialogDescription className="text-gray-700 mt-2">
            Vehículos pendientes de sincronización en A3.
          </DialogDescription>
        </DialogHeader>

        {/* ✅ Pestañas */}
        <Tabs defaultValue="todos">
          <TabsList className="grid grid-cols-2 w-full shadow-sm bg-gray-100 rounded-lg">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="reintentos">
              Reintentos
              {/* ✅ Badge actualizado para Reintentos (>5) */}
              {cochesConMasDe5Reintentos.length > 0 && (
                <Badge className="ml-2 text-blue-800 bg-muted border hover:bg-muted border-blue-800">
                  {cochesConMasDe5Reintentos.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ✅ Pestaña "Todos" */}
          <TabsContent value="todos">
            {notificaciones.length > 0 ? (
              <ScrollArea className="h-64 mt-4">
                <ul className="space-y-3">
                  {notificaciones.map((coche) => (
                    <li
                      key={coche.matricula}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <Car className="w-6 h-6 text-blue-800" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {coche.marca}
                        </p>
                        <p className="text-xs text-gray-600">
                          Matrícula: {coche.matricula}
                        </p>
                        {coche.ubicacion && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {coche.ubicacion.nombre}
                          </p>
                        )}
                      </div>
                      {/* Mostrar reintentos si >5 con texto condicional */}
                      {coche.numeroReintentosA3 > 5 && (
                        <Badge
                          variant="outline"
                          className="text-blue-800 border-blue-800 bg-white"
                        >
                          {coche.numeroReintentosA3 === 1
                            ? "1 reintento"
                            : coche.numeroReintentosA3 > 5
                            ? "1 reintento"
                            : `${coche.numeroReintentosA3} reintentos`}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-gray-500 p-4">
                No hay vehículos pendientes de sincronizarse.
              </p>
            )}
          </TabsContent>

          {/* ✅ Pestaña "Reintentos" */}
          <TabsContent value="reintentos">
            {cochesConMasDe5Reintentos.length > 0 ? (
              <ScrollArea className="h-64 mt-4">
                <ul className="space-y-3">
                  {cochesConMasDe5Reintentos.map((coche) => (
                    <li
                      key={coche.matricula}
                      className="flex items-center space-x-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {coche.marca}
                        </p>
                        <p className="text-xs text-gray-600">
                          Matrícula: {coche.matricula}
                        </p>
                        {coche.ubicacion && (
                          <p className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {coche.ubicacion.nombre}
                          </p>
                        )}
                        {coche.numeroReintentosA3 > 6 && (
                          <p className="text-xs text-red-500 mt-2 font-semibold">
                            Por favor verifique en el apartado de ubicaciones
                            que esté correcto el nombre en A3.
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-red-600 font-bold">
                        {/* Texto condicional para reintentos */}
                        {coche.numeroReintentosA3 === 1
                          ? "1 reintento"
                          : coche.numeroReintentosA3 > 5
                          ? "1 reintento"
                          : `${coche.numeroReintentosA3} reintentos`}
                      </p>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            ) : (
              <p className="text-sm text-gray-500 p-4">
                No hay vehículos con reintentos de sincronización.
              </p>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button
            onClick={() => setOpen(false)}
            className="bg-colorPrincipal hover:bg-blue-900 text-white"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationBell;
