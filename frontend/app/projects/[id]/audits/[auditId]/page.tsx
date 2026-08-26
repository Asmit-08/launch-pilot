"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Package,
  Rocket,
  ShieldAlert,
  Sparkles,
  Target,
} from "lucide-react";

import {
  getProjectAudit,
} from "@/services/projects";
import { getCurrentUser } from "@/services/user";

/* =========================================================
   Types
========================================================= */

interface RiskItem {
  impact?: string;
  risk_type?: string;
  description?: string;
  risk?: string;
  title?: string;
  strategy?: string;
}

type DisplayItem = string | RiskItem;

interface AuditSection {
  score: number;
  strengths: DisplayItem[];
  weaknesses: DisplayItem[];
}

interface AuditData {
  project: {
    id: string;
    name: string;
    description: string | null;
    stage: string;
  };

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

    product_json: AuditSection;

    validation_json: AuditSection;

    launch_json: AuditSection;

    risk_json: {
      score: number;
      critical_risks: DisplayItem[];
      mitigation: DisplayItem[];
    };

    created_at: string;
  };
}

/* =========================================================
   Helpers
========================================================= */

function toDisplayText(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  if (typeof value === "object") {
    if (typeof value.risk_type === "string") {
      return value.risk_type;
    }

    if (typeof value.title === "string") {
      return value.title;
    }

    if (typeof value.strategy === "string") {
      return value.strategy;
    }

    if (typeof value.description === "string") {
      return value.description;
    }

    if (typeof value.risk === "string") {
      return value.risk;
    }

    if (
      value.risk &&
      typeof value.risk === "object"
    ) {
      return toDisplayText(value.risk);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return "Unable to display this item.";
    }
  }

  return String(value);
}

function getRiskTitle(risk: any): string {
  if (typeof risk === "string") {
    return risk;
  }

  if (!risk || typeof risk !== "object") {
    return "Unspecified risk";
  }

  if (typeof risk.risk_type === "string") {
    return risk.risk_type;
  }

  if (typeof risk.title === "string") {
    return risk.title;
  }

  if (typeof risk.risk === "string") {
    return risk.risk;
  }

  if (
    risk.risk &&
    typeof risk.risk === "object"
  ) {
    return getRiskTitle(risk.risk);
  }

  return "Unspecified risk";
}

function getRiskDescription(
  risk: any
): string | null {
  if (!risk || typeof risk !== "object") {
    return null;
  }

  if (typeof risk.description === "string") {
    return risk.description;
  }

  if (
    risk.risk &&
    typeof risk.risk === "object"
  ) {
    return getRiskDescription(risk.risk);
  }

  return null;
}

function getRiskImpact(
  risk: any
): string | null {
  if (!risk || typeof risk !== "object") {
    return null;
  }

  if (typeof risk.impact === "string") {
    return risk.impact;
  }

  if (
    risk.risk &&
    typeof risk.risk === "object"
  ) {
    return getRiskImpact(risk.risk);
  }

  return null;
}

function scoreLabel(score: number) {
  if (score >= 80) {
    return "Strong position";
  }

  if (score >= 60) {
    return "Needs attention";
  }

  return "High risk";
}

function scoreTone(score: number) {
  if (score >= 80) {
    return "emerald";
  }

  if (score >= 60) {
    return "amber";
  }

  return "rose";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/* =========================================================
   Score Driver
========================================================= */

interface ScoreDriver {
  label: string;
  score: number;
  finding: string;
  recommendation: string;
}

function getScoreDriver(
  result: AuditData["result"]
): ScoreDriver {
  const dimensions = [
    {
      label: "Product",
      score: Number(
        result.product_json?.score ?? 0
      ),
      weaknesses:
        result.product_json?.weaknesses ?? [],
    },
    {
      label: "Validation",
      score: Number(
        result.validation_json?.score ?? 0
      ),
      weaknesses:
        result.validation_json?.weaknesses ?? [],
    },
    {
      label: "Launch Readiness",
      score: Number(
        result.launch_json?.score ?? 0
      ),
      weaknesses:
        result.launch_json?.weaknesses ?? [],
    },
  ];

  /*
   * We deliberately do not use Risk here.
   *
   * Risk is an assessment of exposure, whereas the Score Driver
   * should answer: "Which core area is currently holding the
   * startup back the most?"
   */

  const weakest = dimensions.reduce(
    (current, dimension) =>
      dimension.score < current.score
        ? dimension
        : current
  );

  const finding =
    weakest.weaknesses.length > 0
      ? toDisplayText(
          weakest.weaknesses[0]
        )
      : `The ${weakest.label.toLowerCase()} score is currently the weakest signal in this audit.`;

  let recommendation =
    `Investigate this ${weakest.label.toLowerCase()} weakness before investing further in the areas that depend on it.`;

  if (weakest.label === "Product") {
    recommendation =
      "Clarify the product's strongest differentiator and verify that the core value cannot be easily replaced by existing alternatives.";
  }

  if (weakest.label === "Validation") {
    recommendation =
      "Strengthen validation evidence before investing further in acquisition, expansion, or feature development.";
  }

  if (weakest.label === "Launch Readiness") {
    recommendation =
      "Resolve the most important launch constraints before increasing acquisition or pushing for broader distribution.";
  }

  return {
    label: weakest.label,
    score: weakest.score,
    finding,
    recommendation,
  };
}

/* =========================================================
   Page
========================================================= */

export default function AuditPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;
  const auditId = params.auditId as string;

  const [audit, setAudit] =
    useState<AuditData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [navigatingTo, setNavigatingTo] =
    useState<string | null>(null);

  const [isPremium, setIsPremium] =
    useState(false);

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        setError(null);

        const [auditData, currentUser] =
          await Promise.all([
            getProjectAudit(
              projectId,
              auditId
            ),
            getCurrentUser(),
          ]);

        setAudit(auditData);

        const subscription =
          currentUser?.subscription;

        setIsPremium(
          subscription === "premium" ||
          subscription === "super_premium"
        );
      } catch (error) {
        console.error(
          "Failed to load audit:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load audit."
        );
      } finally {
        setLoading(false);
      }
    }

    if (projectId && auditId) {
      loadAudit();
    }
  }, [projectId, auditId]);

  if (loading) {
    return <AuditReportLoader />;
  }

  if (error || !audit) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <ShieldAlert size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Unable to load audit
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Audit not found."}
          </p>

          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("history");
              router.push(
                `/projects/${projectId}/audits`
              );
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "history" && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Back to Audits
          </button>
        </div>
      </main>
    );
  }

  const {
    project,
    session,
    result,
  } = audit;

  const overallScore =
    Number(result.overall_score ?? 0);

  const tone = scoreTone(overallScore);

  const scoreDriver = useMemo(
    () => getScoreDriver(result),
    [result]
  );

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">

      {/* =====================================================
          Header
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">

          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("history");
              router.push(
                `/projects/${projectId}/audits`
              );
            }}
            className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950 disabled:cursor-wait disabled:opacity-70"
          >
            {navigatingTo === "history" ? (
              <Loader2
                size={16}
                className="animate-spin text-blue-600"
              />
            ) : (
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
            )}

            {navigatingTo === "history"
              ? "Opening history..."
              : "Audit history"}
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
            New Audit
            <ArrowRight size={14} />
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

        {/* =====================================================
            Intro
        ===================================================== */}

        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-violet-700">
              <Sparkles size={12} />
              Startup diagnosis
            </div>

            <p className="mt-5 text-sm font-semibold text-blue-600">
              {project.name}
            </p>

            <h1 className="mt-2 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-5xl">
              Your startup,
              <span className="block text-slate-400">
                under pressure.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              Plavtora evaluated your product, validation,
              launch readiness, and risk. The free result gives
              you the signal. Premium exposes the reasoning
              behind it.
            </p>

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock3 size={14} />
            Generated {formatDate(result.created_at)}
          </div>

        </div>

        {/* =====================================================
            Overall Verdict
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">

          <div className="grid lg:grid-cols-[0.72fr_1.28fr]">

            {/* Overall score */}

            <div className="border-b border-slate-100 p-7 sm:p-9 lg:border-b-0 lg:border-r">

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Overall readiness
              </p>

              <div className="mt-5 flex items-end gap-3">

                <span className="text-7xl font-bold leading-none tracking-[-0.07em] text-slate-950 sm:text-8xl">
                  {overallScore}
                </span>

                <span className="pb-2 text-lg font-medium text-slate-400">
                  /100
                </span>

              </div>

              <div
                className={`mt-4 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
                  tone === "emerald"
                    ? "bg-emerald-50 text-emerald-700"
                    : tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-rose-50 text-rose-700"
                }`}
              >
                {scoreLabel(overallScore)}
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className={`h-full rounded-full ${
                    tone === "emerald"
                      ? "bg-emerald-500"
                      : tone === "amber"
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(overallScore, 0),
                      100
                    )}%`,
                  }}
                />

              </div>

              <p className="mt-3 text-xs leading-5 text-slate-400">
                Score generated from the current audit snapshot.
              </p>

            </div>

            {/* Executive verdict */}

            <div className="bg-slate-950 p-7 text-white sm:p-9">

              <div className="flex items-start justify-between gap-5">

                <div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                    Executive verdict
                  </p>

                  <h2 className="mt-3 text-2xl font-bold tracking-tight">
                    What this score means
                  </h2>

                </div>

                <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                  {session.status}
                </span>

              </div>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/65">
                Your audit score is a starting point for
                decision-making, not a guarantee. Use the strongest
                weak signal in the report to decide what deserves
                attention next.
              </p>

              <div className="mt-7 grid gap-2 sm:grid-cols-2">

                <DarkMetric
                  label="Product"
                  score={result.product_json.score}
                />

                <DarkMetric
                  label="Validation"
                  score={result.validation_json.score}
                />

                <DarkMetric
                  label="Launch readiness"
                  score={result.launch_json.score}
                />

                <DarkMetric
                  label="Risk"
                  score={result.risk_json.score}
                  risk
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            Score Overview
        ===================================================== */}

        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <ScoreCard
            title="Product"
            score={result.product_json.score}
            icon={<Package size={18} />}
          />

          <ScoreCard
            title="Validation"
            score={result.validation_json.score}
            icon={<Target size={18} />}
          />

          <ScoreCard
            title="Launch Readiness"
            score={result.launch_json.score}
            icon={<Rocket size={18} />}
          />

          <RiskScoreCard
            score={result.risk_json.score}
          />

        </section>

        {/* =====================================================
            SCORE DRIVER
        ===================================================== */}

        <ScoreDriverSection
          scoreDriver={scoreDriver}
        />

        {/* =====================================================
            Free Value
        ===================================================== */}

        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={19} />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Free result
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  You have the signal. Now find out why.
                </h2>

                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                  Your core scores and executive assessment are
                  available now. Premium opens the specific findings,
                  risks, and mitigations behind those scores.
                </p>

              </div>

            </div>

            {!isPremium && (
              <button
                type="button"
                onClick={() =>
                  router.push("/billing")
                }
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
              >
                Unlock full diagnosis
                <ArrowRight size={16} />
              </button>
            )}

          </div>

        </section>

        {/* =====================================================
            Product
        ===================================================== */}

        <InsightSection
          eyebrow="01 / Product"
          title="Product Analysis"
          description={
            isPremium
              ? "The specific strengths and weaknesses behind your product score."
              : "Your score is free. The reasoning behind it is Premium."
          }
          icon={<Package size={19} />}
        >

          {isPremium ? (
            <>
              <InsightColumn
                title="Strengths"
                items={
                  result.product_json.strengths
                }
                positive
              />

              <InsightColumn
                title="Weaknesses"
                items={
                  result.product_json.weaknesses
                }
              />
            </>
          ) : (
            <PremiumLockedSection
              title="Unlock the reasoning behind your product score"
              description="See exactly what Plavtora considers strong, what looks weak, and what deserves attention."
            />
          )}

        </InsightSection>

        {/* =====================================================
            Validation
        ===================================================== */}

        <InsightSection
          eyebrow="02 / Validation"
          title="Validation Analysis"
          description={
            isPremium
              ? "See where your evidence is convincing and where it still needs work."
              : "Your validation score is free. Detailed evidence analysis is Premium."
          }
          icon={<Target size={19} />}
        >

          {isPremium ? (
            <>
              <InsightColumn
                title="Strengths"
                items={
                  result.validation_json
                    .strengths
                }
                positive
              />

              <InsightColumn
                title="Weaknesses"
                items={
                  result.validation_json
                    .weaknesses
                }
              />
            </>
          ) : (
            <PremiumLockedSection
              title="Unlock deeper validation analysis"
              description="See the evidence gaps, strengths, and weaknesses behind your validation score."
            />
          )}

        </InsightSection>

        {/* =====================================================
            Launch
        ===================================================== */}

        <InsightSection
          eyebrow="03 / Launch"
          title="Launch Readiness"
          description={
            isPremium
              ? "Understand which launch assumptions are solid and which still need work."
              : "Your launch score is free. The detailed breakdown is Premium."
          }
          icon={<Rocket size={19} />}
        >

          {isPremium ? (
            <>
              <InsightColumn
                title="Strengths"
                items={
                  result.launch_json
                    .strengths
                }
                positive
              />

              <InsightColumn
                title="Weaknesses"
                items={
                  result.launch_json
                    .weaknesses
                }
              />
            </>
          ) : (
            <PremiumLockedSection
              title="Unlock launch-readiness detail"
              description="See what's helping your launch and what could block it before you push harder."
            />
          )}

        </InsightSection>

        {/* =====================================================
            Risk
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-[28px] border border-red-100 bg-white shadow-sm">

          <div className="border-b border-red-100 bg-red-50/60 p-6 sm:p-7">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <ShieldAlert size={19} />
              </div>

              <div>

                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
                  04 / Risk
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Risk Analysis
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-600">
                  Risk score:{" "}
                  <span className="font-bold">
                    {result.risk_json.score}/10
                  </span>
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 sm:p-7">

            {isPremium ? (
              <div className="grid gap-6 lg:grid-cols-2">

                <RiskList
                  title="Critical Risks"
                  icon={
                    <AlertTriangle size={17} />
                  }
                  items={
                    result.risk_json
                      .critical_risks
                  }
                  risk
                />

                <RiskList
                  title="Mitigation"
                  icon={
                    <Lightbulb size={17} />
                  }
                  items={
                    result.risk_json
                      .mitigation
                  }
                />

              </div>
            ) : (
              <PremiumLockedRisk />
            )}

          </div>

        </section>

        {/* =====================================================
            Final CTA
        ===================================================== */}

        <section className="mt-8 overflow-hidden rounded-[30px] bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-9">

          <div className="relative">

            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/20 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-2 text-violet-300">
                  <Sparkles size={15} />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    {isPremium
                      ? "Keep iterating"
                      : "Go deeper"}
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                  {isPremium
                    ? "Ready to challenge the diagnosis?"
                    : "The score is only the beginning."}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  {isPremium
                    ? "Use your deeper findings to decide what to investigate or fix next."
                    : "Unlock the specific findings, risks, and mitigations that explain where your startup needs work."}
                </p>

              </div>

              {isPremium ? (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/projects/${projectId}`
                    )
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                >
                  Back to Project
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    router.push("/billing")
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
                >
                  Unlock Premium
                  <ArrowRight size={16} />
                </button>
              )}

            </div>

          </div>

        </section>

        {/* =====================================================
            Footer
        ===================================================== */}

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">
            <Clock3 size={13} />
            Audit generated{" "}
            {formatDate(result.created_at)}
          </div>

          <button
            type="button"
            disabled={!!navigatingTo}
            onClick={() => {
              setNavigatingTo("history");
              router.push(
                `/projects/${projectId}/audits`
              );
            }}
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Audit history
            <ChevronRight size={14} />
          </button>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   Score Driver Component
========================================================= */

function ScoreDriverSection({
  scoreDriver,
}: {
  scoreDriver: ScoreDriver;
}) {
  return (
    <section className="mt-5 overflow-hidden rounded-[28px] border border-blue-100 bg-white shadow-sm">

      <div className="border-b border-blue-100 bg-blue-50/60 p-6 sm:p-7">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Target size={19} />
          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Score driver
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Your biggest pressure point is{" "}
              {scoreDriver.label}.
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
              Of the four dimensions Plavtora evaluated,
              this is currently the weakest signal in your audit.
            </p>

          </div>

        </div>

      </div>

      <div className="p-6 sm:p-7">

        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">

          {/* Weakest dimension */}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Weakest dimension
            </p>

            <div className="mt-4 flex items-end gap-2">

              <span className="text-5xl font-bold tracking-[-0.05em] text-slate-950">
                {scoreDriver.score}
              </span>

              <span className="pb-1.5 text-sm font-medium text-slate-400">
                /10
              </span>

            </div>

            <p className="mt-2 text-sm font-bold text-slate-900">
              {scoreDriver.label}
            </p>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              This does not mean the startup will fail.
              It identifies where uncertainty is currently
              concentrated.
            </p>

          </div>

          {/* Finding + recommendation */}

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-200 bg-white p-5">

              <div className="flex items-center gap-2">

                <AlertTriangle
                  size={16}
                  className="text-amber-500"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  One finding
                </p>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {scoreDriver.finding}
              </p>

            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">

              <div className="flex items-center gap-2">

                <Lightbulb
                  size={16}
                  className="text-emerald-600"
                />

                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
                  Recommended next move
                </p>

              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">
                {scoreDriver.recommendation}
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}

/* =========================================================
   Score Components
========================================================= */

function ScoreCard({
  title,
  score,
  icon,
}: {
  title: string;
  score: number;
  icon: React.ReactNode;
}) {
  const tone = scoreTone(score);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-xs font-bold text-slate-500">
          {title}
        </span>

        <span
          className={`${
            tone === "emerald"
              ? "text-emerald-600"
              : tone === "amber"
                ? "text-amber-600"
                : "text-rose-600"
          }`}
        >
          {icon}
        </span>

      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {score}
        <span className="text-sm font-medium text-slate-400">
          /10
        </span>
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {scoreLabel(score)}
      </p>

    </div>
  );
}

function RiskScoreCard({
  score,
}: {
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="text-xs font-bold text-red-700">
          Risk
        </span>

        <ShieldAlert
          size={18}
          className="text-red-600"
        />

      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {score}
        <span className="text-sm font-medium text-slate-400">
          /10
        </span>
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-red-600">
        Risk assessment
      </p>

    </div>
  );
}

function DarkMetric({
  label,
  score,
  risk = false,
}: {
  label: string;
  score: number;
  risk?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">

      <div className="flex items-center justify-between gap-3">

        <span className="text-xs text-white/50">
          {label}
        </span>

        <span
          className={`text-sm font-bold ${
            risk
              ? "text-rose-300"
              : "text-white"
          }`}
        >
          {score}/10
        </span>

      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">

        <div
          className={`h-full rounded-full ${
            risk
              ? "bg-rose-400"
              : "bg-violet-400"
          }`}
          style={{
            width: `${Math.min(
              Math.max(score, 0) * 10,
              100
            )}%`,
          }}
        />

      </div>

    </div>
  );
}

/* =========================================================
   Insight Section
========================================================= */

function InsightSection({
  eyebrow,
  title,
  description,
  icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6 sm:p-7">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            {icon}
          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              {eyebrow}
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              {title}
            </h2>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>

          </div>

        </div>

      </div>

      <div className="p-6 sm:p-7">

        <div className="grid gap-5 lg:grid-cols-2">
          {children}
        </div>

      </div>

    </section>
  );
}

function InsightColumn({
  title,
  items,
  positive = false,
}: {
  title: string;
  items: DisplayItem[];
  positive?: boolean;
}) {
  return (
    <div>

      <div className="mb-4 flex items-center justify-between">

        <h3 className="text-sm font-bold text-slate-900">
          {title}
        </h3>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
            positive
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {items.length} items
        </span>

      </div>

      {items.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-400">
          No items returned for this section.
        </div>

      ) : (

        <div className="space-y-3">

          {items.map((item, index) => (

            <div
              key={index}
              className={`rounded-2xl border p-4 ${
                positive
                  ? "border-emerald-100 bg-emerald-50/60"
                  : "border-slate-200 bg-slate-50"
              }`}
            >

              <div className="flex gap-3">

                {positive && (
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                )}

                <p className="text-sm leading-6 text-slate-600">
                  {toDisplayText(item)}
                </p>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

/* =========================================================
   Premium Locked Section
========================================================= */

function PremiumLockedSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="lg:col-span-2 overflow-hidden rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-6 sm:p-7">

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-4">

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
            <LockKeyhole size={19} />
          </div>

          <div>

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
              Premium analysis
            </p>

            <h3 className="mt-2 text-xl font-bold text-slate-950">
              {title}
            </h3>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {description}
            </p>

          </div>

        </div>

        <button
          type="button"
          onClick={() =>
            window.location.assign("/billing")
          }
          className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
        >
          Unlock Premium
        </button>

      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">

        {[
          "Specific strengths",
          "Weaknesses & evidence gaps",
          "Prioritized interpretation",
        ].map((label) => (

          <div
            key={label}
            className="rounded-xl border border-white bg-white/70 px-4 py-3 text-xs font-medium text-slate-600"
          >
            <span className="mr-2 text-violet-600">
              •
            </span>

            {label}
          </div>

        ))}

      </div>

    </div>
  );
}

/* =========================================================
   Risk
========================================================= */

function RiskList({
  title,
  icon,
  items,
  risk = false,
}: {
  title: string;
  icon: React.ReactNode;
  items: DisplayItem[];
  risk?: boolean;
}) {
  return (
    <div>

      <div className="mb-4 flex items-center justify-between">

        <div className="flex items-center gap-2">

          <span
            className={
              risk
                ? "text-red-600"
                : "text-amber-600"
            }
          >
            {icon}
          </span>

          <h3 className="text-sm font-bold text-slate-900">
            {title}
          </h3>

        </div>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
            risk
              ? "bg-red-50 text-red-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {items.length}
        </span>

      </div>

      <div className="space-y-3">

        {items.map((item, index) => {

          const titleText = risk
            ? getRiskTitle(item)
            : toDisplayText(item);

          const description = risk
            ? getRiskDescription(item)
            : null;

          const impact = risk
            ? getRiskImpact(item)
            : null;

          return (
            <div
              key={index}
              className={`rounded-2xl border p-4 ${
                risk
                  ? "border-red-100 bg-red-50/70"
                  : "border-amber-100 bg-amber-50/70"
              }`}
            >

              <p
                className={`text-sm font-semibold ${
                  risk
                    ? "text-red-800"
                    : "text-amber-800"
                }`}
              >
                {titleText}
              </p>

              {description && (
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {description}
                </p>
              )}

              {impact && (
                <p className="mt-2 text-xs font-medium text-slate-400">
                  Impact: {impact}
                </p>
              )}

            </div>
          );
        })}

      </div>

    </div>
  );
}

function PremiumLockedRisk() {
  return (
    <div className="overflow-hidden rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-rose-50 p-6 sm:p-7">

      <div className="grid gap-4 md:grid-cols-2">

        <LockedRiskCard
          title="Critical Risks"
          description="See the specific risks Plavtora identified, their impact, and why they matter."
          icon={<AlertTriangle size={18} />}
          tone="red"
        />

        <LockedRiskCard
          title="Mitigation"
          description="Get the recommended actions for reducing the risks that affect your launch."
          icon={<Lightbulb size={18} />}
          tone="amber"
        />

      </div>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-white bg-white/70 p-5 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <p className="font-bold text-slate-950">
            Want the full risk analysis?
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Unlock Critical Risks and Mitigation with Premium.
          </p>

        </div>

        <button
          type="button"
          onClick={() =>
            window.location.assign("/billing")
          }
          className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
        >
          Unlock Premium
        </button>

      </div>

    </div>
  );
}

function LockedRiskCard({
  title,
  description,
  icon,
  tone,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tone: "red" | "amber";
}) {
  return (
    <div
      className={`rounded-2xl border bg-white/70 p-5 ${
        tone === "red"
          ? "border-red-100"
          : "border-amber-100"
      }`}
    >

      <div className="flex items-center gap-3">

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            tone === "red"
              ? "bg-red-50 text-red-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {icon}
        </div>

        <div>

          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Premium
          </p>

          <h3 className="mt-1 font-bold text-slate-950">
            {title}
          </h3>

        </div>

      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   Loader
========================================================= */

function AuditReportLoader() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 sm:px-6">

      <div className="mx-auto max-w-7xl">

        <div className="flex items-center justify-between">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="mt-12">

          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />

          <div className="mt-4 h-12 w-80 animate-pulse rounded-lg bg-slate-200" />

          <div className="mt-4 h-4 w-[520px] max-w-full animate-pulse rounded bg-slate-100" />

        </div>

        <div className="mt-10 overflow-hidden rounded-[30px] bg-white ring-1 ring-slate-200">

          <div className="grid gap-8 lg:grid-cols-2">

            <div className="h-72 animate-pulse border-b border-slate-100 bg-slate-50 lg:border-b-0 lg:border-r" />

            <div className="h-72 animate-pulse bg-slate-900/90" />

          </div>

        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
            />
          ))}

        </div>

        <div className="mt-5 h-72 animate-pulse rounded-[28px] bg-white ring-1 ring-slate-200" />

        <div className="mt-8 h-40 animate-pulse rounded-[28px] bg-white ring-1 ring-slate-200" />

      </div>

    </main>
  );
}