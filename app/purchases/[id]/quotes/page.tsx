
"use client";

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

      // PURCHASE

      const { data: purchaseData } = await supabase

        .from("purchase_requests")

        .select(`
          *,
          purchase_request_items (*)
        `)

        .eq("id", id)

        .single();

      setPurchase(purchaseData);

      // SUPPLIERS

      const { data: suppliersData } = await supabase

        .from("suppliers")

        .select("*")

        .order("supplier_name");

      setSuppliers(suppliersData || []);

      // UNITS

      const { data: unitsData } = await supabase

        .from("units_of_measure")

        .select("*")

        .order("code");

      setUnits(unitsData || []);

      // QUOTES

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
  // WORKFLOW
  // =====================================================

  async function updateWorkflowStatus(
    status: string
  ) {

    await supabase

      .from("purchase_requests")

      .update({
        workflow_status: status,
      })

      .eq("id", id);

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

    alert("Proveedor creado");

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

          equivalent_quantity:
            item.quantity || 1,

          unit_price: 0,

          total: 0,

          equivalent_unit_price: 0,

          observations: "",

          selected: false,

        })
      );

    await supabase

      .from("purchase_quote_items")

      .insert(quoteItems);

    alert("Cotización creada");

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

    const currentItem =

      quotes

        .flatMap((q) => q.purchase_quote_items)

        .find(
          (item: any) =>
            item.id === itemId
        );

    const updatedData: any = {
      [field]: value,
    };

    const unitPrice =

      field === "unit_price"

        ? Number(value)

        : Number(
            currentItem?.unit_price || 0
          );

    const supplierQuantity =

      field === "supplier_quantity"

        ? Number(value)

        : Number(
            currentItem?.supplier_quantity || 0
          );

    const conversionFactor =

      field === "conversion_factor"

        ? Number(value)

        : Number(
            currentItem?.conversion_factor || 1
          );

    const equivalentQuantity =

      supplierQuantity *
      conversionFactor;

    const total =

      unitPrice *
      supplierQuantity;

    const equivalentUnitPrice =

      equivalentQuantity > 0

        ? total / equivalentQuantity

        : 0;

    updatedData.total =
      total;

    updatedData.equivalent_quantity =
      equivalentQuantity;

    updatedData.equivalent_unit_price =
      equivalentUnitPrice;

    await supabase

      .from("purchase_quote_items")

      .update(updatedData)

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

    fetchData();

  }

  // =====================================================
  // SELECT WINNER
  // =====================================================

  async function selectWinner(
    quoteItemId: string
  ) {

    const quoteItem =

      quotes

        .flatMap((q) => q.purchase_quote_items)

        .find(
          (item: any) =>
            item.id === quoteItemId
        );

    if (!quoteItem) return;

    await supabase

      .from("purchase_quote_items")

      .update({
        selected: false,
      })

      .eq(
        "request_item_id",
        quoteItem.request_item_id
      );

    await supabase

      .from("purchase_quote_items")

      .update({
        selected: true,
      })

      .eq("id", quoteItemId);

await updateWorkflowStatus(
  "Comparativo generado"
);

await fetchData();

alert("Proveedor adjudicado");

  }

  // =====================================================
  // AUTO AWARD
  // =====================================================

  async function autoAward() {

    for (const requestItem of purchase.purchase_request_items) {

      const itemQuotes =

        quotes

          .flatMap((q) => q.purchase_quote_items)

          .filter(
            (item: any) =>
              item.request_item_id ===
              requestItem.id
          );

      if (itemQuotes.length === 0) continue;

      const bestQuote =

        itemQuotes.reduce(
          (prev: any, current: any) =>

            Number(
              current.equivalent_unit_price || 0
            )

            <

            Number(
              prev.equivalent_unit_price || 0
            )

              ? current

              : prev
        );

      await supabase

        .from("purchase_quote_items")

        .update({
          selected: false,
        })

        .eq(
          "request_item_id",
          requestItem.id
        );

      await supabase

        .from("purchase_quote_items")

        .update({
          selected: true,
        })

        .eq("id", bestQuote.id);

    }

  await updateWorkflowStatus(
  "Comparativo generado"
);

await fetchData();

alert(
  "Cotizaciones sugeridas adjudicadas"
);
  }
async function generatePurchaseOrder() {

  const selectedItems =

    quotes

      .flatMap(
        (q) =>

          q.purchase_quote_items.map(
            (item: any) => ({

              ...item,

              supplier_id:
                q.supplier_id,

              payment_method:
                q.payment_method,

              delivery_time:
                q.delivery_time,

            })
          )
      )

      .filter(
        (item: any) =>
          item.selected
      );

  if (
    selectedItems.length === 0
  ) {

    alert(
      "No hay items adjudicados"
    );

    return;

  }

  const supplierId =
    selectedItems[0].supplier_id;

  const total =

    selectedItems.reduce(
      (
        acc: number,
        item: any
      ) =>

        acc +
        Number(
          item.total || 0
        ),

      0
    );

  const ocNumber =

    `OC-${Date.now()}`;

  // CREATE OC

  const {
    data: oc,
    error,
  } = await supabase

    .from(
      "purchase_orders"
    )

    .insert([
      {

        request_id:
          id,

        supplier_id:
          supplierId,

        oc_number:
          ocNumber,

        payment_method:
          selectedItems[0]
            .payment_method,

        delivery_time:
          selectedItems[0]
            .delivery_time,

        total,

        status:
          "Abierta",

      },
    ])

    .select()

    .single();

  if (error) {

    alert(
      error.message
    );

    return;

  }

  // CREATE ITEMS

  const orderItems =

    selectedItems.map(
      (item: any) => ({

        purchase_order_id:
          oc.id,

        request_item_id:
          item.request_item_id,

        description:
          item.supplier_item_description,

        quantity:
          item.supplier_quantity,

        um:
          item.supplier_um,

        unit_price:
          item.unit_price,

        total:
          item.total,

      })
    );

  await supabase

    .from(
      "purchase_order_items"
    )

    .insert(
      orderItems
    );

  await supabase

    .from(
      "purchase_requests"
    )

    .update({

      workflow_status:
        "Finalizada",

    })

    .eq(
      "id",
      id
    );

  alert(
    `OC generada: ${ocNumber}`
  );

  fetchData();

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
  // WORKFLOW STEPS
  // =====================================================

const workflowSteps = [

  "Solicitud creada",

  "Aprobada",

  "Comparativo generado",

  "Pendiente financiera",

  "Aprobada financiera",

  "Pendiente comité",

  "OC generada",

];

  const currentWorkflowIndex =
    workflowSteps.indexOf(
      purchase?.workflow_status
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="
      min-h-screen
      bg-[#f5f6f8]
      p-4
      lg:p-6
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

        <button
          onClick={autoAward}
          className="
            rounded-2xl
            bg-blue-600
            px-5
            py-3
            text-sm
            font-medium
            text-white
          "
        >

          Adjudicar sugerida

        </button>

      </div>

      {/* WORKFLOW */}

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
          items-center
          gap-4
        ">

          {
            workflowSteps.map(
              (
                step,
                index
              ) => {

                const active =
                  index <=
                  currentWorkflowIndex;

                return (

                  <div
                    key={step}
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <div className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      text-sm
                      font-bold

                      ${
                        active

                          ? "bg-green-600 text-white"

                          : "bg-gray-200 text-gray-500"
                      }
                    `}>

                      {
                        active
                          ? "✓"
                          : index + 1
                      }

                    </div>

                    <p className={`
                      text-sm
                      font-medium

                      ${
                        active
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                    `}>

                      {step}

                    </p>

                  </div>

                );

              }
            )
          }

        </div>

      </div>

      {/* COMMITTEE */}

{
  purchase?.workflow_status ===
  "Aprobada financiera"

  &&

  (

    <div className="
      mb-6
      rounded-3xl
      bg-white
      p-6
      shadow-sm
    ">

      <div className="
        mb-5
        flex
        items-center
        justify-between
      ">

        <div>

          <h2 className="
            text-xl
            font-bold
          ">

            Comité de compras

          </h2>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Validación corporativa final

          </p>

        </div>

        <div className={`
          rounded-full
          px-4
          py-2
          text-sm
          font-medium

          ${
            purchase.committee_status === "Aprobado"

              ? "bg-green-100 text-green-700"

              : purchase.committee_status === "Rechazado"

              ? "bg-red-100 text-red-700"

              : "bg-yellow-100 text-yellow-700"
          }
        `}>

          {
            purchase.committee_status || "Pendiente"
          }

        </div>

      </div>

      {/* REQUIRE COMMITTEE */}

      <div className="
        mb-6
        rounded-2xl
        border
        border-gray-200
        p-5
      ">

        <label className="
          mb-3
          block
          text-sm
          font-medium
        ">

          ¿Requiere comité?

        </label>

        <div className="
          flex
          flex-wrap
          gap-3
        ">

          <button
            onClick={async () => {

              await supabase

                .from(
                  "purchase_requests"
                )

                .update({

                  committee_required:
                    true,

                  workflow_status:
                    "Pendiente comité",

                })

                .eq(
                  "id",
                  id
                );

              await fetchData();

            }}
            className="
              rounded-2xl
              bg-blue-600
              px-5
              py-3
              text-sm
              font-medium
              text-white
            "
          >

            Sí requiere

          </button>

          <button
            onClick={async () => {

              await supabase

                .from(
                  "purchase_requests"
                )

                .update({

                  committee_required:
                    false,

                  workflow_status:
                    "OC generada",

                })

                .eq(
                  "id",
                  id
                );

              await fetchData();

            }}
            className="
              rounded-2xl
              bg-gray-800
              px-5
              py-3
              text-sm
              font-medium
              text-white
            "
          >

            No requiere

          </button>

        </div>

      </div>

      {/* COMMITTEE DECISION */}

      {
        purchase?.workflow_status ===
        "Pendiente comité"

        &&

        (

          <div className="
            rounded-2xl
            border
            border-gray-200
            p-5
          ">

            <textarea
              defaultValue={
                purchase.committee_comment || ""
              }
              onBlur={async (e) => {

                await supabase

                  .from(
                    "purchase_requests"
                  )

                  .update({
                    committee_comment:
                      e.target.value,
                  })

                  .eq(
                    "id",
                    id
                  );

              }}
              rows={4}
              placeholder="Comentarios comité"
              className="
                w-full
                rounded-2xl
                border
                border-gray-200
                p-4
                text-sm
              "
            />

            <div className="
              mt-5
              flex
              flex-wrap
              gap-3
            ">

              <button
                onClick={async () => {

                  await supabase

                    .from(
                      "purchase_requests"
                    )

                    .update({

                      committee_status:
                        "Aprobado",

                      workflow_status:
                        "OC generada",

                      committee_date:
                        new Date(),

                    })

                    .eq(
                      "id",
                      id
                    );

                  await fetchData();

                }}
                className="
                  rounded-2xl
                  bg-green-600
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                "
              >

                Aprobar comité

              </button>

              <button
                onClick={async () => {

                  await supabase

                    .from(
                      "purchase_requests"
                    )

                    .update({

                      committee_status:
                        "Rechazado",

                      workflow_status:
                        "Comité rechazado",

                      committee_date:
                        new Date(),

                    })

                    .eq(
                      "id",
                      id
                    );

                  await fetchData();

                }}
                className="
                  rounded-2xl
                  bg-red-600
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-white
                "
              >

                Rechazar comité

              </button>

            </div>

          </div>

        )
      }

    </div>

  )
}
{/* PURCHASE ORDER */}

{
  purchase?.workflow_status ===
  "OC generada"

  &&

  (

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

          <h2 className="
            text-2xl
            font-bold
          ">

            Orden de compra

          </h2>

          <p className="
            mt-1
            text-sm
            text-gray-500
          ">

            Lista para generación

          </p>

        </div>

        <button
          onClick={
            generatePurchaseOrder
          }
          className="
            rounded-2xl
            bg-black
            px-6
            py-3
            text-sm
            font-medium
            text-white
          "
        >

          Generar OC

        </button>

      </div>

    </div>

  )
}

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

      {/* MOBILE VIEW */}

      <div className="
        space-y-6
        lg:hidden
      ">

        {
          purchase?.purchase_request_items?.map(
            (requestItem: any) => (

              <div
                key={requestItem.id}
                className="
                  rounded-3xl
                  bg-white
                  p-5
                  shadow-sm
                "
              >

                <h2 className="
                  text-lg
                  font-bold
                ">

                  {
                    requestItem.description
                  }

                </h2>

                <div className="
                  mt-2
                  inline-flex
                  rounded-full
                  bg-gray-100
                  px-3
                  py-1
                  text-xs
                  text-gray-600
                ">

                  Solicitud:
                  {" "}
                  {
                    requestItem.quantity
                  }

                  {" "}

                  {
                    requestItem.um || "UND"
                  }

                </div>

              </div>

            )
          )
        }

      </div>

      {/* DESKTOP */}

      <div
        className="
          hidden
          overflow-auto
          rounded-3xl
          bg-white
          shadow-sm
          lg:block
        "
      >

        <table className="
          min-w-full
          border-collapse
        ">

          <thead className="
            sticky
            top-0
            z-30
            bg-gray-50
          ">

            <tr>

              <th className="
                sticky
                left-0
                top-0
                z-40
                min-w-[240px]
                border-b
                border-r
                bg-gray-50
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
                          defaultValue={
                            quote.delivery_time
                          }
                          onBlur={(e) =>
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
                          defaultValue={
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

                    {/* ITEM */}

                    <td className="
                      sticky
                      left-0
                      z-20
                      border-r
                      bg-white
                      p-5
                      align-top
                    ">

                      <div>

                        <p className="
                          text-sm
                          font-semibold
                          text-gray-900
                        ">

                          {
                            requestItem.description
                          }

                        </p>

                        <div className="
                          mt-3
                          inline-flex
                          rounded-full
                          bg-gray-100
                          px-3
                          py-1
                          text-xs
                          text-gray-600
                        ">

                          Cantidad:
                          {" "}
                          {
                            requestItem.quantity
                          }

                          {" "}

                          {
                            requestItem.um || "UND"
                          }

                        </div>

                      </div>

                    </td>

                    {/* QUOTES */}

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

                          const allQuoteItems =

                            quotes

                              .flatMap(
                                (q) =>
                                  q.purchase_quote_items
                              )

                              .filter(
                                (item: any) =>
                                  item.request_item_id ===
                                  requestItem.id
                              );

                          const suggestedPrice =

                            Math.min(
                              ...allQuoteItems

                                .map(
                                  (item: any) =>
                                    Number(
                                      item.equivalent_unit_price || 0
                                    )
                                )

                                .filter(
                                  (value) =>
                                    value > 0
                                )
                            );

                          const isSuggested =

                            Number(
                              quoteItem.equivalent_unit_price || 0
                            )

                            ===

                            suggestedPrice

                            &&

                            suggestedPrice > 0;

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

                                {/* SUPPLIER QUANTITY */}

                                <div>

                                  <label className="
                                    mb-1
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                  ">

                                    Cantidad proveedor

                                  </label>

                                  <input
                                    type="number"
                                    defaultValue={
                                      quoteItem.supplier_quantity || ""
                                    }
                                    onBlur={(e) =>
                                      updateQuoteItem(
                                        quoteItem.id,
                                        "supplier_quantity",
                                        Number(
                                          e.target.value
                                        )
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
                                  />

                                </div>

                                {/* UM */}

                                <div>

                                  <label className="
                                    mb-1
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                  ">

                                    UM proveedor

                                  </label>

                                  <div className="
                                    flex
                                    gap-2
                                  ">

                                    <select
                                      defaultValue={
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
                                        text-sm
                                      "
                                    >

                                      <option value="">
                                        Seleccionar UM
                                      </option>

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

                                    <button
                                      type="button"
                                      onClick={async () => {

                                        const code =
                                          prompt(
                                            "Nueva unidad"
                                          );

                                        if (!code) return;

                                        const upperCode =
                                          code.toUpperCase();

                                        await supabase

                                          .from(
                                            "units_of_measure"
                                          )

                                          .insert([
                                            {
                                              code:
                                                upperCode,

                                              description:
                                                upperCode,
                                            },
                                          ]);

                                        fetchData();

                                      }}
                                      className="
                                        rounded-xl
                                        bg-black
                                        px-4
                                        text-white
                                      "
                                    >

                                      +

                                    </button>

                                  </div>

                                </div>

                                {/* FACTOR */}

                                <div>

                                  <label className="
                                    mb-1
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                  ">

                                    Factor conversión

                                  </label>

                                  <input
                                    type="number"
                                    defaultValue={
                                      quoteItem.conversion_factor || ""
                                    }
                                    onBlur={(e) =>
                                      updateQuoteItem(
                                        quoteItem.id,
                                        "conversion_factor",
                                        Number(
                                          e.target.value
                                        )
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
                                  />

                                </div>

                                {/* EQUIVALENT */}

                                <div className="
                                  rounded-2xl
                                  bg-blue-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-blue-400
                                  ">

                                    Cantidad equivalente

                                  </p>

                                  <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-blue-700
                                  ">

                                    {
                                      Number(
                                        quoteItem.supplier_quantity || 0
                                      )

                                      *

                                      Number(
                                        quoteItem.conversion_factor || 0
                                      )
                                    }

                                  </p>

                                </div>

                                {/* UNIT PRICE */}

                                <div>

                                  <label className="
                                    mb-1
                                    block
                                    text-xs
                                    font-medium
                                    text-gray-500
                                  ">

                                    Valor unitario

                                  </label>

                                  <input
                                    type="number"
                                    defaultValue={
                                      quoteItem.unit_price || ""
                                    }
                                    onBlur={(e) =>
                                      updateQuoteItem(
                                        quoteItem.id,
                                        "unit_price",
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
                                      text-sm
                                    "
                                  />

                                </div>

                                {/* TOTAL */}

                                <div className="
                                  rounded-2xl
                                  bg-gray-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-gray-400
                                  ">

                                    Valor total

                                  </p>

                                  <p className="
                                    mt-2
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                  ">

                                    ${" "}

                                    {
                                      Number(
                                        quoteItem.total || 0
                                      )

                                      .toLocaleString(
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
                                  defaultValue={
                                    quoteItem.observations
                                  }
                                  onBlur={(e) =>
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
                                    text-sm
                                  "
                                  placeholder="Observaciones"
                                />

                                {/* EQUIVALENT PRICE */}

                                <div className="
                                  rounded-2xl
                                  bg-yellow-50
                                  p-4
                                ">

                                  <p className="
                                    text-xs
                                    uppercase
                                    tracking-wider
                                    text-yellow-500
                                  ">

                                    Precio equivalente

                                  </p>

                                  <p className="
                                    mt-2
                                    text-xl
                                    font-bold
                                    text-yellow-700
                                  ">

                                    ${" "}

                                    {
                                      Number(
                                        quoteItem.equivalent_unit_price || 0
                                      )

                                      .toLocaleString(
                                        "es-CO",
                                        {
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      )
                                    }

                                  </p>

                                </div>

                                {/* SUGGESTED */}

                                {
                                  isSuggested && (

                                    <div className="
                                      rounded-xl
                                      border
                                      border-blue-200
                                      bg-blue-50
                                      px-3
                                      py-2
                                      text-sm
                                      font-medium
                                      text-blue-700
                                    ">

                                      ⭐ Mejor oferta sugerida

                                    </div>

                                  )
                                }

                                {/* WINNER */}

                                {
                                  quoteItem.selected && (

                                    <div className="
                                      rounded-xl
                                      border
                                      border-green-200
                                      bg-green-50
                                      px-3
                                      py-2
                                      text-sm
                                      font-medium
                                      text-green-700
                                    ">

                                      ✓ Oferta adjudicada

                                    </div>

                                  )
                                }

                                {/* BUTTON */}

                                <button
                                  onClick={() =>
                                    selectWinner(
                                      quoteItem.id
                                    )
                                  }
                                  className={`
                                    h-11
                                    w-full
                                    rounded-xl
                                    text-sm
                                    font-medium
                                    text-white

                                    ${
                                      quoteItem.selected

                                        ? "bg-green-600"

                                        : "bg-black"
                                    }
                                  `}
                                >

                                  {
                                    quoteItem.selected

                                      ? "Proveedor adjudicado"

                                      : "Adjudicar proveedor"
                                  }

                                </button>

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
