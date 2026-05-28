"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function SetupAccountPage() {

  const [loading, setLoading] =
    useState(true);

  const [email, setEmail] =
    useState("");

  useEffect(() => {

    const loadUser = async () => {

      try {

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user?.email) {

          setEmail(
            session.user.email
          );
        }

      } catch (error) {

        console.log(error);
      }

      setLoading(false);
    };

    loadUser();

  }, []);

  if (loading) {

    return (

      <div className="
        flex
        min-h-screen
        items-center
        justify-center
      ">

        <p>
          Cargando...
        </p>

      </div>
    );
  }

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-6
    ">

      <div className="
        mx-auto
        max-w-3xl
      ">

        <div className="
          rounded-2xl
          bg-white
          p-8
          shadow-sm
        ">

          <h1 className="
            text-3xl
            font-bold
          ">
            Configurar cuenta
          </h1>

          <p className="
            mt-2
            text-gray-500
          ">
            Completa tu perfil empresarial
          </p>

          <div className="
            mt-8
            grid
            gap-5
            md:grid-cols-2
          ">

            <input
              placeholder="Cédula"
              className="
                rounded-xl
                border
                p-3
              "
            />

            <input
              placeholder="Nombre completo"
              className="
                rounded-xl
                border
                p-3
              "
            />

            <input
              value={email}
              disabled
              className="
                rounded-xl
                border
                bg-gray-50
                p-3
              "
            />

            <input
              placeholder="Cargo"
              className="
                rounded-xl
                border
                p-3
              "
            />

          </div>

          <button
            className="
              mt-8
              rounded-xl
              bg-black
              px-6
              py-3
              text-white
            "
          >
            Finalizar registro
          </button>

        </div>

      </div>

    </div>
  );
}