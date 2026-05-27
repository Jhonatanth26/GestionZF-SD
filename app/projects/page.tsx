"use client";

import { useEffect, useState } from "react";

import AppLayout from "@/component/layout/app-layout";

import { supabase } from "@/lib/supabase";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";

export default function ProjectsPage() {

  // =====================================================
  // STATES
  // =====================================================

  const [projects, setProjects] =
    useState<any[]>([]);

  const [activities, setActivities] =
    useState<any[]>([]);

  const [selectedProject, setSelectedProject] =
    useState<any>(null);

  // CREATE PROJECT

  const [description, setDescription] =
    useState("");

  const [estimatedDelivery, setEstimatedDelivery] =
    useState("");

  // CREATE ACTIVITY

  const [activityName, setActivityName] =
    useState("");

  const [responsible, setResponsible] =
    useState("");

  const [progress, setProgress] =
    useState(0);

  // EDIT

  const [editingActivity, setEditingActivity] =
    useState<any>(null);

  const [editResponsible, setEditResponsible] =
    useState("");

  const [editProgress, setEditProgress] =
    useState(0);

  // =====================================================
  // GET PROJECTS
  // =====================================================

  const getProjects = async () => {

    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setProjects(data);
    }
  };

  // =====================================================
  // GET ACTIVITIES
  // =====================================================

  const getActivities = async (
    projectId: string
  ) => {

    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", {
        ascending: false,
      });

    if (data) {
      setActivities(data);
    }
  };

  // =====================================================
  // RECALCULATE PROJECT
  // =====================================================

  const recalculateProject = async (
    projectId: string
  ) => {

    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("project_id", projectId);

    const totalActivities =
      data?.length || 0;

    const totalProgress =
      data?.reduce(
        (acc, item) =>
          acc + Number(item.progress),
        0
      ) || 0;

    const averageProgress =
      totalActivities > 0
        ? Math.round(
            totalProgress /
              totalActivities
          )
        : 0;

    await supabase
      .from("projects")
      .update({
        activities_count:
          totalActivities,
        global_progress:
          averageProgress,
      })
      .eq("id", projectId);

    getProjects();
  };

  // =====================================================
  // CREATE PROJECT
  // =====================================================

  const createProject = async () => {

    if (!description) {
      alert("Ingrese descripción");
      return;
    }

    const projectCode =
      "PRJ-" +
      Math.floor(Math.random() * 10000);

    const user =
      await supabase.auth.getUser();

    await supabase
      .from("projects")
      .insert([
        {
          project_code:
            projectCode,
          description,
          estimated_delivery:
            estimatedDelivery,
          leader:
            user.data.user?.email,
        },
      ]);

    setDescription("");
    setEstimatedDelivery("");

    getProjects();
  };

  // =====================================================
  // CREATE ACTIVITY
  // =====================================================

  const createActivity = async () => {

    if (!selectedProject) return;

    if (!activityName) {
      alert("Ingrese actividad");
      return;
    }

    let status = "Pendiente";

    if (
      progress > 0 &&
      progress < 100
    ) {
      status = "En proceso";
    }

    if (progress >= 100) {
      status = "Completada";
    }

    await supabase
      .from("activities")
      .insert([
        {
          project_id:
            selectedProject.id,
          activity_name:
            activityName,
          responsible,
          progress,
          status,
        },
      ]);

    setActivityName("");
    setResponsible("");
    setProgress(0);

    getActivities(
      selectedProject.id
    );

    recalculateProject(
      selectedProject.id
    );
  };

  // =====================================================
  // DELETE ACTIVITY
  // =====================================================

  const deleteActivity = async (
    id: string
  ) => {

    await supabase
      .from("activities")
      .delete()
      .eq("id", id);

    getActivities(
      selectedProject.id
    );

    recalculateProject(
      selectedProject.id
    );
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEdit = (
    activity: any
  ) => {

    setEditingActivity(activity);

    setEditResponsible(
      activity.responsible
    );

    setEditProgress(
      activity.progress
    );
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const cancelEdit = () => {

    setEditingActivity(null);

    setEditResponsible("");

    setEditProgress(0);
  };

  // =====================================================
  // UPDATE ACTIVITY
  // =====================================================

  const updateActivity = async () => {

    if (!editingActivity) return;

    let status = "Pendiente";

    if (
      editProgress > 0 &&
      editProgress < 100
    ) {
      status = "En proceso";
    }

    if (editProgress >= 100) {
      status = "Completada";
    }

    await supabase
      .from("activities")
      .update({
        responsible:
          editResponsible,
        progress:
          editProgress,
        status,
      })
      .eq(
        "id",
        editingActivity.id
      );

    cancelEdit();

    getActivities(
      selectedProject.id
    );

    recalculateProject(
      selectedProject.id
    );
  };

  // =====================================================
  // INIT
  // =====================================================

  useEffect(() => {
    getProjects();
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
              Proyectos
            </h1>

            <p className="
              mt-1
              text-sm
              text-gray-500
            ">
              Gestión ejecutiva de proyectos
            </p>

          </div>

        </div>

        {/* ================================================= */}
        {/* CREATE PROJECT */}
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

            <Input
              placeholder="Descripción proyecto"
              value={description}
              onChange={(e) =>
                setDescription(
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

            <Input
              type="date"
              value={estimatedDelivery}
              onChange={(e) =>
                setEstimatedDelivery(
                  e.target.value
                )
              }
              className="
                h-9
                w-[180px]
                border-gray-200
                text-sm
                shadow-none
              "
            />

            <Button
              onClick={createProject}
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
        {/* PROJECTS */}
        {/* ================================================= */}

        <div className="
          mt-4
          space-y-3
        ">

          {projects.map((project) => (

            <div
              key={project.id}
              className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
              "
            >

              {/* PROJECT HEADER */}

              <div className="
                flex
                items-center
                justify-between
                border-b
                border-gray-100
                px-5
                py-4
              ">

                {/* LEFT */}

                <div>

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <p className="
                      text-base
                      font-semibold
                      text-gray-900
                    ">
                      {project.project_code}
                    </p>

                    <span className="
                      rounded-md
                      bg-gray-100
                      px-2
                      py-1
                      text-[11px]
                      font-medium
                      text-gray-600
                    ">
                      {
                        project.activities_count || 0
                      } actividades
                    </span>

                  </div>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                  ">
                    {project.description}
                  </p>

                </div>

                {/* RIGHT */}

                <div className="
                  flex
                  items-center
                  gap-5
                ">

                  {/* PROGRESS */}

                  <div className="
                    w-[180px]
                  ">

                    <div className="
                      mb-1
                      flex
                      items-center
                      justify-between
                    ">

                      <span className="
                        text-[11px]
                        text-gray-400
                      ">
                        Progreso
                      </span>

                      <span className="
                        text-[11px]
                        font-semibold
                        text-gray-700
                      ">
                        {
                          project.global_progress || 0
                        }%
                      </span>

                    </div>

                    <div className="
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-gray-200
                    ">

                      <div
                        className="
                          h-1.5
                          rounded-full
                          bg-blue-600
                        "
                        style={{
                          width:
                            `${project.global_progress || 0}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* BUTTON */}

                  <Button
                    variant="outline"
                    className="
                      h-8
                      text-xs
                    "
                    onClick={() => {

                      if (
                        selectedProject?.id ===
                        project.id
                      ) {

                        setSelectedProject(null);

                        return;
                      }

                      setSelectedProject(
                        project
                      );

                      getActivities(
                        project.id
                      );
                    }}
                  >
                    {
                      selectedProject?.id ===
                      project.id
                        ? "Ocultar"
                        : "Actividades"
                    }
                  </Button>

                </div>

              </div>

              {/* ================================================= */}
              {/* ACTIVITIES SECTION */}
              {/* ================================================= */}

              {selectedProject?.id ===
                project.id && (

                <div className="
                  p-5
                ">

                  {/* CREATE ACTIVITY */}

                  <div className="
                    mb-4
                    rounded-lg
                    border
                    border-gray-200
                    bg-gray-50
                    p-3
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      <Input
                        placeholder="Actividad"
                        value={activityName}
                        onChange={(e) =>
                          setActivityName(
                            e.target.value
                          )
                        }
                        className="
                          h-8
                          flex-1
                          border-gray-200
                          text-sm
                          shadow-none
                        "
                      />

                      <Input
                        placeholder="Responsable"
                        value={responsible}
                        onChange={(e) =>
                          setResponsible(
                            e.target.value
                          )
                        }
                        className="
                          h-8
                          w-[220px]
                          border-gray-200
                          text-sm
                          shadow-none
                        "
                      />

                      <Input
                        type="number"
                        value={progress}
                        onChange={(e) =>
                          setProgress(
                            Number(
                              e.target.value
                            )
                          )
                        }
                        className="
                          h-8
                          w-[80px]
                          border-gray-200
                          text-sm
                          shadow-none
                        "
                      />

                      <Button
                        onClick={
                          createActivity
                        }
                        className="
                          h-8
                          w-8
                          p-0
                        "
                      >

                        <Plus size={14} />

                      </Button>

                    </div>

                  </div>

                  {/* TABLE */}

                  <div className="
                    overflow-hidden
                    rounded-lg
                    border
                    border-gray-200
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
                            Actividad
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
                            text-left
                            text-[11px]
                            font-semibold
                            uppercase
                            tracking-wide
                            text-gray-500
                          ">
                            Progreso
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
                            Responsable
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

                        {activities.map((activity) => (

                          <tr
                            key={activity.id}
                            className="
                              border-t
                              border-gray-100
                              hover:bg-gray-50
                            "
                          >

                            {/* ACTIVITY */}

                            <td className="
                              px-4
                              py-3
                            ">

                              <p className="
                                text-sm
                                font-medium
                                text-gray-800
                              ">
                                {
                                  activity.activity_name
                                }
                              </p>

                            </td>

                            {/* STATUS */}

                            <td className="
                              px-4
                              py-3
                            ">

                              <span
                                className={`
                                  rounded-md
                                  px-2
                                  py-1
                                  text-[11px]
                                  font-medium
                                  text-white

                                  ${
                                    activity.status ===
                                    "Pendiente"
                                      ? "bg-red-500"
                                      : activity.status ===
                                        "En proceso"
                                      ? "bg-yellow-500"
                                      : "bg-green-500"
                                  }
                                `}
                              >
                                {
                                  activity.status
                                }
                              </span>

                            </td>

                            {/* PROGRESS */}

                            <td className="
                              px-4
                              py-3
                              w-[220px]
                            ">

                              <div className="
                                flex
                                items-center
                                gap-2
                              ">

                                <div className="
                                  h-1.5
                                  flex-1
                                  overflow-hidden
                                  rounded-full
                                  bg-gray-200
                                ">

                                  <div
                                    className={`
                                      h-1.5
                                      rounded-full

                                      ${
                                        activity.progress <= 30
                                          ? "bg-red-500"
                                          : activity.progress <= 70
                                          ? "bg-yellow-500"
                                          : activity.progress < 100
                                          ? "bg-blue-500"
                                          : "bg-green-500"
                                      }
                                    `}
                                    style={{
                                      width:
                                        `${activity.progress}%`,
                                    }}
                                  />

                                </div>

                                <span className="
                                  min-w-[34px]
                                  text-[11px]
                                  font-semibold
                                  text-gray-700
                                ">
                                  {
                                    activity.progress
                                  }%
                                </span>

                              </div>

                            </td>

                            {/* RESPONSIBLE */}

                            <td className="
                              px-4
                              py-3
                            ">

                              {editingActivity?.id ===
                              activity.id ? (

                                <Input
                                  value={
                                    editResponsible
                                  }
                                  onChange={(e) =>
                                    setEditResponsible(
                                      e.target.value
                                    )
                                  }
                                  className="
                                    h-7
                                    w-[150px]
                                    border-gray-200
                                    text-xs
                                    shadow-none
                                  "
                                />

                              ) : (

                                <p className="
                                  text-sm
                                  text-gray-700
                                ">
                                  {
                                    activity.responsible
                                  }
                                </p>

                              )}

                            </td>

                            {/* ACTIONS */}

                            <td className="
                              px-4
                              py-3
                            ">

                              {editingActivity?.id ===
                              activity.id ? (

                                <div className="
                                  flex
                                  items-center
                                  justify-center
                                  gap-1
                                ">

                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={
                                      editProgress
                                    }
                                    onChange={(e) =>
                                      setEditProgress(
                                        Number(
                                          e.target.value
                                        )
                                      )
                                    }
                                    className="
                                      h-7
                                      w-[60px]
                                      border-gray-200
                                      text-xs
                                      shadow-none
                                    "
                                  />

                                  <Button
                                    size="icon"
                                    className="
                                      h-7
                                      w-7
                                      p-0
                                    "
                                    onClick={
                                      updateActivity
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
                                        activity
                                      )
                                    }
                                  >

                                    <Pencil
                                      size={12}
                                    />

                                  </Button>

                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="
                                      h-7
                                      w-7
                                      p-0
                                    "
                                    onClick={() =>
                                      deleteActivity(
                                        activity.id
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

              )}

            </div>

          ))}

        </div>

      </div>

    </AppLayout>
  );
}

