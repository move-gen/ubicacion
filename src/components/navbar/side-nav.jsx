"use client";
import React, { useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SIDENAV_ITEMS } from "./constants";
import { Icon } from "@iconify/react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import SkeletonSidebar from "./skeleton/side-nav-Skeleton";

const SideNav = () => {
  const { getPermissions, isLoading } = useKindeBrowserClient();
  const permissionsObj = getPermissions();
  const permissions = permissionsObj?.permissions || [];
  if (isLoading) {
    return <SkeletonSidebar />;
  }
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions) return true; // Si no se requieren permisos, devolver true
    return requiredPermissions.every((permission) =>
      permissions?.includes(permission)
    );
  };
  return (
    <div className="md:w-60 bg-white h-screen flex-1 fixed hidden md:flex ">
      <div className="flex flex-col space-y-6 w-full">
        <Link
          href="/"
          className="flex flex-row items-center justify-center w-full h-12"
        >
          <Image
            src="/images/mllogo.png"
            width={165}
            height={24}
            priority
            alt="Logo Miguel León"
            className="flex-shrink-0 drop-shadow-lg"
          />
        </Link>

        <div className="flex flex-col space-y-2  md:px-6 ">
          {SIDENAV_ITEMS.filter((item) =>
            hasPermission(item.requirePermissions)
          ).map((item, idx) => {
            return <MenuItem key={idx} item={item} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default SideNav;

const MenuItem = ({ item }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(true);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  return (
    <div className="">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg hover-bg-zinc-100 w-full justify-between hover:bg-zinc-100 ${
              pathname.startsWith(item.path)
                ? "bg-colorPrincipal text-white"
                : ""
            }`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {item.icon}
              <span className="font-normal text-md flex">{item.title}</span>
            </div>
            <div className={`${subMenuOpen ? "rotate-180" : ""} flex`}>
              <Icon icon="lucide:chevron-down" width="15" height="15" />
            </div>
          </button>

          {subMenuOpen && (
            <div className="my-2 ml-12 flex flex-col space-y-4">
              {item.subMenuItems?.map((subItem, idx) => {
                return (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`${
                      subItem.path === pathname ? "font-normal" : ""
                    }`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center p-2 px-4 rounded-lg hover:bg-colorPrincipal hover:text-white ${
            pathname.startsWith(item.path)
              ? "bg-colorPrincipal text-white font-medium drop-shadow-lg"
              : ""
          }`}
        >
          {item.icon}
          <span className="font-normal text-md flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
};
