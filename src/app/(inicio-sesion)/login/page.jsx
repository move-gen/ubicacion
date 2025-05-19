"use client";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { redirect } from "next/navigation";

export default function LoginForm() {
  const { isAuthenticated } = useKindeBrowserClient();
  if (isAuthenticated) {
    redirect("/escanear-qr");
  }
  const [email, setEmail] = useState("");
  const connectionId =
    process.env.NEXT_PUBLIC_KINDE_CONNECTION_EMAIL_PASSWORDLESS;
  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <Link href="/">
          <Image
            src="/images/mllogo.png"
            alt="logo"
            width={160}
            height={15}
            className="shadow-sm"
          />
        </Link>
      </header>
      <div className="flex flex-col items-center justify-center -mt-16 min-h-screen px-4 md:px-0">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl border-none">
          <div className="flex justify-center mb-10">
            <Image
              src="/images/mllogo.png"
              alt="logo"
              width={200}
              height={25}
              className="shadow-sm"
            />
          </div>
          <div className="text-left mb-10">
            <h2 className="text-2xl md:text-3xl mb-3">Inicio de sesión</h2>
            <p className="text-md md:text-lg text-slate-500">
              Inicie sesión para entrar a su cuenta
            </p>
          </div>
          <div className="grid gap-6">
            <div className="grid gap-4">
              <Label htmlFor="email" className="text-md md:text-lg">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nombre@miguelleon.es"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-4 md:p-6 text-md border rounded-lg"
              />
            </div>
          </div>
          <div className="w-full mt-6">
            <LoginLink
              authUrlParams={{
                connection_id: connectionId,
                login_hint: email,
              }}
            >
              <Button className="w-full py-4 md:py-6 bg-colorPrincipal text-md">
                Iniciar sesión
              </Button>
            </LoginLink>
          </div>
        </div>
      </div>
    </>
  );
}
