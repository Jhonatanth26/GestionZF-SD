"use client";

import { useState } from "react";

export default function SetupAccountPage() {

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

  return (

    <div className="
      min-h-screen
      bg-[#f5f6f8]
      p-6
    ">

      <div className="
        mx-auto
        max-w-5xl
      ">

        <div className="
          rounded-3xl
          border
          border-gray-200
          bg-white
          p-10
          shadow-sm
        ">

          {/* HEADER */}

          <div className="
            mb-10
          ">

            <h1 className="
              text-4xl
              font-bold
              tracking-tight
              text-gray-900
            ">
              Configurar cuenta
            </h1>

            <p className="
              mt-2
              text-sm
              text-gray-500
            ">
              Completa tu perfil empresarial
            </p>

          </div>

          {/* FORM */}

          <div className="
            grid
            gap-5
            md:grid-cols-2
          ">

            <input
              type="text"
              placeholder="Cédula"
              value={cedula}
              onChange={(e) =>
                setCedula(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <input
              type="text"
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <input
              type="text"
              placeholder="Cargo"
              value={cargo}
              onChange={(e) =>
                setCargo(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <select
              value={empresa}
              onChange={(e) =>
                setEmpresa(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            >

              <option>
                Zofranca
              </option>

              <option>
                SP Dique
              </option>

            </select>

            <select
              value={contractType}
              onChange={(e) =>
                setContractType(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
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

            <input
              type="text"
              placeholder="Sede"
              value={sede}
              onChange={(e) =>
                setSede(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <input
              type="text"
              placeholder="Departamento"
              value={departamento}
              onChange={(e) =>
                setDepartamento(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <input
              type="text"
              placeholder="Área"
              value={area}
              onChange={(e) =>
                setArea(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
              "
            />

            <select
              value={userLevel}
              onChange={(e) =>
                setUserLevel(
                  e.target.value
                )
              }
              className="
                h-14
                rounded-2xl
                border
                border-gray-200
                px-5
                text-sm
                outline-none
                focus:border-black
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

          {/* BUTTON */}

          <button
            className="
              mt-10
              h-14
              rounded-2xl
              bg-black
              px-8
              text-sm
              font-medium
              text-white
              transition-all
              hover:opacity-90
            "
          >
            Finalizar registro
          </button>

        </div>

      </div>

    </div>
  );
}