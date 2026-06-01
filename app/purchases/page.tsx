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
// PAGE
// =====================================================

export default function PurchasesPage() {

  // =====================================================
  // ROUTER
  // =====================================================

  const router =
    useRouter();

  // =====================================================
  // STATES
  // =====================================================

  const [
    purchases,
    setPurchases,
  ] = useState<any[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("TODOS");

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    fetchPurchases();

  }, []);

  // =====================================================
  // FETCH PURCHASES
  // =====================================================

  async function fetchPurchases() {

    try {

      setLoading(true);

      const {
        data,
        error,
      } = await supabase

        .from(
          "purchase_requests"
        )

        .select(`
          *,
          purchase_request_items (
            id
          )
        `)

        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      console.log(
        "PURCHASES:",
        data
      );

      console.log(
        "PURCHASES ERROR:",
        error
      );

      if (error) {

        alert(
          error.message
        );

        return;

      }

      setPurchases(
        data || []
      );

    } catch (error) {

      console.error(error);

      alert(
        "Error cargando solicitudes"
      );

    } finally {

      setLoading(false);

    }

  }

  // =====================================================
  // FILTERED PURCHASES
  // =====================================================

  const filteredPurchases =

    purchases.filter((purchase) => {

      const matchesSearch =

        purchase.request_number
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        purchase.title
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =

        statusFilter === "TODOS"

        ||

        purchase.general_status ===
        statusFilter;

      return (
        matchesSearch
        &&
        matchesStatus
      );

    });

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
            Compras
          </h1>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">
            Gestión de solicitudes de compra
          </p>

        </div>

        <button
          onClick={() =>
            router.push(
              "/purchases/new"
            )
          }
          className="
            rounded-2xl
            bg-black
            px-5
            py-3
            text-sm
            font-medium
            text-white
          "
        >
          Nueva solicitud
        </button>

      </div>

      {/* KPI */}

      <div className="
        mb-6
        grid
        gap-4
        md:grid-cols-4
      ">

        <KpiCard
          title="Solicitudes"
          value={
            purchases.length
          }
        />

        <KpiCard
          title="Pendientes"
          value={
            purchases.filter(
              (p) =>
                p.general_status ===
                "Pendiente jefe área"
            ).length
          }
        />

        <KpiCard
          title="Aprobadas"
          value={
            purchases.filter(
              (p) =>
                p.general_status ===
                "Aprobada"
            ).length
          }
        />

        <KpiCard
          title="Rechazadas"
          value={
            purchases.filter(
              (p) =>
                p.general_status ===
                "Rechazada"
            ).length
          }
        />

      </div>

      {/* FILTERS */}

      <div className="
        mb-6
        flex
        flex-col
        gap-4
        rounded-3xl
        bg-white
        p-4
        shadow-sm
        lg:flex-row
      ">

        <input
          placeholder="
            Buscar solicitud...
          "
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="
            h-12
            flex-1
            rounded-2xl
            border
            border-gray-200
            px-4
          "
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          className="
            h-12
            rounded-2xl
            border
            border-gray-200
            px-4
          "
        >

          <option>
            TODOS
          </option>

          <option>
            Pendiente jefe área
          </option>

          <option>
            Aprobada
          </option>

          <option>
            Rechazada
          </option>

        </select>

      </div>

      {/* TABLE */}

      <div className="
        overflow-hidden
        rounded-3xl
        bg-white
        shadow-sm
      ">

        {
          loading ? (

            <div className="
              p-10
              text-center
              text-gray-500
            ">

              Cargando solicitudes...

            </div>

          ) : filteredPurchases.length === 0 ? (

            <div className="
              p-10
              text-center
              text-gray-500
            ">

              No hay solicitudes registradas

            </div>

          ) : (

            <table className="
              w-full
            ">

              <thead className="
                bg-gray-50
              ">

                <tr>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Solicitud
                  </th>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Objetivo
                  </th>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Empresa
                  </th>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Items
                  </th>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Estado
                  </th>

                  <th className="
                    p-4
                    text-left
                    text-xs
                    uppercase
                    tracking-wider
                    text-gray-400
                  ">
                    Fecha
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  filteredPurchases.map(
                    (purchase) => (

                      <tr
                        key={purchase.id}
                        onClick={() =>
                          router.push(
                            `/purchases/${purchase.id}`
                          )
                        }
                        className="
                          cursor-pointer
                          border-t
                          transition-all
                          hover:bg-gray-50
                        "
                      >

                        <td className="
                          p-4
                          font-medium
                        ">
                          {
                            purchase.request_number
                          }
                        </td>

                        <td className="
                          p-4
                        ">
                          {
                            purchase.title
                          }
                        </td>

                        <td className="
                          p-4
                        ">
                          {
                            purchase.company
                          }
                        </td>

                        <td className="
                          p-4
                        ">
                          {
                            purchase
                              .purchase_request_items
                              ?.length || 0
                          }
                        </td>

                        <td className="
                          p-4
                        ">

                          <StatusBadge
                            status={
                              purchase.general_status
                            }
                          />

                        </td>

                        <td className="
                          p-4
                        ">
                          {
                            new Date(
                              purchase.created_at
                            ).toLocaleDateString()
                          }
                        </td>

                      </tr>

                    )
                  )
                }

              </tbody>

            </table>

          )
        }

      </div>

    </div>

  );

}

// =====================================================
// KPI CARD
// =====================================================

function KpiCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {

  return (

    <div className="
      rounded-3xl
      bg-white
      p-6
      shadow-sm
    ">

      <p className="
        text-sm
        text-gray-500
      ">
        {title}
      </p>

      <h2 className="
        mt-2
        text-3xl
        font-bold
        text-gray-900
      ">
        {value}
      </h2>

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

      {status}

    </span>

  );

}