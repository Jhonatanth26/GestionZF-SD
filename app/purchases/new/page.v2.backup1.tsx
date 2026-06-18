"use client";
import ItemSearch from "./components/ItemSearch";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
export default function NewRequestPageV2() {

  const router = useRouter();

const [saving, setSaving] = useState(false);

const [catalogItems, setCatalogItems] = useState<any[]>([]);

const [requestType, setRequestType] =
  useState("Compra");

const [chargedTo, setChargedTo] =
  useState("Zofranca");

const [objective, setObjective] =
  useState("");

const [justification, setJustification] =
  useState("");

const [feeDate, setFeeDate] =
  useState("");

const [includePrices, setIncludePrices] =
  useState(false);

const [iva, setIva] =
  useState(19);

const [items, setItems] = useState([
  {
    item_id: "",
    code: "",
    description: "",
    quantity: 1,
    um: "",
    costCenter: "",
  },
]);
useEffect(() => {
  loadCatalogItems();
}, []);

async function loadCatalogItems() {

  const { data, error } =
    await supabase
      .from("items")
      .select("*")
      .eq("status", "Activo")
      .order("description");

  if (error) {
    console.error(error);
    return;
  }

  setCatalogItems(data || []);
}
function addItem() {

  setItems([
    ...items,
    {
      item_id: "",
      code: "",
      description: "",
      quantity: 1,
      um: "",
      costCenter: "",
    },
  ]);
}
function removeItem(index: number) {

  if (items.length === 1)
    return;

  setItems(
    items.filter(
      (_, i) => i !== index
    )
  );
}
function updateItem(
  index: number,
  field: string,
  value: any
) {

  const updated = [...items];

  updated[index] = {
    ...updated[index],
    [field]: value,
  };

  setItems(updated);
}
function handleItemSelected(
  index: number,
  selected: any
) {

  const updated = [...items];

  updated[index] = {

    ...updated[index],

    item_id:
      selected.id,

    code:
      selected.item_code,

    description:
      selected.description,

    um:
      selected.unit_measure,

  };

  setItems(updated);

}
function selectItem(
  index: number,
  itemId: string
) {

  const selected =
    catalogItems.find(
      (x) =>
        x.id === itemId
    );

  if (!selected)
    return;

  const updated = [...items];

  updated[index] = {
    ...updated[index],

    item_id:
      selected.id,

    code:
      selected.item_code,

    description:
      selected.description,

    um:
      selected.unit_measure,
  };

  setItems(updated);
}
;
async function saveRequest() {

  if (!objective.trim()) {
    alert("Debe ingresar el objetivo");
    return;
  }

  if (!justification.trim()) {
    alert("Debe ingresar la justificación");
    return;
  }

  const validItems = items.filter(
    (item) => item.item_id !== ""
  );

  if (validItems.length === 0) {
    alert("Debe seleccionar al menos un artículo");
    return;
  }

  try {

    setSaving(true);

    const requestNumber =
      `TMP-${Date.now()}`;

    const {
      data: request,
      error
    } = await supabase
      .from("purchase_requests")
      .insert({

        request_number:
          requestNumber,

        title:
          objective.substring(
            0,
            100
          ),

        description:
          objective,

        justification,

        request_type:
          requestType,

        charged_to:
          chargedTo,

        vat_percentage:
          iva,

        include_prices:
          includePrices,

        fee_date:
          feeDate || null,

        general_status:
          "Pendiente",

        workflow_status:
          "Pendiente",

        workflow_step:
          "Jefe área",

      })
      .select()
      .single();

    if (error) {

      console.error(error);

      alert(
        error.message
      );

      return;
    }

    const requestId =
      request.id;

    const itemsToInsert =
      validItems.map(
        (item) => ({

          request_id:
            requestId,

          item_id:
            item.item_id,

          item_code:
            item.code,

          description:
            item.description,

          quantity:
            item.quantity,

          unit_measure:
            item.um,

          approval_status:
            "Pendiente"

        })
      );

    const {
      error:
        itemsError
    } = await supabase
      .from(
        "purchase_request_items"
      )
      .insert(
        itemsToInsert
      );

    if (itemsError) {

      console.error(
        itemsError
      );

      alert(
        itemsError.message
      );

      return;
    }

    alert(
      "Solicitud creada correctamente"
    );

    router.push(
      "/purchases"
    );

  }
  catch (error: any) {

    console.error(error);

    alert(
      error.message
    );

  }
  finally {

    setSaving(false);

  }

}

{/* ITEMS */}

<div className="mb-6 rounded-3xl bg-white p-6 shadow-sm">

  <div className="mb-5 flex items-center justify-between">

    <h2 className="text-lg font-semibold">
      Items
    </h2>

    <button
      type="button"
      onClick={addItem}
      className="
        rounded-xl
        bg-black
        px-4
        py-2
        text-sm
        text-white
      "
    >
      + Agregar item
    </button>

  </div>

</div>
}