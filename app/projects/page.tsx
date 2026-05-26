"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/component/layout/app-layout";
import { supabase } from "@/lib/supabase";

export default function ProjectsPage() {

  const [projects, setProjects] = useState<any[]>([]);

  const [description, setDescription] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  const getProjects = async () => {

    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setProjects(data);
    }
  };

  const createProject = async () => {

    const projectCode =
      "PRJ-" + Math.floor(Math.random() * 100000);

    const user = await supabase.auth.getUser();

    const leader =
      user.data.user?.email || "Sin líder";

    await supabase.from("projects").insert([
      {
        project_code: projectCode,
        description,
        leader,
        estimated_delivery: estimatedDelivery,
      },
    ]);

    setDescription("");
    setEstimatedDelivery("");

    getProjects();
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <AppLayout>

      <div className="flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold">
            Proyectos
          </h1>

          <p className="mt-2 text-gray-500">
            Gestión de proyectos
          </p>

        </div>

      </div>

      {/* Formulario */}

      <div className="mt-8 rounded-2xl bg-white p-6 shadow">

        <h2 className="mb-4 text-xl font-semibold">
          Nuevo proyecto
        </h2>

        <div className="grid gap-4 md:grid-cols-2">

          <input
            type="text"
            placeholder="Descripción proyecto"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
            className="rounded-lg border p-3"
          />

          <input
            type="date"
            value={estimatedDelivery}
            onChange={(e) =>
              setEstimatedDelivery(e.target.value)
            }
            className="rounded-lg border p-3"
          />

        </div>

        <button
          onClick={createProject}
          className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
        >
          Crear proyecto
        </button>

      </div>

      {/* Lista */}

      <div className="mt-8 grid gap-4">

        {projects.map((project) => (

          <div
            key={project.id}
            className="rounded-2xl bg-white p-6 shadow"
          >

            <div className="grid gap-4 md:grid-cols-4">

              <div>
                <p className="text-sm text-gray-500">
                  Código
                </p>

                <p className="font-bold">
                  {project.project_code}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Descripción
                </p>

                <p className="font-bold">
                  {project.description}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Líder
                </p>

                <p className="font-bold">
                  {project.leader}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  % Global
                </p>

                <p className="font-bold">
                  {project.global_progress}%
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Actividades
                </p>

                <p className="font-bold">
                  {project.activities_count}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Fecha Registro
                </p>

                <p className="font-bold">
                  {new Date(
                    project.created_at
                  ).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Fecha Estimada
                </p>

                <p className="font-bold">
                  {project.estimated_delivery}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Fecha Real
                </p>

                <p className="font-bold">
                  {project.real_delivery || "-"}
                </p>
              </div>

            </div>

          </div>

        ))}

      </div>

    </AppLayout>
  );
}