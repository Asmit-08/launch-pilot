"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  Target,
  Package,
  Rocket,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

import { getProjectAudit } from "@/services/projects";

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

    product_json: {
      score: number;
      strengths: DisplayItem[];
      weaknesses: DisplayItem[];
    };

    validation_json: {
      score: number;
      strengths: DisplayItem[];
      weaknesses: DisplayItem[];
    };

    launch_json: {
      score: number;
      strengths: DisplayItem[];
      weaknesses: DisplayItem[];
    };

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
    /*
     * Risk object:
     *
     * {
     *   impact,
     *   risk_type,
     *   description
     * }
     */

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

    /*
     * Handle nested objects safely.
     */

    if (
      value.risk &&
      typeof value.risk === "object"
    ) {
      return toDisplayText(value.risk);
    }

    /*
     * Final fallback.
     * React receives a string instead of an object.
     */

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

  useEffect(() => {
    async function loadAudit() {
      try {
        setLoading(true);
        setError(null);

        const data = await getProjectAudit(
          projectId,
          auditId
        );

        setAudit(data);
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
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
        <div className="flex items-center gap-3 text-gray-400">
          <Loader2
            size={20}
            className="animate-spin"
          />
          Loading audit...
        </div>
      </main>
    );
  }

  if (error || !audit) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] px-6 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">
            Unable to load audit
          </h1>

          <p className="mt-2 text-gray-400">
            {error || "Audit not found."}
          </p>

          <button
            onClick={() =>
              router.push(
                `/projects/${projectId}/audits`
              )
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
          >
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

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* Header */}

      <header className="border-b border-white/10">

        <div className="mx-auto max-w-7xl px-6 py-5">

          <button
            onClick={() =>
              router.push(
                `/projects/${projectId}/audits`
              )
            }
            className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Audit History
          </button>

        </div>

      </header>

      {/* Main */}

      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* Audit Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-medium text-blue-400">
              {project.name}
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              Launch Audit
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-400">

              <span>
                {formatDate(result.created_at)}
              </span>

              <span className="text-gray-700">
                •
              </span>

              <span className="flex items-center gap-2 capitalize">

                <CheckCircle2
                  size={15}
                  className="text-green-400"
                />

                {session.status}

              </span>

            </div>

          </div>

          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-6 py-4 text-center">

            <p className="text-xs uppercase tracking-widest text-blue-300">
              Overall Score
            </p>

            <p className="mt-1 text-4xl font-bold">

              {result.overall_score}

              <span className="text-lg text-gray-500">
                /100
              </span>

            </p>

          </div>

        </div>

        {/* Score Overview */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <ScoreCard
            title="Product"
            score={result.product_json.score}
            icon={<Package size={20} />}
          />

          <ScoreCard
            title="Validation"
            score={result.validation_json.score}
            icon={<Target size={20} />}
          />

          <ScoreCard
            title="Launch Readiness"
            score={result.launch_json.score}
            icon={<Rocket size={20} />}
          />

          <RiskScoreCard
            score={result.risk_json.score}
          />

        </div>

        {/* Product */}

        <InsightSection
          title="Product Analysis"
          icon={<Package size={21} />}
        >

          <InsightColumn
            title="Strengths"
            items={result.product_json.strengths}
            positive
          />

          <InsightColumn
            title="Weaknesses"
            items={result.product_json.weaknesses}
          />

        </InsightSection>

        {/* Validation */}

        <InsightSection
          title="Validation Analysis"
          icon={<Target size={21} />}
        >

          <InsightColumn
            title="Strengths"
            items={result.validation_json.strengths}
            positive
          />

          <InsightColumn
            title="Weaknesses"
            items={result.validation_json.weaknesses}
          />

        </InsightSection>

        {/* Launch Readiness */}

        <InsightSection
          title="Launch Readiness"
          icon={<Rocket size={21} />}
        >

          <InsightColumn
            title="Strengths"
            items={result.launch_json.strengths}
            positive
          />

          <InsightColumn
            title="Weaknesses"
            items={result.launch_json.weaknesses}
          />

        </InsightSection>

        {/* Risk */}

        <section className="mt-8 rounded-3xl border border-red-500/20 bg-white/5 p-7">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">

              <ShieldAlert size={21} />

            </div>

            <div>

              <h2 className="text-xl font-semibold">
                Risk Analysis
              </h2>

              <p className="text-sm text-gray-500">
                Identified risks and recommended mitigation
              </p>

            </div>

          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-2">

            {/* Critical Risks */}

            <div>

              <div className="mb-4 flex items-center gap-2">

                <AlertTriangle
                  size={18}
                  className="text-red-400"
                />

                <h3 className="font-semibold">
                  Critical Risks
                </h3>

                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-300">
                  {result.risk_json.critical_risks.length}
                </span>

              </div>

              <div className="space-y-3">

                {result.risk_json.critical_risks.map(
                  (risk, index) => {

                    const title =
                      getRiskTitle(risk);

                    const description =
                      getRiskDescription(risk);

                    const impact =
                      getRiskImpact(risk);

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-red-500/10 bg-red-500/[0.04] p-4"
                      >

                        <p className="text-sm font-medium text-red-300">
                          {title}
                        </p>

                        {description && (
                          <p className="mt-2 text-sm leading-relaxed text-gray-300">
                            {description}
                          </p>
                        )}

                        {impact && (
                          <p className="mt-2 text-xs text-gray-500">
                            Impact: {impact}
                          </p>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* Mitigation */}

            <div>

              <div className="mb-4 flex items-center gap-2">

                <Lightbulb
                  size={18}
                  className="text-yellow-400"
                />

                <h3 className="font-semibold">
                  Mitigation
                </h3>

                <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-300">
                  {result.risk_json.mitigation.length}
                </span>

              </div>

              <div className="space-y-3">

                {result.risk_json.mitigation.map(
                  (item, index) => {

                    const text =
                      toDisplayText(item);

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-yellow-500/10 bg-yellow-500/[0.04] p-4"
                      >

                        <p className="text-sm leading-relaxed text-gray-300">
                          {text}
                        </p>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

          </div>

        </section>

        {/* Footer */}

        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">

          <div className="flex items-center gap-2 text-xs text-gray-500">

            <Clock size={14} />

            Audit generated{" "}
            {formatDate(result.created_at)}

          </div>

          <button
            onClick={() =>
              router.push(
                `/projects/${projectId}/audits`
              )
            }
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            View Audit History
          </button>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   Score Card
========================================================= */

interface ScoreCardProps {
  title: string;
  score: number;
  icon: React.ReactNode;
}

function ScoreCard({
  title,
  score,
  icon,
}: ScoreCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          {title}
        </span>

        <div className="text-blue-400">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-3xl font-bold">

        {score}

        <span className="text-base text-gray-500">
          /10
        </span>

      </p>

    </div>
  );
}

/* =========================================================
   Risk Score Card
========================================================= */

function RiskScoreCard({
  score,
}: {
  score: number;
}) {
  return (
    <div className="rounded-3xl border border-red-500/20 bg-red-500/[0.04] p-6 backdrop-blur-xl">

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          Risk
        </span>

        <ShieldAlert
          size={20}
          className="text-red-400"
        />

      </div>

      <p className="mt-5 text-3xl font-bold">

        {score}

        <span className="text-base text-gray-500">
          /10
        </span>

      </p>

      <p className="mt-2 text-xs text-gray-500">
        Risk assessment score
      </p>

    </div>
  );
}

/* =========================================================
   Insight Section
========================================================= */

interface InsightSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function InsightSection({
  title,
  icon,
  children,
}: InsightSectionProps) {
  return (
    <section className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
          {icon}
        </div>

        <h2 className="text-xl font-semibold">
          {title}
        </h2>

      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {children}
      </div>

    </section>
  );
}

/* =========================================================
   Insight Column
========================================================= */

interface InsightColumnProps {
  title: string;
  items: DisplayItem[];
  positive?: boolean;
}

function InsightColumn({
  title,
  items,
  positive = false,
}: InsightColumnProps) {
  return (
    <div>

      <h3 className="mb-4 font-semibold">
        {title}
      </h3>

      <div className="space-y-3">

        {items.map((item, index) => {

          const text =
            toDisplayText(item);

          return (
            <div
              key={index}
              className={`
                rounded-2xl
                border
                p-4
                ${
                  positive
                    ? "border-green-500/10 bg-green-500/[0.04]"
                    : "border-white/10 bg-black/10"
                }
              `}
            >

              <div className="flex gap-3">

                {positive && (
                  <CheckCircle2
                    size={17}
                    className="mt-0.5 shrink-0 text-green-400"
                  />
                )}

                <p className="text-sm leading-relaxed text-gray-300">
                  {text}
                </p>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

/* =========================================================
   Helpers
========================================================= */

function formatDate(date: string) {
  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}

