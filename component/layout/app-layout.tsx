"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const handleLogout = async () => {
    await supabase.auth.signOut();

    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside
        className="
          hidden
          md:flex
          w-64
          flex-col
          bg-black
          text-white
          p-6
        "
      >

        <h1 className="mb-10 text-2xl font-bold">
          Gestión ERP
        </h1>

        <nav className="flex flex-col gap-4">

          <Link href="/dashboard">
            Dashboard
          </Link>

          <Link href="/projects">
            Proyectos
          </Link>

          <Link href="/purchases">
            Compras
          </Link>

          <Link href="/users">
            Usuarios
          </Link>

          <Link href="/reports">
            Reportes
          </Link>

        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto rounded-lg bg-red-500 p-3"
        >
          Cerrar sesión
        </button>

      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">
        {children}
      </main>

    </div>
  );
}