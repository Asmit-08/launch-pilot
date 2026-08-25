"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  TrendingUp,
  Sparkles,
  Target,
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

function ScoreBadge({
  score,
  latest,
}: {
  score: number;
  latest?: boolean;
}) {
  const tone =
    score >= 80
      ? "emerald"
      : score >= 60
        ? "amber"
        : "rose";

  const classes = {
    emerald: {
      wrap: "border-emerald-200 bg-emerald-50",
      score: "text-emerald-700",
      sub: "text-emerald-600",
    },
    amber: {
      wrap: "border-amber-200 bg-amber-50",
      score: "text-amber-700",
      sub: "text-amber-600",
    },
    rose: {
      wrap: "border-rose-200 bg-rose-50",
      score: "text-rose-700",
      sub: "text-rose-600",
    },
  }[tone];

  return (
    <div
      className={`relative flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border ${classes.wrap}`}
    >
      {latest && (
        <span className="absolute -right-2 -top-2 rounded-full bg-slate-950 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
          Latest
        </span>
      )}

      <span
        className={`text-xl font-bold leading-none ${classes.score}`}
      >
        {score}
      </span>

      <span
        className={`mt-1 text-[9px] font-semibold uppercase tracking-wider ${classes.sub}`}
      >
        / 100
      </span>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
        <CheckCircle2 size={12} />
        Completed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
      <Clock3 size={12} />
      {status}
    </span>
  );
}

export default function ProjectAuditsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [audits, setAudits] = useState<Audit[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const [navigatingTo, setNavigatingTo] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadAudits() {
      try {
        setLoading(true);
        setError(null);

        const [workspace, auditData] =
          await Promise.all([
            getProjectById(projectId),
            getProjectAudits(projectId),
          ]);

        setProject(workspace.project);
        setAudits(auditData);
      } catch (error) {
        console.error(
          "Failed to load audits:",
          error
        );

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

  const completedAudits = useMemo(
    () =>
      audits.filter(
        (audit) =>
          audit.session.status ===
          "completed"
      ),
    [audits]
  );

  const scores = useMemo(
    () =>
      completedAudits
        .map(
          (audit) =>
            audit.result?.overall_score
        )
        .filter(
          (score): score is number =>
            typeof score === "number"
        ),
    [completedAudits]
  );

  const latestScore = scores[0] ?? null;

  const firstScore =
    scores.length > 0
      ? scores[scores.length - 1]
      : null;

  const scoreChange =
    latestScore !== null &&
    firstScore !== null
      ? latestScore - firstScore
      : null;

  if (loading) {
    return <AuditHistoryLoader />;
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <TrendingUp size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Unable to load audit history
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Project not found."}
          </p>

          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("project");
              router.push(
                `/projects/${projectId}`
              );
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "project" && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            {navigatingTo === "project"
              ? "Opening project..."
              : "Back to Project"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("project");
              router.push(
                `/projects/${projectId}`
              );
            }}
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "project" ? (
              <Loader2
                size={17}
                className="animate-spin text-blue-600"
              />
            ) : (
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            )}

            {navigatingTo === "project"
              ? "Opening project..."
              : `Back to ${project.name}`}
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Plavtora
            </span>
          </div>

          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("new-audit");
              router.push("/audit");
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "new-audit" && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            New Audit
            <ArrowRight size={14} />
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
        {/* Page intro */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">
              <Sparkles size={12} />
              Startup history
            </div>

            <p className="mt-5 text-sm font-semibold text-blue-600">
              {project.name}
            </p>

            <h1 className="mt-2 text-4xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl">
              Audit history
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Revisit previous diagnoses, compare your scores, and see whether
              your startup is actually improving over time.
            </p>
          </div>

          {audits.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Total audits
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {audits.length}
              </p>
            </div>
          )}
        </div>

        {/* Snapshot */}
        {audits.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SnapshotCard
              icon={<Target size={18} />}
              label="Latest score"
              value={
                latestScore !== null
                  ? `${latestScore}/100`
                  : "—"
              }
              detail={
                latestScore !== null
                  ? latestScore >= 80
                    ? "Strong position"
                    : latestScore >= 60
                      ? "Needs attention"
                      : "High risk"
                  : "No completed audit"
              }
            />

            <SnapshotCard
              icon={<CheckCircle2 size={18} />}
              label="Completed audits"
              value={`${completedAudits.length}`}
              detail={
                completedAudits.length === 1
                  ? "One completed diagnosis"
                  : "Completed diagnoses"
              }
            />

            <SnapshotCard
              icon={<TrendingUp size={18} />}
              label="Score movement"
              value={
                scoreChange === null
                  ? "—"
                  : scoreChange > 0
                    ? `+${scoreChange}`
                    : `${scoreChange}`
              }
              detail={
                scoreChange === null
                  ? "Run another audit to compare"
                  : scoreChange > 0
                    ? "Improved since your first audit"
                    : scoreChange < 0
                      ? "Dropped since your first audit"
                      : "No change since your first audit"
              }
              positive={
                scoreChange !== null &&
                scoreChange > 0
              }
            />
          </div>
        )}

        {/* History */}
        <div className="mt-10">
          {audits.length === 0 ? (
            <EmptyState
              onRunAudit={() => {
                setNavigatingTo("new-audit");
                router.push("/audit");
              }}
              loading={navigatingTo === "new-audit"}
            />
          ) : (
            <div>
              <div className="mb-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Your diagnoses
                  </p>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Previous audits
                  </h2>
                </div>

                <span className="hidden text-xs text-slate-400 sm:block">
                  Newest first
                </span>
              </div>

              <div className="space-y-3">
                {audits.map(
                  (audit, index) => {
                    const score =
                      audit.result
                        ?.overall_score ?? 0;

                    const isLatest =
                      index === 0;

                    const auditLoading =
                      navigatingTo ===
                      `audit:${audit.session.id}`;

                    return (
                      <button
                        key={
                          audit.session.id
                        }
                        type="button"
                        disabled={
                          !!navigatingTo
                        }
                        onClick={() => {
                          setNavigatingTo(
                            `audit:${audit.session.id}`
                          );

                          router.push(
                            `/projects/${projectId}/audits/${audit.session.id}`
                          );
                        }}
                        className="group flex w-full items-center justify-between gap-5 rounded-[24px] border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-wait disabled:opacity-80 sm:p-6"
                      >
                        <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                          <ScoreBadge
                            score={score}
                            latest={isLatest}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className="font-bold text-slate-950">
                                {formatAuditType(
                                  audit.session
                                    .audit_type
                                )}
                              </h3>

                              <StatusBadge
                                status={
                                  audit.session
                                    .status
                                }
                              />
                            </div>

                            <p className="mt-1 text-sm text-slate-500">
                              {formatDate(
                                audit.result
                                  ?.created_at ||
                                  audit.session
                                    .created_at
                              )}
                            </p>

                            <p className="mt-2 text-xs text-slate-400">
                              {audit.result
                                ? getScoreLabel(
                                    score
                                  )
                                : "Audit result unavailable"}
                            </p>
                          </div>
                        </div>

                        {auditLoading ? (
                          <Loader2
                            size={19}
                            className="shrink-0 animate-spin text-blue-600"
                          />
                        ) : (
                          <ArrowRight
                            size={19}
                            className="shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-900"
                          />
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom action */}
        {audits.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-[26px] border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-6 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-violet-700">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.17em]">
                    Keep iterating
                  </span>
                </div>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Another audit gives you a new baseline.
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                  Use another audit after making meaningful changes to see
                  whether your startup is actually getting stronger.
                </p>
              </div>

              <button
                type="button"
                disabled={!!navigatingTo}
                onClick={() => {
                  setNavigatingTo(
                    "new-audit"
                  );
                  router.push("/audit");
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-wait disabled:opacity-70"
              >
                {navigatingTo ===
                  "new-audit" && (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                )}
                Run another audit
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function SnapshotCard({
  icon,
  label,
  value,
  detail,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>

        {positive && (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
            Improving
          </span>
        )}
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function EmptyState({
  onRunAudit,
  loading,
}: {
  onRunAudit: () => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm sm:p-14">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <Sparkles size={24} />
      </div>

      <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
        Start your history
      </p>

      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        No audits yet.
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Run your first audit to establish a baseline for this startup.
      </p>

      <button
        type="button"
        disabled={loading}
        onClick={onRunAudit}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-70"
      >
        {loading && (
          <Loader2
            size={15}
            className="animate-spin"
          />
        )}
        Run first audit
        <ArrowRight size={15} />
      </button>
    </div>
  );
}

function getScoreLabel(score: number) {
  if (score >= 80) {
    return "Strong startup position";
  }

  if (score >= 60) {
    return "Needs attention before scaling";
  }

  return "Significant weaknesses to address";
}

function formatAuditType(
  auditType: string
) {
  if (!auditType) {
    return "Launch Audit";
  }

  return auditType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

function AuditHistoryLoader() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />

            <div>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-2 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-10 w-28 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
            />
          ))}
        </div>

        <div className="mt-8 space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-[24px] bg-white ring-1 ring-slate-200"
            />
          ))}
        </div>
      </div>
    </main>
  );
}