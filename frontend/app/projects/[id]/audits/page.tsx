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
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

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
      <main className="relative min-h-screen overflow-hidden bg-[#020617] text-white">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-12%] top-[-20%] h-[560px] w-[560px] rounded-full bg-blue-600/[0.07] blur-[150px]" />
          <div className="absolute right-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-violet-600/[0.06] blur-[140px]" />
          <div className="absolute bottom-[-20%] left-[20%] h-[500px] w-[500px] rounded-full bg-fuchsia-500/[0.04] blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/[0.06]">
              <span className="text-sm font-semibold text-violet-200">P</span>
            </div>
            <div className="h-4 w-28 animate-pulse rounded-md bg-white/[0.06]" />
          </div>

          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-white/[0.06]" />
              <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-blue-400/80 border-r-violet-400/30" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Loader2 size={22} className="animate-spin text-blue-300" />
              </div>
            </div>

            <p className="mt-8 text-[10px] font-medium uppercase tracking-[0.25em] text-blue-300/80">
              Project workspace
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              Loading your audit history
            </h1>

            <p className="mt-4 max-w-md text-center text-sm leading-6 text-gray-500">
              Fetching your previous audits and project history.
            </p>

            <div className="mt-9 w-full max-w-2xl space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-white/[0.06]" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-40 rounded bg-white/[0.06]" />
                      <div className="h-3 w-56 rounded bg-white/[0.04]" />
                    </div>
                    <div className="h-5 w-5 rounded bg-white/[0.04]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
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
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("project");
              router.push(`/projects/${projectId}`);
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-wait disabled:opacity-80"
          >
            {navigatingTo === "project" && (
              <Loader2 size={16} className="animate-spin" />
            )}
            {navigatingTo === "project" ? "Opening project..." : "Back to Project"}
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
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("project");
              router.push(`/projects/${projectId}`);
            }}
            className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "project" ? (
              <Loader2 size={17} className="animate-spin text-blue-300" />
            ) : (
              <ArrowLeft
                size={18}
                className="transition-transform group-hover:-translate-x-1"
              />
            )}

            {navigatingTo === "project"
              ? "Opening project..."
              : `Back to ${project.name}`}
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
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("project");
              router.push(`/projects/${projectId}`);
            }}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-medium
              transition
              hover:bg-white/10
              disabled:cursor-wait
              disabled:opacity-70
            "
          >
            {navigatingTo === "project" && (
              <Loader2 size={15} className="animate-spin" />
            )}
            {navigatingTo === "project" ? "Opening project..." : "Project Overview"}
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
                const auditLoading =
                  navigatingTo === `audit:${audit.session.id}`;

                return (
                  <button
                    key={audit.session.id}
                    type="button"
                    disabled={!!navigatingTo}
                    onClick={() => {
                      setNavigatingTo(
                        `audit:${audit.session.id}`
                      );
                      router.push(
                        `/projects/${projectId}/audits/${audit.session.id}`
                      );
                    }}
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
                      disabled:cursor-wait
                      disabled:opacity-80
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

                          {auditLoading ? (
                            <>
                              <Loader2
                                size={15}
                                className="animate-spin text-blue-300"
                              />

                              <span className="text-xs text-blue-300">
                                Opening audit...
                              </span>
                            </>
                          ) : audit.session.status === "completed" ? (
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

                    {auditLoading ? (
                      <Loader2
                        size={20}
                        className="shrink-0 animate-spin text-blue-300"
                      />
                    ) : (
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
                    )}

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