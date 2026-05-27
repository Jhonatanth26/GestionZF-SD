"use client";

import { useState } from "react";

import Link from "next/link";

import { supabase } from "@/lib/supabase";

import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  Users,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [collapsed, setCollapsed] =
    useState(false);

  const handleLogout = async () => {

    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  return (

    <div className="
      flex
      min-h-screen
      bg-gray-100
    ">

      {/* SIDEBAR */}

      <aside
        className={`
          flex
          flex-col
          bg-black
          text-white
          transition-all
          duration-300

          ${
            collapsed
              ? "w-20"
              : "w-64"
          }
        `}
      >

        {/* TOP */}

        <div className="
          flex
          items-center
          justify-between
          p-4
        ">

          {!collapsed && (

            <h1 className="
              text-xl
              font-bold
            ">
              Gestión ERP
            </h1>

          )}

          <button
            onClick={() =>
              setCollapsed(!collapsed)
            }
          >

            <Menu size={22} />

          </button>

        </div>

        {/* MENU */}

        <nav className="
          mt-8
          flex
          flex-col
          gap-2
          px-3
        ">

          <Link
            href="/projects"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              transition-all
              hover:bg-gray-800
            "
          >

            <LayoutDashboard size={20} />

            {!collapsed && (
              <span>Dashboard</span>
            )}

          </Link>

          <Link
            href="/projects"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              transition-all
              hover:bg-gray-800
            "
          >

            <FolderKanban size={20} />

            {!collapsed && (
              <span>Proyectos</span>
            )}

          </Link>

          <Link
            href="/purchases"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              transition-all
              hover:bg-gray-800
            "
          >

            <ShoppingCart size={20} />

            {!collapsed && (
              <span>Compras</span>
            )}

          </Link>

          <Link
            href="/users"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              transition-all
              hover:bg-gray-800
            "
          >

            <Users size={20} />

            {!collapsed && (
              <span>Usuarios</span>
            )}

          </Link>

          <Link
            href="/reports"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              px-3
              py-3
              transition-all
              hover:bg-gray-800
            "
          >

            <FileText size={20} />

            {!collapsed && (
              <span>Reportes</span>
            )}

          </Link>

        </nav>

        {/* FOOTER */}

        <div className="mt-auto p-4">

          <button
            onClick={handleLogout}
            className="
              flex
              w-full
              items-center
              gap-3
              rounded-xl
              bg-red-500
              px-3
              py-3
              transition-all
              hover:bg-red-600
            "
          >

            <LogOut size={20} />

            {!collapsed && (
              <span>
                Cerrar sesión
              </span>
            )}

          </button>

        </div>

      </aside>

      {/* CONTENT */}

      <main className="
        flex-1
        p-6
      ">

        {children}

      </main>

    </div>
  );
}