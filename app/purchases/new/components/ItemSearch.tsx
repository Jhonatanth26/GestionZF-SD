"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Item = {
  id: string;
  item_code: string;
  description: string;
  unit_measure: string;
};

type Props = {
  onSelect: (item: Item) => void;
};

export default function ItemSearch({
  onSelect,
}: Props) {

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<Item[]>([]);

  useEffect(() => {

    searchItems();

  }, [query]);

  async function searchItems() {

    if (!query.trim()) {

      setResults([]);

      return;
    }

    const { data, error } =
      await supabase
        .from("items")
        .select(
          "id,item_code,description,unit_measure"
        )
        .eq(
          "status",
          "Activo"
        )
        .or(
          `item_code.ilike.%${query}%,description.ilike.%${query}%`
        )
        .limit(10);

    if (error) {

      console.error(error);

      return;
    }

    setResults(data || []);
  }

  return (

    <div className="relative">

      <input
        value={query}
        onChange={(e) =>
          setQuery(
            e.target.value
          )
        }
        placeholder="Buscar referencia o descripción..."
        className="
          w-full
          rounded-xl
          border
          border-slate-200
          p-3
        "
      />

      {
        results.length > 0 && (

          <div
            className="
              absolute
              z-50
              mt-2
              w-full
              rounded-xl
              border
              border-slate-200
              bg-white
              shadow-lg
            "
          >

            {
              results.map(
                (item) => (

                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {

                      onSelect(item);

                      setQuery(
                        `${item.item_code} - ${item.description}`
                      );

                      setResults([]);

                    }}
                    className="
                      block
                      w-full
                      border-b
                      px-4
                      py-3
                      text-left
                      hover:bg-slate-100
                    "
                  >

                    <div className="font-medium">

                      {item.item_code}

                    </div>

                    <div className="text-sm text-slate-500">

                      {item.description}

                    </div>

                  </button>

                )
              )
            }

          </div>

        )
      }

    </div>

  );

}