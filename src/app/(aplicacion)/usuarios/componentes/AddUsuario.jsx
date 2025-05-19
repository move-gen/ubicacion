"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import toast from "react-hot-toast";
import { crearUsuario } from "../actions/crearUsuario";

export default function AddUsuario() {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [puesto, setPuesto] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="ml-auto gap-1 bg-colorPrincipal transition-transform duration-300 transform hover:scale-105"
        >
          Añadir usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir usuario</DialogTitle>
          <DialogDescription>
            Introduzca los datos necesarios para proceder a incorporarlos en el
            sistema
          </DialogDescription>
        </DialogHeader>
        <form
          action={async (formData) => {
            const { message, error } = await crearUsuario(formData);
            if (error) {
              toast.error(message);
            } else {
              toast.success(message);
            }
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre
              </Label>

              <Input
                id="nombre"
                value={nombre}
                name="nombre"
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Apellidos
              </Label>

              <Input
                id="apellidos"
                value={apellidos}
                name="apellidos"
                onChange={(e) => setApellidos(e.target.value)}
                placeholder="Apellidos"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>

              <Input
                id="email"
                value={email}
                type="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@miguelleon.es"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Puesto
              </Label>

              <Input
                id="puesto"
                value={puesto}
                name="puesto"
                onChange={(e) => setPuesto(e.target.value)}
                placeholder="Puesto"
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="latitud" className="text-right">
                Rol
              </Label>
              <Select required name="rol">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Rol</SelectLabel>
                    <SelectItem value="administrador-leon">
                      Administrador
                    </SelectItem>
                    <SelectItem value="empleado-generar-qr">
                      Generador QR
                    </SelectItem>
                    <SelectItem value="escanear-qr">Escanear QR</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-colorPrincipal">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
