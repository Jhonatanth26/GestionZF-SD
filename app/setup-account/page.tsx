"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

export default function SetupAccountPage() {

  const router = useRouter();

  // =====================================================
  // STATES
  // =====================================================

  const [userId, setUserId] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [cedula, setCedula] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [cargo, setCargo] =
    useState("");

  const [empresa, setEmpresa] =
    useState("Zofranca");

  const [contractType, setContractType] =
    useState("Indefinido");

  const [sede, setSede] =
    useState("");

  const [departamento, setDepartamento] =
    useState("");

  const [area, setArea] =
    useState("");

  const [userLevel, setUserLevel] =
    useState("Analista");

  // =====================================================
  // SESSION
  // =====================================================

  useEffect(() => {

    const getSession = async () => {

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {

        router.push("/login");

        return;
      }

      setUserId(
        session.user.id
      );

      setEmail(
        session.user.email || ""
      );
    };

    getSession();

  }, [router]);

  // =====================================================
  // CREATE PROFILE
  // =====================================================

  const createProfile = async () => {

    // UPDATE PASSWORD

    const { error: passwordError } =
      await supabase.auth.updateUser({

        password,

      });

    if (passwordError) {

      alert(passwordError.message);

      return;
    }

    // INSERT USER

    const { error } = await supabase
      .from("users")
      .insert([

        {
          auth_user_id: userId,

          cedula,

          full_name: fullName,

          email,

          cargo,

          empresa,

          contract_type: contractType,

          sede,

          departamento,

          area,

          user_level: userLevel,

        },

      ]);

    if (error) {

      alert(error.message);

      return;
    }

    router.push("/projects");
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="
      min-h-screen
      bg-gray-100
      p-6
    ">

      <div className="
        mx-auto
        max-w-4xl
      ">

        {/* HEADER */}

        <div className="
          mb-8
        ">

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">
            Configurar cuenta
          </h1>

          <p className="
            mt-2
            text-gray-500
          ">
            Completa tu información empresarial
          </p>

        </div>

        {/* FORM */}

        <div className="
          rounded-2xl
          bg-white
          p-8
          shadow-sm
        ">

          <div className="
            grid
            gap-5
            md:grid-cols-2
          ">

            {/* CEDULA */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Cédula
              </label>

              <input
                type="text"
                value={cedula}
                onChange={(e) =>
                  setCedula(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* NOMBRE */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Nombre completo
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Contraseña
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* CARGO */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Cargo
              </label>

              <input
                type="text"
                value={cargo}
                onChange={(e) =>
                  setCargo(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* EMPRESA */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Empresa
              </label>

              <select
                value={empresa}
                onChange={(e) =>
                  setEmpresa(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              >

                <option>
                  Zofranca
                </option>

                <option>
                  SP Dique
                </option>

              </select>

            </div>

            {/* TIPO */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Tipo contrato
              </label>

              <select
                value={contractType}
                onChange={(e) =>
                  setContractType(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              >

                <option>
                  Indefinido
                </option>

                <option>
                  Fijo
                </option>

                <option>
                  Temporal
                </option>

                <option>
                  Prestación de servicios
                </option>

              </select>

            </div>

            {/* SEDE */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Sede
              </label>

              <input
                type="text"
                value={sede}
                onChange={(e) =>
                  setSede(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* DEPARTAMENTO */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Departamento
              </label>

              <input
                type="text"
                value={departamento}
                onChange={(e) =>
                  setDepartamento(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* AREA */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Área
              </label>

              <input
                type="text"
                value={area}
                onChange={(e) =>
                  setArea(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              />

            </div>

            {/* NIVEL */}

            <div>

              <label className="
                mb-2
                block
                text-sm
                font-medium
              ">
                Nivel usuario
              </label>

              <select
                value={userLevel}
                onChange={(e) =>
                  setUserLevel(
                    e.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  p-3
                "
              >

                <option>
                  Super Admin
                </option>

                <option>
                  Administrador
                </option>

                <option>
                  Líder
                </option>

                <option>
                  Coordinador
                </option>

                <option>
                  Analista
                </option>

                <option>
                  Consulta
                </option>

              </select>

            </div>

          </div>

          {/* BUTTON */}

          <button
            onClick={createProfile}
            className="
              mt-8
              rounded-xl
              bg-black
              px-8
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