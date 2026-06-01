
"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";
import Link from "next/link";
import { supabase }
from "@/lib/supabase";

// =====================================================
// PAGE
// =====================================================

export default function PurchaseDetailPage() {

  // =====================================================
  // PARAMS
  // =====================================================

  const params =
    useParams();

  const id =
    params.id as string;

  // =====================================================
  // STATES
  // =====================================================

  const [
    purchase,
    setPurchase,
  ] = useState<any>(null);

  const [
    approvals,
    setApprovals,
  ] = useState<any[]>([]);

  const [
    selectedItems,
    setSelectedItems,
  ] = useState<string[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    if (id) {

      fetchPurchase();

    }

  }, [id]);

  // =====================================================
  // FETCH
  // =====================================================

  async function fetchPurchase() {

    try {

      setLoading(true);

      // ==========================================
      // PURCHASE
      // ==========================================

      const {
        data,
        error,
      } = await supabase

        .from("purchase_requests")

        .select(`
          *,
          purchase_request_items (*)
        `)

        .eq(
          "id",
          id
        )

        .single();

      if (error) {

        alert(
          error.message
        );

        return;

      }

      setPurchase(data);

      // ==========================================
      // APPROVALS
      // ==========================================

      const {
        data: approvalsData,
      } = await supabase

        .from(
          "purchase_approvals"
        )

        .select("*")

        .eq(
          "request_id",
          id
        )

        .order(
          "created_at",
          {
            ascending: true,
          }
        );

      setApprovals(
        approvalsData || []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  // =====================================================
  // TOGGLE ITEM
  // =====================================================

  function toggleItem(
    itemId: string
  ) {

    const currentItem =

      purchase
        ?.purchase_request_items
        ?.find(
          (item: any) =>
            item.id === itemId
        );

    // ==========================================
    // BLOCK APPROVED/REJECTED
    // ==========================================

    if (

      currentItem
        ?.approval_status ===
      "Aprobado"

      ||

      currentItem
        ?.approval_status ===
      "Rechazado"

    ) {

      return;

    }

    setSelectedItems(
      (prev) => {

        if (
          prev.includes(itemId)
        ) {

          return prev.filter(
            (id) =>
              id !== itemId
          );

        }

        return [
          ...prev,
          itemId,
        ];

      }
    );

  }

  // =====================================================
  // SELECT ALL
  // =====================================================

  function selectAllItems() {

    const availableItems =

      purchase
        .purchase_request_items
        .filter(
          (item: any) =>

            item.approval_status !==
            "Aprobado"

            &&

            item.approval_status !==
            "Rechazado"
        );

    if (
      selectedItems.length ===
      availableItems.length
    ) {

      setSelectedItems([]);

      return;

    }

    setSelectedItems(

      availableItems.map(
        (item: any) =>
          item.id
      )

    );

  }

  // =====================================================
  // APPROVE ITEMS
  // =====================================================

  async function approveSelectedItems() {

    if (
      selectedItems.length === 0
    ) {

      alert(
        "Seleccione items"
      );

      return;

    }

    const validItems =

      purchase
        .purchase_request_items
        .filter(
          (item: any) =>

            selectedItems.includes(
              item.id
            )

            &&

            item.approval_status !==
            "Aprobado"

            &&

            item.approval_status !==
            "Rechazado"
        );

    if (
      validItems.length === 0
    ) {

      alert(
        "Los items ya fueron procesados"
      );

      return;

    }

    const {
      error,
    } = await supabase

      .from(
        "purchase_request_items"
      )

      .update({

        approval_status:
          "Aprobado",

        approved_at:
          new Date()
            .toISOString(),

      })

      .in(
        "id",

        validItems.map(
          (item: any) =>
            item.id
        )
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    // ==========================================
    // REFRESH DATA
    // ==========================================

    const {
      data: refreshedItems,
    } = await supabase

      .from(
        "purchase_request_items"
      )

      .select("*")

      .eq(
        "request_id",
        id
      );

    const allApproved =

      refreshedItems?.every(
        (item: any) =>
          item.approval_status ===
          "Aprobado"
      );

    const someApproved =

      refreshedItems?.some(
        (item: any) =>
          item.approval_status ===
          "Aprobado"
      );

    // ==========================================
    // UPDATE REQUEST STATUS
    // ==========================================

    if (allApproved) {

      await supabase

        .from(
          "purchase_requests"
        )

        .update({

          general_status:
            "Aprobada",

          workflow_step:
            "Compras",

        })

        .eq(
          "id",
          id
        );

    } else if (someApproved) {

      await supabase

        .from(
          "purchase_requests"
        )

        .update({
          general_status:
            "Parcial",
        })

        .eq(
          "id",
          id
        );

    }

    alert(
      "Items aprobados"
    );

    setSelectedItems([]);

    fetchPurchase();

  }

  // =====================================================
  // REJECT ITEMS
  // =====================================================

  async function rejectSelectedItems() {

    if (
      selectedItems.length === 0
    ) {

      alert(
        "Seleccione items"
      );

      return;

    }

    const validItems =

      purchase
        .purchase_request_items
        .filter(
          (item: any) =>

            selectedItems.includes(
              item.id
            )

            &&

            item.approval_status !==
            "Aprobado"

            &&

            item.approval_status !==
            "Rechazado"
        );

    if (
      validItems.length === 0
    ) {

      alert(
        "Los items ya fueron procesados"
      );

      return;

    }

    const reason =
      prompt(
        "Motivo rechazo"
      );

    const {
      error,
    } = await supabase

      .from(
        "purchase_request_items"
      )

      .update({

        approval_status:
          "Rechazado",

        rejection_reason:
          reason,

        approved_at:
          new Date()
            .toISOString(),

      })

      .in(
        "id",

        validItems.map(
          (item: any) =>
            item.id
        )
      );

    if (error) {

      alert(
        error.message
      );

      return;

    }

    await supabase

      .from(
        "purchase_requests"
      )

      .update({
        general_status:
          "Rechazada",
      })

      .eq(
        "id",
        id
      );

    alert(
      "Items rechazados"
    );

    setSelectedItems([]);

    fetchPurchase();

  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="
        p-10
      ">
        Cargando...
      </div>

    );

  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!purchase) {

    return (

      <div className="
        p-10
      ">
        Solicitud no encontrada
      </div>

    );

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
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
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
            ">
              {
                purchase.request_number
              }
            </h1>

            <p className="
              mt-2
              text-gray-500
            ">
              {
                purchase.title
              }
            </p>

          </div>

          <StatusBadge
            status={
              purchase.general_status
            }
          />
          {
  purchase.general_status ===
  "Aprobada"

  &&

  (

    <Link
      href={`
        /purchases/${id}/quotes
      `}
      className="
        inline-flex
        items-center
        rounded-2xl
        bg-black
        px-5
        py-3
        text-sm
        font-medium
        text-white
        transition-all
        hover:opacity-90
      "
    >

      Gestionar cotizaciones

    </Link>

  )
}

        </div>

      </div>

      {/* INFO */}

      <div className="
        mb-6
        grid
        gap-4
        md:grid-cols-4
      ">

        <InfoCard
          title="Empresa"
          value={
            purchase.company
          }
        />

        <InfoCard
          title="Área"
          value={
            purchase.area
          }
        />

        <InfoCard
          title="Cargo"
          value={
            purchase.cargo
          }
        />

        <InfoCard
          title="Workflow"
          value={
            purchase.workflow_step
          }
        />

      </div>

      {/* JUSTIFICATION */}

      <div className="
        mb-6
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <h2 className="
          mb-4
          text-lg
          font-semibold
        ">
          Justificación
        </h2>

        <p className="
          whitespace-pre-wrap
          text-gray-700
        ">
          {
            purchase.justification
          }
        </p>

      </div>

      {/* ITEMS */}

      <div className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      ">

        {/* ACTIONS */}

        <div className="
          border-b
          p-6
        ">

          <div className="
            flex
            flex-col
            gap-4
            lg:flex-row
            lg:items-center
            lg:justify-between
          ">

            <div>

              <h2 className="
                text-lg
                font-semibold
              ">
                Items solicitud
              </h2>

              <p className="
                mt-1
                text-sm
                text-gray-500
              ">
                {
                  selectedItems.length
                }
                {" "}
                seleccionados
              </p>

            </div>

            <div className="
              flex
              flex-wrap
              gap-3
            ">

              <button
                onClick={selectAllItems}
                className="
                  rounded-xl
                  border
                  border-gray-200
                  px-4
                  py-2
                  text-sm
                "
              >
                Seleccionar todos
              </button>

              <button
                onClick={
                  approveSelectedItems
                }
                className="
                  rounded-xl
                  bg-green-600
                  px-4
                  py-2
                  text-sm
                  text-white
                "
              >
                Aprobar seleccionados
              </button>

              <button
                onClick={
                  rejectSelectedItems
                }
                className="
                  rounded-xl
                  bg-red-600
                  px-4
                  py-2
                  text-sm
                  text-white
                "
              >
                Rechazar seleccionados
              </button>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <table className="
          w-full
        ">

          <thead className="
            bg-gray-50
          ">

            <tr>

              <th className="
                p-4
              ">
              </th>

              <th className="
                p-4
                text-left
              ">
                Código
              </th>

              <th className="
                p-4
                text-left
              ">
                Descripción
              </th>

              <th className="
                p-4
                text-left
              ">
                Cantidad
              </th>

              <th className="
                p-4
                text-left
              ">
                UM
              </th>

              <th className="
                p-4
                text-left
              ">
                Estado
              </th>

            </tr>

          </thead>

          <tbody>

            {
              purchase
                .purchase_request_items
                ?.map(
                  (item: any) => (

                    <tr
                      key={item.id}
                      className="
                        border-t
                      "
                    >

                      <td className="
                        p-4
                      ">

                        <input
                          type="checkbox"

                          disabled={
                            item.approval_status ===
                            "Aprobado"

                            ||

                            item.approval_status ===
                            "Rechazado"
                          }

                          checked={
                            selectedItems.includes(
                              item.id
                            )
                          }

                          onChange={() =>
                            toggleItem(
                              item.id
                            )
                          }
                        />

                      </td>

                      <td className="
                        p-4
                      ">
                        {
                          item.item_code
                        }
                      </td>

                      <td className="
                        p-4
                      ">
                        {
                          item.description
                        }
                      </td>

                      <td className="
                        p-4
                      ">
                        {
                          item.quantity
                        }
                      </td>

                      <td className="
                        p-4
                      ">
                        {
                          item.unit_measure
                        }
                      </td>

                      <td className="
                        p-4
                      ">

                        <ItemStatusBadge
                          status={
                            item.approval_status
                          }
                        />

                      </td>

                    </tr>

                  )
                )
            }

          </tbody>

        </table>

      </div>

    </div>

  );

}

// =====================================================
// INFO CARD
// =====================================================

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (

    <div className="
      rounded-3xl
      bg-white
      p-6
      shadow-sm
    ">

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
      ">
        {value || "-"}
      </p>

    </div>

  );

}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({
  status,
}: {
  status: string;
}) {

  const styles = {

    "Pendiente jefe área":
      "bg-yellow-100 text-yellow-700",

    "Aprobada":
      "bg-green-100 text-green-700",

    "Rechazada":
      "bg-red-100 text-red-700",

    "Parcial":
      "bg-blue-100 text-blue-700",

  };

  return (

    <span className={`
      rounded-full
      px-4
      py-2
      text-sm
      font-medium
      ${
        styles[
          status as keyof typeof styles
        ] || "bg-gray-100 text-gray-700"
      }
    `}>

      {status}

    </span>

  );

}

// =====================================================
// ITEM STATUS BADGE
// =====================================================

function ItemStatusBadge({
  status,
}: {
  status: string;
}) {

  const styles = {

    "Pendiente":
      "bg-yellow-100 text-yellow-700",

    "Aprobado":
      "bg-green-100 text-green-700",

    "Rechazado":
      "bg-red-100 text-red-700",

  };

  return (

    <span className={`
      rounded-full
      px-3
      py-1
      text-xs
      font-medium
      ${
        styles[
          status as keyof typeof styles
        ] || "bg-gray-100 text-gray-700"
      }
    `}>

      {status || "Pendiente"}

    </span>

  );

}
