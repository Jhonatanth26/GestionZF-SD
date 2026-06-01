
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CompanySettingsPage() {

  const [company, setCompany] =
    useState<any>(null);

  useEffect(() => {

    fetchCompany();

  }, []);

  async function fetchCompany() {

    const { data } = await supabase

      .from("company_settings")

      .select("*")

      .single();

    setCompany(data);

  }

  async function updateField(
    field: string,
    value: any
  ) {

    await supabase

      .from("company_settings")

      .update({
        [field]: value,
      })

      .eq("id", company.id);

  }

  if (!company) {

    return (
      <div className="p-10">
        Cargando...
      </div>
    );

  }

  return (

    <div className="
      min-h-screen
      bg-[#f5f6f8]
      p-6
    ">

      <div className="
        mb-6
      ">

        <h1 className="
          text-3xl
          font-bold
        ">

          Configuración empresa

        </h1>

        <p className="
          mt-2
          text-gray-500
        ">

          Información corporativa ERP

        </p>

      </div>

      <div className="
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
          grid
          gap-5
          lg:grid-cols-2
        ">

          <input
            defaultValue={
              company.company_name
            }
            onBlur={(e) =>
              updateField(
                "company_name",
                e.target.value
              )
            }
            placeholder="Razón social"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.nit
            }
            onBlur={(e) =>
              updateField(
                "nit",
                e.target.value
              )
            }
            placeholder="NIT"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.address
            }
            onBlur={(e) =>
              updateField(
                "address",
                e.target.value
              )
            }
            placeholder="Dirección"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.city
            }
            onBlur={(e) =>
              updateField(
                "city",
                e.target.value
              )
            }
            placeholder="Ciudad"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.phone
            }
            onBlur={(e) =>
              updateField(
                "phone",
                e.target.value
              )
            }
            placeholder="Teléfono"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.email
            }
            onBlur={(e) =>
              updateField(
                "email",
                e.target.value
              )
            }
            placeholder="Correo"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

          <input
            defaultValue={
              company.website
            }
            onBlur={(e) =>
              updateField(
                "website",
                e.target.value
              )
            }
            placeholder="Sitio web"
            className="
              h-12
              rounded-2xl
              border
              border-gray-200
              px-4
            "
          />

        </div>

      </div>

    </div>

  );

}
