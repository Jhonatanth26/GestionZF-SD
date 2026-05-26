"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="mb-6 text-center text-3xl font-bold">
          Gestión ERP
        </h1>

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border p-3"
          />

          <button
            onClick={handleLogin}
            className="w-full rounded-lg bg-black p-3 text-white"
          >
            Ingresar
          </button>

        </div>

      </div>

    </main>
  );
}