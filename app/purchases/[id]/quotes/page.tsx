"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PurchaseQuotesPage() {

  const params = useParams();
  const id = params.id as string;

  const [purchase, setPurchase] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [supplierName, setSupplierName] = useState("");
  const [supplierNit, setSupplierNit] = useState("");

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {

    if (id) {
      fetchData();
    }

  }, [id]);

  // =====================================================
  // FETCH
  // =====================================================

  async function fetchData() {

    try {

      setLoading(true);

      const { data: purchaseData } = await supabase

        .from("purchase_requests")

        .select(`
          *,
          purchase_request_items (*)
        `)

        .eq("id", id)

        .single();

      setPurchase(purchaseData);

      const { data: suppliersData } = await supabase

        .from("suppliers")

        .select("*")

        .order("supplier_name");

      setSuppliers(suppliersData || []);

      const { data: unitsData } = await supabase

        .from("units_of_measure")

        .select("*")

        .order("code");

      setUnits(unitsData || []);

      const { data: quotesData } = await supabase

        .from("purchase_quotes")

        .select(`
          *,
          suppliers (
            supplier_name
          ),
          purchase_quote_items (*)
        `)

        .eq("request_id", id)

        .order("created_at", {
          ascending: true,
        });

      setQuotes(quotesData || []);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  // =====================================================
  // CREATE SUPPLIER
  // =====================================================

  async function createSupplier() {

    if (!supplierName.trim()) {
      alert("Ingrese proveedor");
      return;
    }

    const { error } = await supabase

      .from("suppliers")

      .insert([
        {
          supplier_name: supplierName,
          nit: supplierNit,
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setSupplierName("");
    setSupplierNit("");

    fetchData();

  }

  // =====================================================
  // CREATE QUOTE
  // =====================================================

  async function createQuote(
    supplierId: string
  ) {

    const { data: quote, error } = await supabase

      .from("purchase_quotes")

      .insert([
        {
          request_id: id,
          supplier_id: supplierId,
          quote_date: new Date(),
          currency: "COP",
          payment_method: "",
          delivery_time: "",
          quote_status: "Borrador",
        },
      ])

      .select()

      .single();

    if (error) {
      alert(error.message);
      return;
    }

    const quoteItems =

      purchase.purchase_request_items.map(
        (item: any) => ({

          quote_id: quote.id,

          request_item_id: item.id,

          supplier_item_description:
            item.description,

          quantity: item.quantity,

          supplier_quantity:
            item.quantity || 1,

          supplier_um:
            item.um || "UND",

          conversion_factor: 1,

          unit_price: 0,

          observations: "",

          selected: false,

        })
      );

    await supabase

      .from("purchase_quote_items")

      .insert(quoteItems);

    fetchData();

  }

  // =====================================================
  // UPDATE HEADER
  // =====================================================

  async function updateQuoteHeader(
    quoteId: string,
    field: string,
    value: any
  ) {

    await supabase

      .from("purchase_quotes")

      .update({
        [field]: value,
      })

      .eq("id", quoteId);

  }

  // =====================================================
  // UPDATE ITEM
  // =====================================================

  async function updateQuoteItem(
    itemId: string,
    field: string,
    value: any
  ) {

    const updatedQuotes = quotes.map(
      (quote) => ({

        ...quote,

        purchase_quote_items:

          quote.purchase_quote_items.map(
            (item: any) => {

              if (item.id !== itemId) {
                return item;
              }

              return {

                ...item,

                [field]: value,

              };

            }
          ),

      })
    );

    setQuotes(
      JSON.parse(
        JSON.stringify(updatedQuotes)
      )
    );

    const updatedItem =

      updatedQuotes

        .flatMap(
          (q) =>
            q.purchase_quote_items
        )

        .find(
          (item: any) =>
            item.id === itemId
        );

    if (!updatedItem) return;

    await supabase

      .from("purchase_quote_items")

      .update({

        supplier_quantity:
          updatedItem.supplier_quantity,

        conversion_factor:
          updatedItem.conversion_factor,

        unit_price:
          updatedItem.unit_price,

        observations:
          updatedItem.observations,

        supplier_um:
          updatedItem.supplier_um,

      })

      .eq("id", itemId);

  }

  // =====================================================
  // SAVE QUOTE
  // =====================================================

  async function saveQuote(
    quoteId: string
  ) {

    await supabase

      .from("purchase_quotes")

      .update({
        quote_status: "Cotizado",
      })

      .eq("id", quoteId);

    alert("Cotización guardada");

  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="p-10">
        Cargando...
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
        flex
        items-center
        justify-between
      ">

        <div>

          <h1 className="
            text-3xl
            font-bold
          ">

            Cotizaciones

          </h1>

          <p className="
            mt-2
            text-gray-500
          ">

            {
              purchase?.request_number
            }

          </p>

        </div>

      </div>

      {/* CREATE SUPPLIER */}

      <div className="
        mb-6
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
          grid
          gap-4
          md:grid-cols-3
        ">

          <input
            placeholder="Nombre proveedor"
            value={supplierName}
            onChange={(e) =>
              setSupplierName(
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
          />

          <input
            placeholder="NIT"
            value={supplierNit}
            onChange={(e) =>
              setSupplierNit(
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
          />

          <button
            onClick={createSupplier}
            className="
              rounded-2xl
              bg-black
              px-4
              py-3
              text-white
            "
          >

            Crear proveedor

          </button>

        </div>

      </div>

      {/* CREATE QUOTES */}

      <div className="
        mb-6
        rounded-3xl
        bg-white
        p-6
        shadow-sm
      ">

        <div className="
          flex
          flex-wrap
          gap-3
        ">

          {
            suppliers.map(
              (supplier) => (

                <button
                  key={supplier.id}
                  onClick={() =>
                    createQuote(
                      supplier.id
                    )
                  }
                  className="
                    rounded-2xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    hover:bg-gray-100
                  "
                >

                  {
                    supplier.supplier_name
                  }

                </button>

              )
            )
          }

        </div>

      </div>

      {/* TABLE */}

      <div className="
        overflow-auto
        rounded-3xl
        bg-white
        shadow-sm
      ">

        <table className="
          min-w-full
          border-collapse
        ">

          <thead className="bg-gray-50">

            <tr>

              <th className="
                min-w-[240px]
                border-b
                border-r
                p-5
                text-left
              ">

                Item

              </th>

              {
                quotes.map(
                  (quote) => (

                    <th
                      key={quote.id}
                      className="
                        min-w-[340px]
                        border-b
                        border-r
                        p-5
                        align-top
                      "
                    >

                      <div className="
                        space-y-3
                      ">

                        <p className="
                          text-lg
                          font-bold
                        ">

                          {
                            quote.suppliers
                              ?.supplier_name
                          }

                        </p>

                        <input
                          value={
                            quote.delivery_time || ""
                          }
                          onChange={(e) =>
                            updateQuoteHeader(
                              quote.id,
                              "delivery_time",
                              e.target.value
                            )
                          }
                          placeholder="Tiempo entrega"
                          className="
                            h-10
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            text-sm
                          "
                        />

                        <select
                          value={
                            quote.payment_method || ""
                          }
                          onChange={(e) =>
                            updateQuoteHeader(
                              quote.id,
                              "payment_method",
                              e.target.value
                            )
                          }
                          className="
                            h-10
                            w-full
                            rounded-xl
                            border
                            border-gray-200
                            px-3
                            text-sm
                          "
                        >

                          <option value="">
                            Método pago
                          </option>

                          <option value="Contado">
                            Contado
                          </option>

                          <option value="30 días">
                            Crédito 30 días
                          </option>

                          <option value="60 días">
                            Crédito 60 días
                          </option>

                          <option value="90 días">
                            Crédito 90 días
                          </option>

                        </select>

                        <button
                          onClick={() =>
                            saveQuote(
                              quote.id
                            )
                          }
                          className="
                            w-full
                            rounded-xl
                            bg-blue-600
                            px-4
                            py-2
                            text-sm
                            text-white
                          "
                        >

                          Guardar cotización

                        </button>

                      </div>

                    </th>

                  )
                )
              }

            </tr>

          </thead>

          <tbody>

            {
              purchase?.purchase_request_items?.map(
                (
                  requestItem: any
                ) => (

                  <tr
                    key={requestItem.id}
                    className="border-b"
                  >

                    <td className="
                      border-r
                      p-5
                      align-top
                    ">

                      <div>

                        <p className="
                          text-sm
                          font-semibold
                        ">

                          {
                            requestItem.description
                          }

                        </p>

                      </div>

                    </td>

                    {
                      quotes.map(
                        (quote) => {

                          const quoteItem =

                            quote
                              .purchase_quote_items
                              ?.find(
                                (item: any) =>
                                  item.request_item_id ===
                                  requestItem.id
                              );

                          if (!quoteItem) {

                            return (
                              <td
                                key={quote.id}
                                className="
                                  border-r
                                  p-5
                                "
                              >
                                -
                              </td>
                            );

                          }

                          const equivalentQuantity =

                            Number(
                              quoteItem.supplier_quantity || 0
                            )

                            *

                            Number(
                              quoteItem.conversion_factor || 0
                            );

                          const total =

                            Number(
                              quoteItem.supplier_quantity || 0
                            )

                            *

                            Number(
                              quoteItem.unit_price || 0
                            );

                          const equivalentPrice =

                            equivalentQuantity > 0

                              ? total / equivalentQuantity

                              : 0;

                          return (

                            <td
                              key={quote.id}
                              className="
                                border-r
                                p-5
                                align-top
                              "
                            >

                              <div className="
                                space-y-4
                              ">

                                {/* QTY */}

                                <input
                                  type="number"
                                  value={
                                    quoteItem.supplier_quantity || ""
                                  }
                                  onChange={(e) =>
                                    updateQuoteItem(
                                      quoteItem.id,
                                      "supplier_quantity",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-3
                                  "
                                />

                                {/* UM */}

                                <select
                                  value={
                                    quoteItem.supplier_um || ""
                                  }
                                  onChange={(e) =>
                                    updateQuoteItem(
                                      quoteItem.id,
                                      "supplier_um",
                                      e.target.value
                                    )
                                  }
                                  className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-3
                                  "
                                >

                                  {
                                    units.map(
                                      (unit: any) => (

                                        <option
                                          key={unit.id}
                                          value={unit.code}
                                        >

                                          {
                                            unit.code
                                          }

                                        </option>

                                      )
                                    )
                                  }

                                </select>

                                {/* FACTOR */}

                                <input
                                  type="number"
                                  value={
                                    quoteItem.conversion_factor || ""
                                  }
                                  onChange={(e) =>
                                    updateQuoteItem(
                                      quoteItem.id,
                                      "conversion_factor",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-3
                                  "
                                />

                                {/* EQUIVALENT */}

                                <div className="
                                  rounded-2xl
                                  bg-blue-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    text-blue-500
                                  ">

                                    Cantidad equivalente

                                  </p>

                                  <p className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    text-blue-700
                                  ">

                                    {
                                      equivalentQuantity
                                    }

                                  </p>

                                </div>

                                {/* PRICE */}

                                <input
                                  type="number"
                                  value={
                                    quoteItem.unit_price || ""
                                  }
                                  onChange={(e) =>
                                    updateQuoteItem(
                                      quoteItem.id,
                                      "unit_price",
                                      Number(e.target.value)
                                    )
                                  }
                                  className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    px-3
                                  "
                                />

                                {/* TOTAL */}

                                <div className="
                                  rounded-2xl
                                  bg-gray-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    text-gray-400
                                  ">

                                    Valor total

                                  </p>

                                  <p className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                  ">

                                    ${" "}

                                    {
                                      total.toLocaleString(
                                        "es-CO",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )
                                    }

                                  </p>

                                </div>

                                {/* OBS */}

                                <textarea
                                  value={
                                    quoteItem.observations || ""
                                  }
                                  onChange={(e) =>
                                    updateQuoteItem(
                                      quoteItem.id,
                                      "observations",
                                      e.target.value
                                    )
                                  }
                                  rows={3}
                                  className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    p-3
                                  "
                                />

                                {/* EQUIVALENT PRICE */}

                                <div className="
                                  rounded-2xl
                                  bg-yellow-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    text-yellow-600
                                  ">

                                    Precio equivalente

                                  </p>

                                  <p className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    text-yellow-700
                                  ">

                                    ${" "}

                                    {
                                      equivalentPrice.toLocaleString(
                                        "es-CO",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )
                                    }

                                  </p>

                                </div>

                              </div>

                            </td>

                          );

                        }
                      )
                    }

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