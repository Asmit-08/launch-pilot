"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  getProjectById,
  getProjectAudits,
  Project,
} from "@/services/projects";

interface Audit {
  session: {
    id: string;
    project_id: string;
    audit_type: string;
    status: string;
    created_at: string;
    completed_at: string | null;
  };

  result: {
    id: string;
    audit_session_id: string;
    overall_score: number;
    product_json: Record<string, any>;
    validation_json: Record<string, any>;
    launch_json: Record<string, any>;
    risk_json: Record<string, any>;
    created_at: string;
  } | null;
}

export default function ProjectAuditsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAudits() {
      try {
        setLoading(true);
        setError(null);

        const [workspace, auditData] = await Promise.all([
          getProjectById(projectId),
          getProjectAudits(projectId),
        ]);

        setProject(workspace.project);
        setAudits(auditData);
      } catch (error) {
        console.error("Failed to load audits:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load audits."
        );
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadAudits();
    }
  }, [projectId]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin" />
          Loading audits...
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Unable to load audits
          </h1>

          <p className="mt-2 text-gray-400">
            {error || "Project not found."}
          </p>

          <button
            onClick={() =>
              router.push(`/projects/${projectId}`)
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
          >
            Back to Project
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Header */}
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5">

          <button
            onClick={() =>
              router.push(`/projects/${projectId}`)
            }
            className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to {project.name}
          </button>

        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Page Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

          <div>
            <p className="text-sm text-blue-400">
              {project.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Audit History
            </h1>

            <p className="mt-2 max-w-2xl text-gray-400">
              Review previous launch audits and track how your
              project has evolved over time.
            </p>
          </div>

          <button
            onClick={() =>
              router.push(`/projects/${projectId}`)
            }
            className="
              rounded-xl
              border border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-medium
              transition
              hover:bg-white/10
            "
          >
            Project Overview
          </button>

        </div>

        {/* Audit List */}
        <div className="mt-10">

          {audits.length === 0 ? (

            <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                <Clock
                  size={24}
                  className="text-gray-400"
                />
              </div>

              <h2 className="mt-5 text-xl font-semibold">
                No audits yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-gray-400">
                Run your first audit to start building your
                project's audit history.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {audits.map((audit, index) => {

                const score =
                  audit.result?.overall_score ?? 0;

                const isLatest = index === 0;

                return (
                  <button
                    key={audit.session.id}
                    onClick={() =>
                    router.push(
                      `/projects/${projectId}/audits/${audit.session.id}`
                    )
                  }
                    className="
                      group
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-3xl
                      border
                      border-white/10
                      bg-white/5
                      p-6
                      text-left
                      backdrop-blur-xl
                      transition-all
                      hover:border-blue-500/30
                      hover:bg-white/[0.07]
                    "
                  >

                    <div className="flex items-center gap-5">

                      {/* Score */}
                      <div className="
                        flex
                        h-16
                        w-16
                        shrink-0
                        items-center
                        justify-center
                        rounded-2xl
                        border
                        border-blue-500/20
                        bg-blue-500/10
                      ">
                        <div className="text-center">
                          <p className="text-xl font-bold text-white">
                            {score}
                          </p>

                          <p className="text-[10px] text-gray-500">
                            /100
                          </p>
                        </div>
                      </div>

                      {/* Info */}
                      <div>

                        <div className="flex flex-wrap items-center gap-3">

                          <h2 className="font-semibold text-white">
                            Launch Audit
                          </h2>

                          {isLatest && (
                            <span className="
                              rounded-full
                              border
                              border-blue-500/20
                              bg-blue-500/10
                              px-2.5
                              py-1
                              text-[10px]
                              font-medium
                              text-blue-300
                            ">
                              Latest
                            </span>
                          )}

                        </div>

                        <p className="mt-1 text-sm text-gray-400">
                          {formatDate(
                            audit.result?.created_at ||
                            audit.session.created_at
                          )}
                        </p>

                        <div className="mt-3 flex items-center gap-2">

                          {audit.session.status === "completed" ? (
                            <>
                              <CheckCircle2
                                size={15}
                                className="text-green-400"
                              />

                              <span className="text-xs text-green-400">
                                Completed
                              </span>
                            </>
                          ) : (
                            <>
                              <Clock
                                size={15}
                                className="text-yellow-400"
                              />

                              <span className="text-xs text-yellow-400">
                                {audit.session.status}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                    <ArrowRight
                      size={20}
                      className="
                        shrink-0
                        text-gray-500
                        transition-transform
                        group-hover:translate-x-1
                        group-hover:text-white
                      "
                    />

                  </button>
                );
              })}

            </div>

          )}

        </div>

      </section>

    </main>
  );
}


function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}