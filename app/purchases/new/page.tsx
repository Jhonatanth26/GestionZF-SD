
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import { supabase }
from "@/lib/supabase";

// =====================================================
// TYPES
// =====================================================

type ItemRow = {

  item_code: string;

  description: string;

  quantity: number;

  unit_measure: string;

  cost_center: string;

};

// =====================================================
// REQUEST NUMBER
// =====================================================

async function generateRequestNumber(
  company: string
) {

  const {
    data,
    error,
  } = await supabase.rpc(
    "generate_purchase_request_number",
    {
      company_name:
        company,
    }
  );

  console.log(
    "RPC DATA:",
    data
  );

  console.log(
    "RPC ERROR:",
    error
  );

  if (error) {

    return "ERROR";

  }

  return data;

}

// =====================================================
// PAGE
// =====================================================

export default function NewPurchasePage() {

  // =====================================================
  // ROUTER
  // =====================================================

  const router =
    useRouter();

  // =====================================================
  // STATES
  // =====================================================

  const [
    userData,
    setUserData,
  ] = useState<any>(null);

  const [
    objective,
    setObjective,
  ] = useState("");

  const [
    justification,
    setJustification,
  ] = useState("");

  const [
    requestNumber,
    setRequestNumber,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    items,
    setItems,
  ] = useState<ItemRow[]>([
    {
      item_code: "",
      description: "",
      quantity: 1,
      unit_measure: "",
      cost_center: "",
    },
  ]);

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    fetchUser();

  }, []);

  // =====================================================
  // FETCH USER
  // =====================================================

  async function fetchUser() {

    try {

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {

        alert(
          "No hay sesión activa"
        );

        return;

      }

      const {
        data,
        error,
      } = await supabase

        .from("users")

        .select("*")

        .eq(
          "auth_user_id",
          user.id
        )

        .single();

      console.log(
        "PROFILE:",
        data
      );

      console.log(
        "PROFILE ERROR:",
        error
      );

      if (error || !data) {

        alert(
          "No se encontró perfil ERP"
        );

        return;

      }

      setUserData(data);

      const generatedNumber =
        await generateRequestNumber(
          data.empresa
        );

      setRequestNumber(
        generatedNumber
      );

    } catch (error) {

      console.error(error);

    }

  }

  // =====================================================
  // ADD ITEM
  // =====================================================

  function addItem() {

    setItems([
      ...items,

      {
        item_code: "",
        description: "",
        quantity: 1,
        unit_measure: "",
        cost_center: "",
      },
    ]);

  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function removeItem(
    index: number
  ) {

    const updated =
      [...items];

    updated.splice(index, 1);

    setItems(updated);

  }

  // =====================================================
  // UPDATE ITEM
  // =====================================================

  function updateItem(
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) {

    setItems((prev) => {

      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;

    });

  }

  // =====================================================
  // SAVE PURCHASE
  // =====================================================

  async function savePurchase() {

    try {

      // ==========================================
      // VALIDATIONS
      // ==========================================

      if (!objective.trim()) {

        alert(
          "El objetivo de compra es obligatorio"
        );

        return;

      }

      if (!justification.trim()) {

        alert(
          "La justificación es obligatoria"
        );

        return;

      }

      if (items.length === 0) {

        alert(
          "Debe agregar al menos un item"
        );

        return;

      }

      const invalidItem =
        items.some(
          (item) =>

            !item.description.trim()
            ||

            !item.quantity
            ||

            item.quantity <= 0
        );

      if (invalidItem) {

        alert(
          "Todos los items deben tener descripción y cantidad válida"
        );

        return;

      }

      // ==========================================
      // START
      // ==========================================

      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {

        alert(
          "No hay usuario autenticado"
        );

        return;

      }

      if (!userData) {

        alert(
          "No se encontró perfil ERP"
        );

        return;

      }

      // ==========================================
      // INSERT REQUEST
      // ==========================================

      const {
        data: request,
        error: requestError,
      } = await supabase

        .from("purchase_requests")

        .insert([
          {

            request_number:
              requestNumber,

            title:
              objective,

            description:
              objective,

            justification,

            company:
              userData.empresa,

            department:
              userData.departamento,

            area:
              userData.area,

            requested_by:
              user.id,

            cargo:
              userData.cargo,

            sede:
              userData.sede,

           general_status:
  "Pendiente jefe área",

workflow_step:
  "Jefe área",

            request_type:
              "Compra",

            total_estimated_cost:
              0,

          },
        ])

        .select()

        .single();

      console.log(
        "REQUEST:",
        request
      );

      console.log(
        "REQUEST ERROR:",
        requestError
      );

      if (requestError) {

        alert(
          requestError.message
        );

        return;

      }

      // ==========================================
      // INSERT ITEMS
      // ==========================================

      const itemsPayload =
        items.map(
          (item) => ({

            request_id:
              request.id,

            item_code:
              item.item_code,

            description:
              item.description,

            quantity:
              item.quantity,

            unit_measure:
              item.unit_measure,

            approval_status:
              "Pendiente",

            observations:
              item.cost_center,

          })
        );

      const {
        error: itemsError,
      } = await supabase

        .from(
          "purchase_request_items"
        )

        .insert(
          itemsPayload
        );

      console.log(
        "ITEMS ERROR:",
        itemsError
      );

      if (itemsError) {

        alert(
          itemsError.message
        );

        return;

      }

      // ==========================================
      // FIRST APPROVAL
      // ==========================================

      const {
        error: approvalError,
      } = await supabase

        .from(
          "purchase_approvals"
        )

        .insert([
          {

            request_id:
              request.id,

            approval_level:
              "Jefe área",

            status:
              "Pendiente",

          },
        ]);

console.log(
  "APPROVAL ERROR:",
  approvalError
);

alert(
  JSON.stringify(
    approvalError
  )
);

      if (approvalError) {

        alert(
          approvalError.message
        );

        return;

      }

      // ==========================================
      // SUCCESS
      // ==========================================

      alert(
        "Solicitud creada correctamente"
      );

      router.push(
        `/purchases/${request.id}`
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error inesperado"
      );

    } finally {

      setLoading(false);

    }

  }

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="
      min-h-screen
      bg-[#f5f6f8]
      p-6
    ">

      {/* HEADER */}

      <div className="
        mb-6
        flex
        flex-col
        gap-4
        lg:flex-row
        lg:items-center
        lg:justify-between
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
            text-gray-900
          ">
            Nueva solicitud
          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">
            Registro de solicitud de compra
          </p>

        </div>

        <button
          onClick={savePurchase}
          disabled={loading}
          className="
            rounded-2xl
            bg-black
            px-6
            py-3
            text-sm
            font-medium
            text-white
            transition-all
            hover:opacity-90
            disabled:opacity-50
          "
        >
          {
            loading
              ? "Guardando..."
              : "Guardar solicitud"
          }
        </button>

      </div>

      {/* EXECUTIVE HEADER */}

      <div className="
        mb-6
        grid
        gap-4
        rounded-3xl
        bg-white
        p-6
        shadow-sm
        md:grid-cols-5
      ">

        <Info
          title="Solicitud"
          value={requestNumber}
        />

        <Info
          title="Empresa"
          value={
            userData?.empresa
          }
        />

        <Info
          title="Solicitante"
          value={
            userData?.full_name
          }
        />

        <Info
          title="Área"
          value={
            userData?.area
          }
        />

        <Info
          title="Fecha"
          value={
            new Date()
              .toLocaleDateString()
          }
        />

      </div>

      {/* OBJECTIVE */}

      <div className="
        mb-6
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
          mb-5
        ">

          <label className="
            mb-2
            block
            text-sm
            font-medium
          ">
            Objetivo compra *
          </label>

          <textarea
            value={objective}
            onChange={(e) =>
              setObjective(
                e.target.value
              )
            }
            rows={3}
            className="
              w-full
              rounded-2xl
              border
              border-gray-200
              p-4
              outline-none
              transition-all
              focus:border-black
            "
          />

        </div>

        <div>

          <label className="
            mb-2
            block
            text-sm
            font-medium
          ">
            Justificación *
          </label>

          <textarea
            value={justification}
            onChange={(e) =>
              setJustification(
                e.target.value
              )
            }
            rows={5}
            className="
              w-full
              rounded-2xl
              border
              border-gray-200
              p-4
              outline-none
              transition-all
              focus:border-black
            "
          />

        </div>

      </div>

      {/* ITEMS */}

      <div className="
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
          mb-6
          flex
          items-center
          justify-between
        ">

          <h2 className="
            text-lg
            font-semibold
          ">
            Items solicitud
          </h2>

          <button
            type="button"
            onClick={addItem}
            className="
              rounded-xl
              border
              border-gray-200
              px-4
              py-2
              text-sm
              transition-all
              hover:bg-gray-100
            "
          >
            Agregar item
          </button>

        </div>

        <div className="
          overflow-x-auto
        ">

          <table className="
            w-full
          ">

            <thead>

              <tr className="
                border-b
                bg-gray-50
              ">

                <th className="
                  p-3
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  Código
                </th>

                <th className="
                  p-3
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  Descripción *
                </th>

                <th className="
                  p-3
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  Cantidad *
                </th>

                <th className="
                  p-3
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  UM
                </th>

                <th className="
                  p-3
                  text-left
                  text-xs
                  uppercase
                  tracking-wider
                  text-gray-400
                ">
                  Centro costo
                </th>

                <th></th>

              </tr>

            </thead>

            <tbody>

              {
                items.map(
                  (
                    item,
                    index
                  ) => (

                    <tr
                      key={index}
                      className="
                        border-b
                      "
                    >

                      <td className="
                        p-3
                      ">

                        <input
                          value={
                            item.item_code
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "item_code",
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            outline-none
                            focus:border-black
                          "
                        />

                      </td>

                      <td className="
                        p-3
                      ">

                        <input
                          value={
                            item.description
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            outline-none
                            focus:border-black
                          "
                        />

                      </td>

                      <td className="
                        p-3
                      ">

                        <input
                          type="number"
                          min={1}
                          value={
                            item.quantity
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            outline-none
                            focus:border-black
                          "
                        />

                      </td>

                      <td className="
                        p-3
                      ">

                        <input
                          value={
                            item.unit_measure
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unit_measure",
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            outline-none
                            focus:border-black
                          "
                        />

                      </td>

                      <td className="
                        p-3
                      ">

                        <input
                          value={
                            item.cost_center
                          }
                          onChange={(e) =>
                            updateItem(
                              index,
                              "cost_center",
                              e.target.value
                            )
                          }
                          className="
                            h-11
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            outline-none
                            focus:border-black
                          "
                        />

                      </td>

                      <td className="
                        p-3
                      ">

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(
                              index
                            )
                          }
                          className="
                            rounded-xl
                            border
                            border-red-200
                            px-3
                            py-2
                            text-xs
                            text-red-600
                            transition-all
                            hover:bg-red-50
                          "
                        >
                          Eliminar
                        </button>

                      </td>

                    </tr>

                  )
                )
              }

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}

// =====================================================
// INFO CARD
// =====================================================

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div>

      <p className="
        text-xs
        uppercase
        tracking-wider
        text-gray-400
      ">
        {title}
      </p>

      <p className="
        mt-2
        text-sm
        font-medium
        text-gray-900
      ">
        {value || "-"}
      </p>

    </div>

  );

}