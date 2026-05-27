"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import AppLayout from "@/component/layout/app-layout";
import { supabase } from "@/lib/supabase";

export default function ProjectDetailPage() {

  const params = useParams();

  const projectId = params.id;

  const [project, setProject] = useState<any>(null);

  const [activities, setActivities] = useState<any[]>([]);

  const [activityName, setActivityName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [progress, setProgress] = useState(0);
  const [estimatedDate, setEstimatedDate] = useState("");

  const getProject = async () => {

    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (data) {
      setProject(data);
    }
  };

  const getActivities = async () => {

    const { data } = await supabase
      .from("activities")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (data) {
      setActivities(data);

      calculateProject(data);
    }
  };

  const calculateProject = async (
    activitiesData: any[]
  ) => {

    const totalActivities = activitiesData.length;

    let averageProgress = 0;

    if (totalActivities > 0) {

      const totalProgress =
        activitiesData.reduce(
          (acc, activity) =>
            acc + activity.progress,
          0
        );

      averageProgress = Math.round(
        totalProgress / totalActivities
      );
    }

    await supabase
      .from("projects")
      .update({
        activities_count: totalActivities,
        global_progress: averageProgress,
      })
      .eq("id", projectId);

    getProject();
  };

  const createActivity = async () => {

    await supabase
      .from("activities")
      .insert([
        {
          project_id: projectId,
          activity_name: activityName,
          responsible,
          progress,
          estimated_date: estimatedDate,
        },
      ]);

    setActivityName("");
    setResponsible("");
    setProgress(0);
    setEstimatedDate("");

    getActivities();
  };

  useEffect(() => {
    getProject();
    getActivities();
  }, []);

  return (
    <AppLayout>

      {project && (

        <>

          {/* Header */}

          <div className="flex items-center justify-between">

            <div>

              <h1 className="text-3xl font-bold">
                {project.project_code}
              </h1>

              <p className="mt-1 text-gray-500">
                {project.description}
              </p>

            </div>

            <div className="text-right">

              <p className="text-sm text-gray-500">
                Avance Global
              </p>

              <p className="text-3xl font-bold">
                {project.global_progress}%
              </p>

            </div>

          </div>

          {/* Formulario actividad */}

          <div className="mt-8 rounded-2xl bg-white p-6 shadow">

            <h2 className="mb-4 text-xl font-semibold">
              Nueva actividad
            </h2>

            <div className="grid gap-4 md:grid-cols-2">

              <input
                type="text"
                placeholder="Actividad"
                value={activityName}
                onChange={(e) =>
                  setActivityName(e.target.value)
                }
                className="rounded-lg border p-3"
              />

              <input
                type="text"
                placeholder="Responsable"
                value={responsible}
                onChange={(e) =>
                  setResponsible(e.target.value)
                }
                className="rounded-lg border p-3"
              />

              <input
                type="number"
                placeholder="% Avance"
                value={progress}
                onChange={(e) =>
                  setProgress(Number(e.target.value))
                }
                className="rounded-lg border p-3"
              />

              <input
                type="date"
                value={estimatedDate}
                onChange={(e) =>
                  setEstimatedDate(e.target.value)
                }
                className="rounded-lg border p-3"
              />

            </div>

            <button
              onClick={createActivity}
              className="mt-4 rounded-lg bg-black px-6 py-3 text-white"
            >
              Crear actividad
            </button>

          </div>

          {/* Lista actividades */}

          <div className="mt-8 grid gap-4">

            {activities.map((activity) => (

              <div
                key={activity.id}
                className="rounded-2xl bg-white p-6 shadow"
              >

                <div className="grid gap-4 md:grid-cols-4">

                  <div>

                    <p className="text-sm text-gray-500">
                      Actividad
                    </p>

                    <p className="font-bold">
                      {activity.activity_name}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Responsable
                    </p>

                    <p className="font-bold">
                      {activity.responsible}
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Avance
                    </p>

                    <p className="font-bold">
                      {activity.progress}%
                    </p>

                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Estado
                    </p>

                    <p className="font-bold">
                      {activity.status}
                    </p>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </>

      )}

    </AppLayout>
  );
}