"use client";
import React, { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SIDENAV_ITEMS } from "./constants";
import { Icon } from "@iconify/react";
import { motion, useCycle } from "framer-motion";
import {
  LogoutLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";
import NotificationBell from "./components/notificationBell";
const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height * 2 + 200}px at 100% 0)`,
    transition: {
      type: "spring",
      stiffness: 20,
      restDelta: 2,
    },
  }),
  closed: {
    clipPath: "circle(0px at 100% 0)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
    },
  },
};

const HeaderMobile = () => {
  const pathname = usePathname();
  const containerRef = useRef(null);
  const { height } = useDimensions(containerRef);
  const [isOpen, toggleOpen] = useCycle(false, true);
  const { getPermissions, isLoading } = useKindeBrowserClient();
  const permissionsObj = getPermissions();
  const permissions = permissionsObj?.permissions || [];
  if (isLoading) {
    return null;
  }
  const hasPermission = (requiredPermissions) => {
    if (!requiredPermissions) return true; // Si no se requieren permisos, devolver true
    return requiredPermissions.every((permission) =>
      permissions?.includes(permission)
    );
  };
  const filteredItems = SIDENAV_ITEMS.filter((item) =>
    hasPermission(item.requirePermissions)
  );
  return (
    <>
      {/* 🔔 Campana de Notificación */}
      <div className="fixed top-1 right-12 z-50 block md:hidden">
        <NotificationBell />
      </div>

      <motion.nav
        initial={false}
        animate={isOpen ? "open" : "closed"}
        custom={height}
        className={`fixed inset-0 z-50 w-full md:hidden ${
          isOpen ? "" : "pointer-events-none"
        }`}
        ref={containerRef}
      >
        <motion.div
          className="absolute inset-0 right-0 w-full bg-white"
          variants={sidebar}
        />
        <motion.ul
          variants={variants}
          className="absolute grid w-full gap-3 px-10 py-16 max-h-screen overflow-y-auto"
        >
          {filteredItems.map((item, idx) => {
            const isLastItem = idx === filteredItems.length - 1;
            return (
              <div key={idx}>
                {item.submenu ? (
                  <MenuItemWithSubMenu item={item} toggleOpen={toggleOpen} />
                ) : (
                  <MenuItem>
                    <Link
                      href={item.path}
                      onClick={() => toggleOpen()}
                      className={`flex w-full text-2xl ${
                        item.path === pathname ? "font-bold" : ""
                      }`}
                    >
                      {item.title}
                    </Link>
                  </MenuItem>
                )}

                {!isLastItem && (
                  <MenuItem className="my-3 h-px w-full bg-gray-300" />
                )}

                {isLastItem && (
                  <MenuItem className="fixed bottom-0 left-0 w-full flex justify-center items-center pb-5">
                    <LogoutLink
                      postLogoutRedirectURL="https://ubicacion.miguelleon.es"
                      className="bg-colorPrincipal px-20 py-3 rounded-lg shadow-lg text-white"
                    >
                      Cerrar sesión
                    </LogoutLink>
                  </MenuItem>
                )}
              </div>
            );
          })}
        </motion.ul>

        {/* ✅ Botón de Toggle */}
        <MenuToggle toggle={toggleOpen} />
      </motion.nav>
    </>
  );
};

export default HeaderMobile;

const MenuToggle = ({ toggle }) => (
  <button
    onClick={toggle}
    className="pointer-events-auto absolute right-4 top-[14px] z-30"
  >
    <svg width="23" height="23" viewBox="0 0 23 23">
      <Path
        variants={{
          closed: { d: "M 2 2.5 L 20 2.5" },
          open: { d: "M 3 16.5 L 17 2.5" },
        }}
      />
      <Path
        d="M 2 9.423 L 20 9.423"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 2 16.346 L 20 16.346" },
          open: { d: "M 3 2.5 L 17 16.346" },
        }}
      />
    </svg>
  </button>
);

const Path = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

const MenuItem = ({ className, children }) => {
  return (
    <motion.li variants={MenuItemVariants} className={className}>
      {children}
    </motion.li>
  );
};

const MenuItemWithSubMenu = ({ item, toggleOpen }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);

  return (
    <>
      <MenuItem>
        <button
          className="flex w-full text-2xl"
          onClick={() => setSubMenuOpen(!subMenuOpen)}
        >
          <div className="flex flex-row justify-between w-full items-center">
            <span
              className={`${pathname.includes(item.path) ? "font-bold" : ""}`}
            >
              {item.title}
            </span>
            <div className={`${subMenuOpen && "rotate-180"}`}>
              <Icon icon="lucide:chevron-down" width="24" height="24" />
            </div>
          </div>
        </button>
      </MenuItem>
      <div className="mt-2 ml-2 flex flex-col space-y-2">
        {subMenuOpen && (
          <>
            {item.subMenuItems?.map((subItem, subIdx) => {
              return (
                <MenuItem key={subIdx}>
                  <Link
                    href={subItem.path}
                    onClick={() => toggleOpen()}
                    className={` ${
                      subItem.path === pathname ? "font-bold" : ""
                    }`}
                  >
                    {subItem.title}
                  </Link>
                </MenuItem>
              );
            })}
          </>
        )}
      </div>
    </>
  );
};

const MenuItemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
      duration: 0.02,
    },
  },
};

const variants = {
  open: {
    transition: { staggerChildren: 0.02, delayChildren: 0.15 },
  },
  closed: {
    transition: { staggerChildren: 0.01, staggerDirection: -1 },
  },
};

const useDimensions = (ref) => {
  const dimensions = useRef({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current) {
      dimensions.current.width = ref.current.offsetWidth;
      dimensions.current.height = ref.current.offsetHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  return dimensions.current;
};
