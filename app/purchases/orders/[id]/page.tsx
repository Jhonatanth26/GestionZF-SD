
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PurchaseOrderPage() {

  const params = useParams();

  const id = params.id as string;

  const [order, setOrder] =
    useState<any>(null);

  const [company, setCompany] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    if (id) {

      fetchData();

    }

  }, [id]);

  async function fetchData() {

    try {

      setLoading(true);

      // COMPANY

      const { data: companyData } =
        await supabase

          .from(
            "company_settings"
          )

          .select("*")

          .single();

      setCompany(companyData);

      // ORDER

      const { data: orderData } =
        await supabase

          .from(
            "purchase_orders"
          )

          .select(`
            *,
            suppliers (
              supplier_name,
              nit
            ),
            purchase_order_items (*)
          `)

          .eq("id", id)

          .single();

      setOrder(orderData);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <div className="p-10">

        Cargando...

      </div>

    );

  }

  if (!order) {

    return (

      <div className="p-10">

        OC no encontrada

      </div>

    );

  }

  return (

    <div className="
      min-h-screen
      bg-[#f5f6f8]
      p-6
    ">

      {/* ACTIONS */}

      <div className="
        mb-6
        flex
        justify-end
      ">

        <button
          onClick={() =>
            window.print()
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

          Descargar PDF

        </button>

      </div>

      {/* DOCUMENT */}

      <div
        id="purchase-order-pdf"
        className="
          mx-auto
          max-w-6xl
          rounded-3xl
          bg-white
          p-10
          shadow-sm
        "
      >

        {/* HEADER */}

        <div className="
          flex
          flex-col
          gap-6
          border-b
          border-gray-200
          pb-8
          lg:flex-row
          lg:items-center
          lg:justify-between
        ">

          {/* LOGOS */}

          <div className="
            flex
            items-center
            gap-6
          ">

            <img
              src={
                company?.logo_url
              }
              alt="Logo"
              className="
                h-20
                object-contain
              "
            />

            <img
              src={
                company?.secondary_logo_url
              }
              alt="Logo"
              className="
                h-20
                object-contain
              "
            />

          </div>

          {/* TITLE */}

          <div className="
            text-right
          ">

            <p className="
              text-sm
              uppercase
              tracking-widest
              text-gray-400
            ">

              Orden de compra

            </p>

            <h1 className="
              mt-2
              text-4xl
              font-bold
            ">

              {
                order.oc_number
              }

            </h1>

            <p className="
              mt-2
              text-sm
              text-gray-500
            ">

              {
                new Date(
                  order.oc_date
                )

                .toLocaleDateString(
                  "es-CO"
                )
              }

            </p>

          </div>

        </div>

        {/* COMPANY */}

        <div className="
          mt-8
          grid
          gap-8
          lg:grid-cols-2
        ">

          {/* COMPANY INFO */}

          <div>

            <p className="
              text-xs
              uppercase
              tracking-widest
              text-gray-400
            ">

              Empresa

            </p>

            <h2 className="
              mt-3
              text-2xl
              font-bold
            ">

              {
                company?.company_name
              }

            </h2>

            <div className="
              mt-4
              space-y-2
              text-sm
              text-gray-600
            ">

              <p>
                NIT:
                {" "}
                {
                  company?.nit
                }
              </p>

              <p>
                {
                  company?.address
                }
              </p>

              <p>
                {
                  company?.city
                }
              </p>

              <p>
                {
                  company?.phone
                }
              </p>

              <p>
                {
                  company?.email
                }
              </p>

            </div>

          </div>

          {/* SUPPLIER */}

          <div>

            <p className="
              text-xs
              uppercase
              tracking-widest
              text-gray-400
            ">

              Proveedor

            </p>

            <h2 className="
              mt-3
              text-2xl
              font-bold
            ">

              {
                order.suppliers
                  ?.supplier_name
              }

            </h2>

            <div className="
              mt-4
              space-y-2
              text-sm
              text-gray-600
            ">

              <p>
                NIT:
                {" "}
                {
                  order.suppliers
                    ?.nit
                }
              </p>

              <p>
                Método pago:
                {" "}
                {
                  order.payment_method
                }
              </p>

              <p>
                Entrega:
                {" "}
                {
                  order.delivery_time
                }
              </p>

              <p>
                Estado:
                {" "}
                {
                  order.oc_status
                }
              </p>

            </div>

          </div>

        </div>

        {/* ITEMS */}

        <div className="
          mt-10
          overflow-auto
        ">

          <table className="
            min-w-full
            border-collapse
          ">

            <thead>

              <tr className="
                border-b
                border-gray-200
                bg-gray-50
              ">

                <th className="
                  p-4
                  text-left
                  text-sm
                  font-semibold
                ">

                  Descripción

                </th>

                <th className="
                  p-4
                  text-left
                  text-sm
                  font-semibold
                ">

                  Cantidad

                </th>

                <th className="
                  p-4
                  text-left
                  text-sm
                  font-semibold
                ">

                  UM

                </th>

                <th className="
                  p-4
                  text-right
                  text-sm
                  font-semibold
                ">

                  Valor unitario

                </th>

                <th className="
                  p-4
                  text-right
                  text-sm
                  font-semibold
                ">

                  Total

                </th>

              </tr>

            </thead>

            <tbody>

              {
                order.purchase_order_items
                  ?.map(
                    (item: any) => (

                      <tr
                        key={item.id}
                        className="
                          border-b
                          border-gray-100
                        "
                      >

                        <td className="
                          p-4
                          text-sm
                        ">

                          {
                            item.description
                          }

                        </td>

                        <td className="
                          p-4
                          text-sm
                        ">

                          {
                            item.quantity
                          }

                        </td>

                        <td className="
                          p-4
                          text-sm
                        ">

                          {
                            item.um
                          }

                        </td>

                        <td className="
                          p-4
                          text-right
                          text-sm
                        ">

                          ${" "}

                          {
                            Number(
                              item.unit_price || 0
                            )

                            .toLocaleString(
                              "es-CO"
                            )
                          }

                        </td>

                        <td className="
                          p-4
                          text-right
                          text-sm
                          font-semibold
                        ">

                          ${" "}

                          {
                            Number(
                              item.total || 0
                            )

                            .toLocaleString(
                              "es-CO"
                            )
                          }

                        </td>

                      </tr>

                    )
                  )
              }

            </tbody>

          </table>

        </div>

        {/* TOTAL */}

        <div className="
          mt-10
          flex
          justify-end
        ">

          <div className="
            w-full
            max-w-md
            rounded-3xl
            bg-gray-50
            p-6
          ">

            <div className="
              flex
              items-center
              justify-between
            ">

              <p className="
                text-sm
                text-gray-500
              ">

                Total orden compra

              </p>

              <p className="
                text-3xl
                font-bold
              ">

                ${" "}

                {
                  Number(
                    order.total || 0
                  )

                  .toLocaleString(
                    "es-CO"
                  )
                }

              </p>

            </div>

          </div>

        </div>

        {/* OBS */}

        <div className="
          mt-10
          rounded-3xl
          border
          border-gray-200
          p-6
        ">

          <p className="
            text-xs
            uppercase
            tracking-widest
            text-gray-400
          ">

            Observaciones

          </p>

          <textarea
            defaultValue={
              order.observations || ""
            }
            rows={5}
            className="
              mt-4
              w-full
              rounded-2xl
              border
              border-gray-200
              p-4
            "
          />

        </div>

      </div>

    </div>

  );

}


