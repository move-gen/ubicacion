"use client";

import React from "react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import Image from "next/image";
import useScroll from "@/hooks/use-scroll";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CircleUser, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs";
import NotificationBell from "./components/notificationBell";

const Header = () => {
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();

  return (
    <div
      className={cn(
        `sticky inset-x-0 top-0 z-30 w-full transition-all border-b border-gray-100`,
        {
          " bg-white/75 backdrop-blur-lg": scrolled,
          " bg-white": selectedLayout,
        }
      )}
    >
      <div className="flex h-[47px] items-center justify-between px-4">
        {/* ✅ Logo */}
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="flex flex-row space-x-3 items-center justify-center md:hidden"
          >
            <Image
              src="/images/mllogo.png"
              width={165}
              height={24}
              alt="Logo Miguel León"
              priority
            />
          </Link>
        </div>

        {/* ✅ Notificaciones y Menú de Usuario */}
        <div className="hidden md:flex items-center space-x-4">
          {/* 🔔 Campana de Notificación */}
          <NotificationBell />

          {/* 👤 Botón de Logout (siempre visible) */}
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-center bg-gray-100">
            <div className="relative inline-block text-left">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center focus:outline-none">
                  <div className="group">
                    <Avatar className="group-hover:opacity-75 transition-opacity duration-200">
                      <AvatarFallback>
                        <CircleUser size={24} color="#000" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <DropdownMenuItem className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                    <LogoutLink
                      postLogoutRedirectURL="https://ubicacion.miguelleon.es"
                      className="flex items-center w-full"
                    >
                      <LogOut size={16} className="mr-3" />
                      <span className="flex-1 text-left">Cerrar Sesión</span>
                    </LogoutLink>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
