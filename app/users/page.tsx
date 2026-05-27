"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/component/layout/app-layout";

import { supabase } from "@/lib/supabase";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  User,
} from "lucide-react";

export default function UsersPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [users, setUsers] =
    useState<any[]>([]);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [role, setRole] =
    useState("Analista");

  const [editingUser, setEditingUser] =
    useState<any>(null);

  const [editFullName, setEditFullName] =
    useState("");

  const [editRole, setEditRole] =
    useState("");

  const [editStatus, setEditStatus] =
    useState("");

  // =====================================================
  // GET USERS
  // =====================================================

  const getUsers = async () => {

    const { data } = await supabase
      .from("users")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setUsers(data);
    }
  };

  // =====================================================
  // CREATE USER
  // =====================================================

  const createUser = async () => {

    if (!fullName || !email) {
      alert("Complete la información");
      return;
    }

    const { error } = await supabase
      .from("users")
      .insert([
        {
          full_name: fullName,
          email,
          role,
          status: "Activo",
        },
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setFullName("");
    setEmail("");
    setRole("Analista");

    getUsers();
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const deleteUser = async (
    id: string
  ) => {

    await supabase
      .from("users")
      .delete()
      .eq("id", id);

    getUsers();
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (
    user: any
  ) => {

    setEditingUser(user);

    setEditFullName(
      user.full_name
    );

    setEditRole(
      user.role
    );

    setEditStatus(
      user.status
    );
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {

    setEditingUser(null);

    setEditFullName("");

    setEditRole("");

    setEditStatus("");
  };

  // =====================================================
  // UPDATE USER
  // =====================================================

  const updateUser = async () => {

    if (!editingUser) return;

    await supabase
      .from("users")
      .update({
        full_name:
          editFullName,
        role:
          editRole,
        status:
          editStatus,
      })
      .eq(
        "id",
        editingUser.id
      );

    cancelEdit();

    getUsers();
  };

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {
    getUsers();
  }, []);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <AppLayout>

      <div className="
        mx-auto
        max-w-7xl
      ">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="
          mb-6
          flex
          items-center
          justify-between
        ">

          <div>

            <h1 className="
              text-2xl
              font-semibold
              tracking-tight
              text-gray-900
            ">
              Usuarios
            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              Gestión de usuarios y permisos
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* CREATE USER */}
        {/* ================================================= */}

        <div className="
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
        ">

          <div className="
            flex
            items-center
            gap-2
          ">

            {/* NAME */}

            <Input
              placeholder="Nombre completo"
              value={fullName}
              onChange={(e) =>
                setFullName(
                  e.target.value
                )
              }
              className="
                h-9
                border-gray-200
                text-sm
                shadow-none
              "
            />

            {/* EMAIL */}

            <Input
              placeholder="Correo"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              className="
                h-9
                border-gray-200
                text-sm
                shadow-none
              "
            />

            {/* ROLE */}

            <select
              value={role}
              onChange={(e) =>
                setRole(
                  e.target.value
                )
              }
              className="
                h-9
                rounded-md
                border
                border-gray-200
                px-3
                text-sm
                outline-none
              "
            >

              <option>
                Administrador
              </option>

              <option>
                Líder
              </option>

              <option>
                Analista
              </option>

              <option>
                Consulta
              </option>

            </select>

            {/* BUTTON */}

            <Button
              onClick={createUser}
              className="
                h-9
                w-9
                p-0
              "
            >

              <Plus size={14} />

            </Button>

          </div>

        </div>

        {/* ================================================= */}
        {/* TABLE */}
        {/* ================================================= */}

        <div className="
          mt-4
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
        ">

          <table className="
            w-full
          ">

            {/* HEAD */}

            <thead className="
              bg-gray-50
            ">

              <tr>

                <th className="
                  px-4
                  py-3
                  text-left
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">
                  Usuario
                </th>

                <th className="
                  px-4
                  py-3
                  text-left
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">
                  Correo
                </th>

                <th className="
                  px-4
                  py-3
                  text-left
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">
                  Rol
                </th>

                <th className="
                  px-4
                  py-3
                  text-left
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">
                  Estado
                </th>

                <th className="
                  px-4
                  py-3
                  text-center
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-gray-500
                ">
                  Acciones
                </th>

              </tr>

            </thead>

            {/* BODY */}

            <tbody>

              {users.map((user) => (

                <tr
                  key={user.id}
                  className="
                    border-t
                    border-gray-100
                    hover:bg-gray-50
                  "
                >

                  {/* USER */}

                  <td className="
                    px-4
                    py-3
                  ">

                    {editingUser?.id === user.id ? (

                      <Input
                        value={editFullName}
                        onChange={(e) =>
                          setEditFullName(
                            e.target.value
                          )
                        }
                        className="
                          h-7
                          w-[200px]
                          border-gray-200
                          text-xs
                          shadow-none
                        "
                      />

                    ) : (

                      <div className="
                        flex
                        items-center
                        gap-3
                      ">

                        <div className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          bg-gray-100
                        ">

                          <User
                            size={14}
                            className="
                              text-gray-500
                            "
                          />

                        </div>

                        <p className="
                          text-sm
                          font-medium
                          text-gray-800
                        ">
                          {
                            user.full_name
                          }
                        </p>

                      </div>

                    )}

                  </td>

                  {/* EMAIL */}

                  <td className="
                    px-4
                    py-3
                  ">

                    <p className="
                      text-sm
                      text-gray-600
                    ">
                      {user.email}
                    </p>

                  </td>

                  {/* ROLE */}

                  <td className="
                    px-4
                    py-3
                  ">

                    {editingUser?.id === user.id ? (

                      <select
                        value={editRole}
                        onChange={(e) =>
                          setEditRole(
                            e.target.value
                          )
                        }
                        className="
                          h-7
                          rounded-md
                          border
                          border-gray-200
                          px-2
                          text-xs
                          outline-none
                        "
                      >

                        <option>
                          Administrador
                        </option>

                        <option>
                          Líder
                        </option>

                        <option>
                          Analista
                        </option>

                        <option>
                          Consulta
                        </option>

                      </select>

                    ) : (

                      <span className="
                        rounded-md
                        bg-blue-50
                        px-2
                        py-1
                        text-[11px]
                        font-medium
                        text-blue-700
                      ">
                        {user.role}
                      </span>

                    )}

                  </td>

                  {/* STATUS */}

                  <td className="
                    px-4
                    py-3
                  ">

                    {editingUser?.id === user.id ? (

                      <select
                        value={editStatus}
                        onChange={(e) =>
                          setEditStatus(
                            e.target.value
                          )
                        }
                        className="
                          h-7
                          rounded-md
                          border
                          border-gray-200
                          px-2
                          text-xs
                          outline-none
                        "
                      >

                        <option>
                          Activo
                        </option>

                        <option>
                          Inactivo
                        </option>

                      </select>

                    ) : (

                      <span
                        className={`
                          rounded-md
                          px-2
                          py-1
                          text-[11px]
                          font-medium

                          ${
                            user.status ===
                            "Activo"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }
                        `}
                      >
                        {user.status}
                      </span>

                    )}

                  </td>

                  {/* ACTIONS */}

                  <td className="
                    px-4
                    py-3
                  ">

                    {editingUser?.id === user.id ? (

                      <div className="
                        flex
                        items-center
                        justify-center
                        gap-1
                      ">

                        <Button
                          size="icon"
                          className="
                            h-7
                            w-7
                            p-0
                          "
                          onClick={
                            updateUser
                          }
                        >

                          <Check
                            size={12}
                          />

                        </Button>

                        <Button
                          size="icon"
                          variant="outline"
                          className="
                            h-7
                            w-7
                            p-0
                          "
                          onClick={
                            cancelEdit
                          }
                        >

                          <X
                            size={12}
                          />

                        </Button>

                      </div>

                    ) : (

                      <div className="
                        flex
                        items-center
                        justify-center
                        gap-1
                      ">

                        {/* EDIT */}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                            h-7
                            w-7
                            p-0
                          "
                          onClick={() =>
                            openEdit(
                              user
                            )
                          }
                        >

                          <Pencil
                            size={12}
                          />

                        </Button>

                        {/* DELETE */}

                        <Button
                          size="icon"
                          variant="ghost"
                          className="
                            h-7
                            w-7
                            p-0
                          "
                          onClick={() =>
                            deleteUser(
                              user.id
                            )
                          }
                        >

                          <Trash2
                            size={12}
                          />

                        </Button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </AppLayout>
  );
}