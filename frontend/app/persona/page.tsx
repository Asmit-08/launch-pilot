"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/services/session";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import JsonLd from "./components/JsonLd";
import {
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowLeft,
  Target
} from "lucide-react";

interface PersonaResult {
  executive_summary: string;
  ideal_customer_profile: string;

  persona: {
    name?: string;
    age_range?: string;
    occupation?: string;
    description?: string;
  };

  pain_points: string[];
  goals: string[];
  motivations: string[];
  buying_triggers: string[];
  buying_behaviour: string;
  common_objections: string[];
  marketing_channels: string[];
  messaging_recommendations: string[];
  content_ideas: string[];

  confidence_score: number;

  error?: string;
}

interface UsageLimitInfo {
  plan?: string;
  resource?: string;
  limit?: number;
  used?: number;
}

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
};

const LOADING_STAGES = [
  "Analyzing your product...",
  "Identifying ideal customers...",
  "Researching customer motivations...",
  "Building your persona...",
  "Preparing marketing insights...",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-400/80">
      {children}
    </p>
  );
}

function InsightCard({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items?: string[];
}) {
  return (
    <Card style={cardStyle} className="rounded-2xl">
      <CardHeader className="pb-2">
        <Eyebrow>{eyebrow}</Eyebrow>

        <CardTitle className="text-lg font-semibold text-zinc-100">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 text-zinc-400">
          {items?.map((item, i) => (
            <li
              key={i}
              className="flex gap-2 leading-relaxed"
            >
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ConfidenceRing({ score }: { score: number }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(
    0,
    Math.min(100, score ?? 0)
  );
  const offset =
    circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        className="h-32 w-32 -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="6"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#7c3aed"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition:
              "stroke-dashoffset 0.8s ease",
          }}
        />
      </svg>

      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-slate-950">
          {clamped}%
        </span>

        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          confidence
        </span>
      </div>
    </div>
  );
}

export default function PersonaPage() {
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const [result, setResult] =
    useState<PersonaResult | null>(null);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * USAGE LIMIT STATE
   * ---------------------------------------------------------
   */

  const [usageLimitReached, setUsageLimitReached] =
    useState(false);

  const [usageLimitInfo, setUsageLimitInfo] =
    useState<UsageLimitInfo | null>(null);

  const [formData, setFormData] = useState({
    what_are_you_building: "",
    product_description: "",
    additional_details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /*
   * ---------------------------------------------------------
   * GENERATE PERSONA
   * ---------------------------------------------------------
   */

  const generatePersona = async (
    data: typeof formData
  ) => {
    if (loading) return;

    setLoading(true);
    setResult(null);
    setGenerationError(null);

    setUsageLimitReached(false);
    setUsageLimitInfo(null);

    setStageIndex(0);

    const stageTimers = LOADING_STAGES.map(
      (_, i) =>
        window.setTimeout(
          () => setStageIndex(i),
          i * 1400
        )
    );

    try {
      const payload = {
        ...data,
        additional_details:
          data.additional_details || null,
      };

      /*
       * -------------------------------------------------------
       * AUTHENTICATION
       * -------------------------------------------------------
       */

      const session = await getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      /*
       * -------------------------------------------------------
       * BACKEND
       * -------------------------------------------------------
       */

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "The application backend is not configured."
        );
      }

      const response = await fetch(
        `${apiUrl}/persona`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },

          body: JSON.stringify(payload),
        }
      );

      const responseData =
        await response.json();

      /*
       * -------------------------------------------------------
       * USAGE LIMIT REACHED
       * -------------------------------------------------------
       *
       * Backend returns:
       *
       * 429
       *
       * {
       *   "detail": {
       *     "error": "usage_limit_reached",
       *     "resource": "personas",
       *     "plan": "free",
       *     "limit": 2,
       *     "used": 2
       *   }
       * }
       *
       * We handle this separately from an actual AI failure.
       */

      if (
        response.status === 429 &&
        responseData?.detail?.error ===
          "usage_limit_reached"
      ) {
        const detail =
          responseData.detail;

        setUsageLimitReached(true);

        setUsageLimitInfo({
          plan: detail.plan,
          resource: detail.resource,
          limit: detail.limit,
          used: detail.used,
        });

        return;
      }

      /*
       * -------------------------------------------------------
       * OTHER BACKEND ERRORS
       * -------------------------------------------------------
       */

      if (!response.ok) {
        let errorMessage =
          "Failed to generate persona.";

        if (
          typeof responseData?.detail ===
          "string"
        ) {
          errorMessage =
            responseData.detail;
        } else if (
          responseData?.detail?.message
        ) {
          errorMessage =
            responseData.detail.message;
        }

        throw new Error(errorMessage);
      }

      /*
       * -------------------------------------------------------
       * SUCCESS
       * -------------------------------------------------------
       */

      setResult(responseData);
    } catch (error) {
      console.error(
        "Persona generation failed:",
        error
      );

      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your persona.";

      setGenerationError(message);

      /*
       * Only show an error result for actual generation
       * failures.
       *
       * Usage-limit failures never reach this block.
       */

      setResult({
        error: message,
        executive_summary: "",
        ideal_customer_profile: "",
        persona: {},
        pain_points: [],
        goals: [],
        motivations: [],
        buying_triggers: [],
        buying_behaviour: "",
        common_objections: [],
        marketing_channels: [],
        messaging_recommendations: [],
        content_ideas: [],
        confidence_score: 0,
      });
    } finally {
      stageTimers.forEach((timer) =>
        window.clearTimeout(timer)
      );

      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * RESUME AFTER AUTH
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function resumePendingGeneration() {
      const pending =
        sessionStorage.getItem(
          "pending_persona_generation"
        );

      if (!pending) {
        return;
      }

      const session = await getSession();

      if (!session) {
        return;
      }

      try {
        const savedFormData =
          JSON.parse(pending);

        setFormData(savedFormData);

        sessionStorage.removeItem(
          "pending_persona_generation"
        );

        await generatePersona(
          savedFormData
        );
      } catch (error) {
        console.error(
          "Failed to resume persona generation:",
          error
        );

        sessionStorage.removeItem(
          "pending_persona_generation"
        );
      }
    }

    resumePendingGeneration();
  }, []);

  /*
   * ---------------------------------------------------------
   * SUBMIT
   * ---------------------------------------------------------
   */

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const session = await getSession();

    if (!session) {
      sessionStorage.setItem(
        "pending_persona_generation",
        JSON.stringify(formData)
      );

      window.location.href =
        "/auth?redirect=/persona";

      return;
    }

    await generatePersona(formData);
  };

  /*
   * =========================================================
   * USAGE LIMIT SCREEN
   * =========================================================
   */

  

function LockIcon() {
  return <span className="text-lg">🔒</span>;
}

function ShieldIcon() {
  return (
    <ShieldAlert
      size={18}
      className="mt-0.5 shrink-0 text-red-600"
    />
  );
}


  if (usageLimitReached) {
    const used = usageLimitInfo?.used ?? 2;
    const limit = usageLimitInfo?.limit ?? 2;

    return (
      <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 text-slate-950 sm:px-6">
        <JsonLd />

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-lg items-center justify-center">
          <div className="w-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <LockIcon />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                Free usage limit reached
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                You've used all your free persona generations.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
                You've used{" "}
                <span className="font-bold text-slate-900">{used}</span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">{limit}</span>{" "}
                free persona generations for this month.
              </p>
            </div>

            <div className="mt-7 overflow-hidden rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                  <Sparkles size={17} />
                </div>

                <div>
                  <p className="font-semibold text-slate-950">
                    Premium gives you more room to research.
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Keep generating personas and unlock deeper customer intelligence.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "20 persona generations per month",
                  "Detailed customer insights",
                  "Buying triggers and objections",
                  "Marketing channels and messaging",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-violet-600 shadow-sm">
                      <CheckCircle2 size={12} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUsageLimitReached(false);
                  setUsageLimitInfo(null);
                  setGenerationError(null);
                }}
                className="h-12 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              >
                Back
              </Button>

              <Button
                type="button"
                onClick={() => {
                  window.location.href = "/billing";
                }}
                className="h-12 rounded-xl bg-slate-950 text-white hover:bg-violet-600"
              >
                Upgrade to Premium
                <ArrowRight size={16} />
              </Button>
            </div>

            <p className="mt-5 text-center text-xs text-slate-400">
              Usage resets at the start of the next monthly usage period.
            </p>
          </div>
        </div>
      </main>
    );
  }


  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 text-slate-950 sm:px-6">
        <JsonLd />

        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl flex-col items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <Sparkles size={22} />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
            Generating your report
          </p>

          <h1 className="mt-3 text-center text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Building your customer picture
          </h1>

          <p className="mt-3 max-w-lg text-center text-sm leading-6 text-slate-500">
            Plavtora is turning your product context into a structured ICP and persona.
          </p>

          <div className="mt-9 w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <span>Analysis progress</span>
              <span>
                {Math.round(
                  ((stageIndex + 1) /
                    LOADING_STAGES.length) *
                    100
                )}
                %
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950 transition-all duration-700"
                style={{
                  width: `${
                    ((stageIndex + 1) /
                      LOADING_STAGES.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="mt-6 space-y-2">
              {LOADING_STAGES.map(
                (stage, index) => {
                  const completed =
                    index < stageIndex;
                  const active =
                    index === stageIndex;

                  return (
                    <div
                      key={stage}
                      className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition ${
                        active
                          ? "border-slate-900 bg-slate-950 text-white"
                          : completed
                            ? "border-emerald-100 bg-emerald-50"
                            : "border-slate-200 bg-white"
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          active
                            ? "bg-white/10 text-white"
                            : completed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          index + 1
                        )}
                      </div>

                      <span
                        className={`text-sm font-medium ${
                          active
                            ? "text-white"
                            : completed
                              ? "text-emerald-800"
                              : "text-slate-500"
                        }`}
                      >
                        {stage}
                      </span>

                      {active && (
                        <Loader2
                          size={15}
                          className="ml-auto animate-spin text-white/70"
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }


  if (result) {
    const personaName =
      result.persona?.name || "Your ideal customer";

    const hasPremiumData =
      Boolean(
        result.pain_points?.length ||
        result.goals?.length ||
        result.motivations?.length ||
        result.buying_triggers?.length ||
        result.buying_behaviour ||
        result.common_objections?.length ||
        result.marketing_channels?.length ||
        result.messaging_recommendations?.length ||
        result.content_ideas?.length
      );

    return (
      <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
        <JsonLd />

        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
            <Link
              href="/persona"
              className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
              New Persona
            </Link>

            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-8 w-8 rounded-lg"
            />

            <Link
              href="/dashboard"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
            >
              Dashboard
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles size={13} />
              Customer intelligence
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Here's who you're
              <span className="block text-slate-400">
                actually building for.
              </span>
            </h1>

            {result.error && (
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Part of this report may be incomplete:{" "}
                {result.error}
              </p>
            )}
          </div>

          <section className="mt-10 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-center">
              <div className="mx-auto lg:mx-0">
                <ConfidenceRing
                  score={
                    result.confidence_score
                  }
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Executive summary
                </p>

                <p className="mt-3 text-base leading-7 text-slate-600">
                  {result.executive_summary}
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                      {personaName}
                    </h2>

                    {result.persona?.age_range && (
                      <span className="text-sm text-slate-400">
                        {result.persona.age_range}
                      </span>
                    )}

                    {result.persona?.occupation && (
                      <span className="text-sm text-slate-500">
                        · {result.persona.occupation}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {result.persona?.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Ideal customer profile
            </p>

            <p className="mt-3 text-lg leading-8 text-slate-700">
              {result.ideal_customer_profile}
            </p>
          </section>

          {!hasPremiumData ? (
            <section className="mt-8 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                    <LockIcon />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                      Premium analysis
                    </p>

                    <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                      Go deeper than the basic ICP.
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Your free result gives you the core customer picture.
                      Premium unlocks the customer insights you can use for
                      product decisions, positioning, messaging, and acquisition.
                    </p>
                  </div>
                </div>

                <Link
                  href="/billing"
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
                >
                  Unlock Premium
                  <ArrowRight size={16} />
                </Link>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  [
                    "Pain points",
                    "Understand what actually blocks your ideal customer.",
                  ],
                  [
                    "Goals & motivations",
                    "See what your customer wants and why.",
                  ],
                  [
                    "Buying triggers",
                    "Identify moments that turn intent into action.",
                  ],
                  [
                    "Objections",
                    "Prepare for reasons prospects may hesitate.",
                  ],
                  [
                    "Marketing channels",
                    "Know where this audience is most likely to be reached.",
                  ],
                  [
                    "Messaging & content",
                    "Turn customer insight into sharper communication.",
                  ],
                ].map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white bg-white/70 p-5"
                  >
                    <p className="font-semibold text-slate-900">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <div className="mt-8 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <InsightCard
                  eyebrow="What holds them back"
                  title="Pain points"
                  items={result.pain_points}
                />

                <InsightCard
                  eyebrow="What they want"
                  title="Goals"
                  items={result.goals}
                />

                <InsightCard
                  eyebrow="What drives them"
                  title="Motivations"
                  items={result.motivations}
                />

                <InsightCard
                  eyebrow="What makes them act"
                  title="Buying triggers"
                  items={result.buying_triggers}
                />
              </div>

              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Buying behaviour
                </p>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {result.buying_behaviour}
                </p>
              </section>

              <InsightCard
                eyebrow="What to prepare for"
                title="Common objections"
                items={result.common_objections}
              />

              <div className="grid gap-5 md:grid-cols-2">
                <InsightCard
                  eyebrow="Where to find them"
                  title="Marketing channels"
                  items={result.marketing_channels}
                />

                <InsightCard
                  eyebrow="How to talk to them"
                  title="Messaging recommendations"
                  items={
                    result.messaging_recommendations
                  }
                />
              </div>

              <InsightCard
                eyebrow="What to publish"
                title="Content ideas"
                items={result.content_ideas}
              />
            </div>
          )}

          <section className="mt-8 rounded-[28px] bg-slate-950 p-7 text-white sm:p-9">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-violet-300">
                  <Target size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    Next decision
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  Now validate whether this customer picture is real.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                  Use the persona as a hypothesis. Compare it against real
                  interviews, user behavior, and demand before making major decisions.
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Continue with Plavtora
                <ArrowRight size={16} />
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <JsonLd />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-9 w-9 rounded-xl"
            />

            <div>
              <p className="text-[17px] font-bold tracking-tight text-slate-950">
                Plavtora
              </p>

              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Customer intelligence
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-100 blur-[120px]" />
        <div className="pointer-events-none absolute -left-40 bottom-[-220px] h-[500px] w-[500px] rounded-full bg-blue-100 blur-[130px]" />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles size={13} />
              Free to try
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Stop guessing
              <span className="block text-slate-400">
                who you're building for.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Describe your product and Plavtora will turn it into a structured
              customer hypothesis: who they are, what they want, and why they might buy.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
              <span>ICP hypothesis</span>
              <span>Persona profile</span>
              <span>Confidence score</span>
              <span>Premium customer intelligence</span>
            </div>
          </div>
        </div>
      </section>

      <div
        id="persona-form"
        className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14"
      >
        {generationError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            <ShieldIcon />
            <span>{generationError}</span>
          </div>
        )}

        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <Target size={18} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                3 inputs
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-950">
                Give the AI enough context to make a useful hypothesis.
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                More specific inputs generally produce a more useful persona.
                The output should still be validated with real customers.
              </p>
            </div>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Step 1
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              What are you building?
            </h2>

            <p className="mt-1.5 text-sm text-slate-500">
              Name the product or idea in plain language.
            </p>

            <div className="mt-5">
              <Input
                name="what_are_you_building"
                value={
                  formData.what_are_you_building
                }
                onChange={handleChange}
                placeholder="e.g. AI expense tracker"
                required
                className="h-13 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Step 2
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              Describe the product.
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-slate-500">
              Explain what it does, the problem it solves, and why someone would use it.
            </p>

            <div className="mt-5">
              <Textarea
                name="product_description"
                value={
                  formData.product_description
                }
                onChange={handleChange}
                placeholder="Describe the product, problem, target user, and what makes it useful."
                className="min-h-36 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
                required
              />
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                  Step 3 · Optional
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Add context.
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  Competitors, pricing, country, stage, unique features, existing customers,
                  or anything else that could sharpen the result.
                </p>
              </div>

              <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:block">
                Optional
              </span>
            </div>

            <div className="mt-5">
              <Textarea
                name="additional_details"
                value={
                  formData.additional_details
                }
                onChange={handleChange}
                placeholder="Anything else that might help..."
                className="min-h-28 resize-y rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:bg-white"
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-violet-300">
                  <Sparkles size={15} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                    Ready to generate
                  </span>
                </div>

                <h2 className="mt-3 text-2xl font-bold tracking-tight">
                  Build the customer hypothesis.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                  Plavtora will turn your inputs into an ICP, persona profile,
                  and customer confidence signal.
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="h-13 shrink-0 rounded-xl bg-white px-6 font-bold text-slate-950 hover:bg-slate-100"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate ICP
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>
            </div>
          </section>
        </form>
      </div>
/* ===========================================================
          SEO CONTENT — PART 1
          =========================================================== */

      <section className="mx-auto max-w-5xl px-6 py-24">

        <div className="space-y-16">

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              What is a User Persona?
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                A user persona is a fictional representation of your ideal customer
                created using customer research, market insights, and informed
                assumptions. Instead of thinking about your audience as a broad group,
                a persona gives your ideal customer a face, a profession, goals,
                frustrations, buying habits, and motivations.
              </p>

              <p>
                Imagine building a product without knowing exactly who will use it.
                Every feature becomes a guess. Every marketing campaign becomes an
                experiment. Every landing page speaks to everyone, which usually means
                it speaks to no one.
              </p>

              <p>
                That's why startups, SaaS companies, marketers, product managers, and
                growth teams invest time creating user personas before launching new
                products. A detailed persona allows teams to make better decisions
                throughout product development, marketing, pricing, onboarding, and
                customer acquisition.
              </p>

              <p>
                A high-quality user persona usually includes demographic information,
                occupation, goals, motivations, daily challenges, pain points, buying
                behaviour, communication preferences, preferred platforms, objections,
                and the factors that influence purchasing decisions.
              </p>

              <p>
                Rather than relying on assumptions, businesses use personas to
                understand exactly who they are serving and how they can create
                products that solve real problems.
              </p>

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Why User Personas Matter
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                According to multiple startup studies, one of the biggest reasons new
                businesses fail is a lack of market need. Teams spend months building
                products before understanding who actually needs them.
              </p>

              <p>
                A well-defined user persona reduces that risk by helping founders stay
                focused on solving problems for a specific audience instead of trying
                to build something for everyone.
              </p>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h3 className="text-xl font-semibold text-slate-950">
                  Better Product Decisions
                </h3>

                <p className="mt-4 text-slate-600">
                  Build features your target users actually need instead of adding
                  functionality based on assumptions.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h3 className="text-xl font-semibold text-slate-950">
                  Stronger Marketing
                </h3>

                <p className="mt-4 text-slate-600">
                  Write copy that directly addresses customer pain points,
                  motivations, and desired outcomes.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h3 className="text-xl font-semibold text-slate-950">
                  Higher Conversion Rates
                </h3>

                <p className="mt-4 text-slate-600">
                  Landing pages perform better when they communicate with a clearly
                  defined audience.
                </p>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">

                <h3 className="text-xl font-semibold text-slate-950">
                  Faster Customer Validation
                </h3>

                <p className="mt-4 text-slate-600">
                  Know exactly who to interview, where to find them, and which
                  questions to ask during customer discovery.
                </p>

              </div>

            </div>

            <div className="mt-10 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                User personas also help align entire teams. Designers create better
                user experiences, developers prioritize meaningful features,
                marketers build more relevant campaigns, and founders make more
                confident strategic decisions.
              </p>

              <p>
                Whether you're building your first MVP or scaling an established SaaS
                company, understanding your users is one of the highest-leverage
                activities you can invest in.
              </p>

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              AI User Persona Generator vs Manual Persona Creation
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                Traditionally, creating customer personas required interviewing users,
                collecting survey responses, organizing spreadsheets, analyzing
                behavioural data, and manually writing customer profiles. While this
                approach can produce excellent results, it is often time-consuming and
                difficult for early-stage founders who need quick direction.
              </p>

              <p>
                AI dramatically accelerates this process by transforming your product
                description into a structured customer profile within seconds. Instead
                of starting from a blank page, founders receive an actionable first
                draft that can later be refined using real customer interviews and
                market validation.
              </p>

            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200">

              <table className="w-full text-left">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="p-5 text-slate-950">
                      Manual Research
                    </th>

                    <th className="p-5 text-slate-950">
                      AI Persona Generator
                    </th>

                  </tr>

                </thead>

                <tbody className="text-slate-600">

                  <tr className="border-t border-slate-200">

                    <td className="p-5">
                      Several hours or days
                    </td>

                    <td className="p-5">
                      Usually under a minute
                    </td>

                  </tr>

                  <tr className="border-t border-slate-200">

                    <td className="p-5">
                      Starts from scratch
                    </td>

                    <td className="p-5">
                      Provides a structured first draft
                    </td>

                  </tr>

                  <tr className="border-t border-slate-200">

                    <td className="p-5">
                      Requires extensive research
                    </td>

                    <td className="p-5">
                      Works from your product description
                    </td>

                  </tr>

                  <tr className="border-t border-slate-200">

                    <td className="p-5">
                      Manual documentation
                    </td>

                    <td className="p-5">
                      Instant organized report
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

            <p className="mt-8 text-lg leading-8 text-slate-600">
              The most effective approach combines both methods: use AI to generate a
              detailed starting point, then validate and improve the persona through
              conversations with real customers. This saves time while keeping your
              understanding grounded in real-world feedback.
            </p>

          </section>

          {/* PART 2 */}

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              How Our AI User Persona Generator Works
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                Creating a high-quality customer persona traditionally required interviews,
                surveys, spreadsheets, competitor analysis, and weeks of customer
                research. While those methods are still valuable, they are often
                unrealistic for early-stage founders who need direction quickly.
              </p>

              <p>
                Plavtora's AI User Persona Generator simplifies this process by using
                artificial intelligence to transform a few inputs about your product into
                a structured persona. Instead of starting with a blank document, you
                receive a comprehensive profile that can immediately guide product,
                marketing, and validation decisions.
              </p>

              <p>
                The generated persona is designed to serve as a strategic starting point.
                As you interview real users and collect customer feedback, you can refine
                and improve the persona over time.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-4">

              {[
                [
                  "1",
                  "Describe Your Product",
                  "Tell the AI what you're building, the problem you're solving, and who you believe your customers are.",
                ],
                [
                  "2",
                  "AI Analysis",
                  "The AI analyzes your description, identifies customer patterns, and predicts motivations, behaviours, and pain points.",
                ],
                [
                  "3",
                  "Detailed Persona",
                  "Receive a structured user persona with goals, frustrations, buying behaviour, preferred channels, messaging, and recommendations.",
                ],
                [
                  "4",
                  "Validate & Improve",
                  "Compare the generated persona with real customer interviews and update it as your business grows.",
                ],
              ].map(
                ([number, title, description]) => (
                  <div
                    key={number}
                    className="rounded-2xl border border-slate-200 bg-white p-6"
                  >

                    <div className="text-4xl font-bold text-blue-400">
                      {number}
                    </div>

                    <h3 className="mt-4 text-xl font-semibold text-slate-950">
                      {title}
                    </h3>

                    <p className="mt-3 text-slate-600">
                      {description}
                    </p>

                  </div>
                )
              )}

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Who Should Use This AI User Persona Generator?
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                Understanding your audience is valuable regardless of your industry.
                This AI User Persona Generator is designed for individuals and teams
                who want to make smarter product and marketing decisions without
                spending weeks on manual research.
              </p>

            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              {[
                [
                  "Startup Founders",
                  "Validate ideas, understand early adopters, and prioritize the right features before building your MVP.",
                ],
                [
                  "SaaS Companies",
                  "Improve onboarding, feature prioritization, customer retention, and pricing by understanding your users.",
                ],
                [
                  "Marketing Teams",
                  "Create campaigns that resonate with your audience instead of relying on generic messaging.",
                ],
                [
                  "Agencies & Freelancers",
                  "Understand client audiences faster and produce more effective marketing strategies.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 p-6"
                >

                  <h3 className="text-xl font-semibold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-3 text-slate-600">
                    {description}
                  </p>

                </div>
              ))}

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Benefits of AI-Generated User Personas
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                AI cannot replace conversations with customers, but it can dramatically
                reduce the time needed to create a thoughtful first draft. Instead of
                spending hours brainstorming customer profiles, founders can begin with a
                structured persona and spend more time validating assumptions.
              </p>

            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">

              {[
                "Save hours of manual research",
                "Identify customer pain points quickly",
                "Improve product positioning",
                "Write better landing pages",
                "Build stronger marketing campaigns",
                "Validate startup ideas faster",
                "Understand customer motivations",
                "Make better business decisions",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 p-5"
                >
                  ✓ {item}
                </div>
              ))}

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Common Mistakes When Creating User Personas
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                A persona is only useful if it reflects reality. Many founders
                accidentally create personas based on assumptions instead of evidence,
                which can lead to poor product and marketing decisions.
              </p>

            </div>

            <div className="mt-10 space-y-6">

              {[
                [
                  "❌ Building for Everyone",
                  "Trying to target every possible customer usually results in a product that resonates with no specific audience.",
                ],
                [
                  "❌ Ignoring Customer Interviews",
                  "AI provides a starting point, but speaking with real users is essential for validation.",
                ],
                [
                  "❌ Never Updating Personas",
                  "Customer needs change over time. Revisit your personas regularly as your business evolves.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-red-100 bg-red-50 p-6"
                >

                  <h3 className="font-semibold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-3 text-slate-600">
                    {description}
                  </p>

                </div>
              ))}

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Example AI-Generated User Persona
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                To better understand what a complete customer persona looks like,
                here's an example generated for a fictional SaaS startup that helps
                marketing teams automate content creation. While every business is
                different, this illustrates the level of detail a strong persona should
                include.
              </p>

            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8">

              <div className="grid gap-8 md:grid-cols-2">

                <div>

                  <h3 className="text-2xl font-semibold text-slate-950">
                    Sarah Thompson
                  </h3>

                  <p className="mt-3 text-slate-600">
                    Marketing Manager at a B2B SaaS startup
                  </p>

                  <div className="mt-8 space-y-4">

                    <div>
                      <h4 className="font-semibold text-slate-950">
                        Age
                      </h4>
                      <p className="text-slate-600">
                        31 years old
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-950">
                        Location
                      </h4>
                      <p className="text-slate-600">
                        Austin, Texas
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-950">
                        Company Size
                      </h4>
                      <p className="text-slate-600">
                        20–50 employees
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-950">
                        Technical Skills
                      </h4>
                      <p className="text-slate-600">
                        Intermediate
                      </p>
                    </div>

                  </div>

                </div>

                <div>

                  <h3 className="text-2xl font-semibold text-slate-950">
                    Primary Goals
                  </h3>

                  <ul className="mt-5 space-y-3 text-slate-600">

                    <li>• Generate more qualified leads</li>
                    <li>• Improve marketing ROI</li>
                    <li>• Reduce manual work</li>
                    <li>• Scale content production</li>
                    <li>• Increase demo bookings</li>

                  </ul>

                  <h3 className="mt-10 text-2xl font-semibold text-slate-950">
                    Biggest Pain Points
                  </h3>

                  <ul className="mt-5 space-y-3 text-slate-600">

                    <li>• Small marketing budget</li>
                    <li>• Limited internal resources</li>
                    <li>• Pressure to hit growth targets</li>
                    <li>• Difficulty proving ROI</li>
                    <li>• Too many disconnected tools</li>

                  </ul>

                </div>

              </div>

              <div className="mt-12 grid gap-8 md:grid-cols-2">

                <div>

                  <h3 className="text-xl font-semibold text-slate-950">
                    Buying Behaviour
                  </h3>

                  <p className="mt-4 text-slate-600">
                    Sarah researches extensively before purchasing software. She
                    compares competitors, reads customer reviews, watches YouTube
                    demonstrations, and usually signs up for a free trial before
                    making a purchasing decision.
                  </p>

                </div>

                <div>

                  <h3 className="text-xl font-semibold text-slate-950">
                    Preferred Channels
                  </h3>

                  <p className="mt-4 text-slate-600">
                    LinkedIn, Reddit, Product Hunt, YouTube, newsletters, founder
                    communities, and Google Search.
                  </p>

                </div>

              </div>

              <div className="mt-10 rounded-2xl bg-slate-950 p-6">

                <h3 className="text-xl font-semibold text-slate-950">
                  Messaging That Resonates
                </h3>

                <p className="mt-4 text-slate-600 italic">
                  "Save time without sacrificing quality. Launch campaigns faster
                  while giving your team more time to focus on growth."
                </p>

              </div>

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              How to Validate Your AI-Generated Persona
            </h2>

            <div className="mt-8 space-y-6 text-lg leading-8 text-slate-600">

              <p>
                AI is excellent at generating structured customer profiles, but the
                most successful startups treat those profiles as hypotheses rather
                than facts. Validation is what transforms a useful draft into a
                reliable business asset.
              </p>

              <p>
                Start by interviewing people who closely resemble your target audience.
                Ask open-ended questions about their workflow, frustrations, goals,
                and decision-making process. Avoid leading questions that push
                customers toward the answers you expect.
              </p>

              <p>
                Compare those conversations with the AI-generated persona. Which
                assumptions were correct? Which behaviours were inaccurate? Which pain
                points appear repeatedly across multiple interviews? Update your
                persona as new evidence emerges.
              </p>

              <p>
                Validation should be an ongoing process rather than a one-time exercise.
                Markets change, competitors evolve, and customer priorities shift over
                time. Revisiting your personas regularly helps ensure your product and
                messaging stay relevant.
              </p>

            </div>

          </section>

          <section>

            <h2 className="text-4xl font-bold text-slate-950">
              Best Practices for Creating User Personas
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2">

              {[
                [
                  "Base Personas on Evidence",
                  "Use interviews, analytics, surveys, and customer conversations whenever possible.",
                ],
                [
                  "Focus on Behaviours",
                  "Goals, motivations, and frustrations usually matter more than age or demographics alone.",
                ],
                [
                  "Keep Personas Updated",
                  "Review your personas regularly as your audience and product evolve.",
                ],
                [
                  "Share Across Your Team",
                  "Product, design, engineering, marketing, and sales should all work from the same customer understanding.",
                ],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-xl border border-slate-200 p-6"
                >

                  <h3 className="font-semibold text-slate-950">
                    {title}
                  </h3>

                  <p className="mt-3 text-slate-600">
                    {description}
                  </p>

                </div>
              ))}

            </div>

          </section>

          <section className="mt-24 rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-10">

            <h2 className="text-3xl font-bold text-slate-950">
              Build Better Products with Plavtora
            </h2>

            <div className="mt-6 space-y-6 text-lg leading-8 text-slate-700">

              <p>
                A great user persona is only the beginning. Successful startups
                validate ideas, understand customer problems, and continuously improve
                their products before launch.
              </p>

              <p>
                Plavtora helps founders move beyond assumptions by providing AI-powered
                tools for customer understanding, product validation, and launch
                preparation. Whether you're building your first MVP or refining an
                existing product, combining AI insights with real customer feedback can
                help you make more confident decisions.
              </p>

            </div>

          </section>

          <section className="mt-24">

            <h2 className="text-4xl font-bold text-slate-950">
              Frequently Asked Questions
            </h2>

            <div className="mt-10 space-y-10">

              {[
                [
                  "What is a user persona?",
                  "A user persona is a fictional representation of your ideal customer based on research, assumptions, and customer insights. It helps businesses understand who they are building for, what problems customers face, and how products or services can better meet their needs.",
                ],
                [
                  "What is the difference between a user persona and a buyer persona?",
                  "A user persona focuses on the person who actually uses a product, while a buyer persona focuses on the individual responsible for making the purchasing decision. In many startups these may be the same person, but in larger organizations they are often different.",
                ],
                [
                  "How accurate are AI-generated user personas?",
                  "AI-generated personas provide an excellent starting point by identifying common patterns and likely customer characteristics. However, they should always be validated with real customer interviews, analytics, surveys, and user feedback before making major business decisions.",
                ],
                [
                  "Who should use an AI User Persona Generator?",
                  "Startup founders, SaaS companies, product managers, marketers, agencies, consultants, freelancers, entrepreneurs, and students can all benefit from creating structured customer personas before building products or launching marketing campaigns.",
                ],
                [
                  "Can I use this persona for my startup?",
                  "Yes. The generated persona is intended to help you understand your target audience more quickly. You should refine it as you gather customer feedback and validate assumptions during product development.",
                ],
                [
                  "Is Plavtora's AI User Persona Generator free?",
                  "Yes. You can generate detailed user personas without manually creating lengthy customer profiles from scratch.",
                ],
                [
                  "Why are user personas important for startups?",
                  "User personas help founders prioritize features, improve messaging, identify customer pain points, validate ideas, and reduce the risk of building products that don't solve real problems.",
                ],
                [
                  "Can I edit my generated persona later?",
                  "Absolutely. Your persona should evolve as you conduct customer interviews, analyze user behavior, and learn more about your target audience.",
                ],
                [
                  "What information should a good user persona include?",
                  "A strong persona typically includes demographics, goals, motivations, frustrations, daily challenges, buying behavior, preferred communication channels, objections, and decision-making factors.",
                ],
                [
                  "How often should I update my user personas?",
                  "Review your personas whenever your market changes, your product evolves, or you gather significant customer feedback. Many startups revisit them every few months to ensure they still reflect real users.",
                ],
                [
                  "Does this tool replace customer interviews?",
                  "No. AI accelerates the persona creation process, but direct conversations with customers remain one of the best ways to validate assumptions and understand real-world behavior.",
                ],
                [
                  "How can user personas improve marketing?",
                  "Personas help marketers create more relevant messaging, choose the right acquisition channels, write stronger landing pages, and produce content that speaks directly to customer needs.",
                ],
              ].map(([question, answer]) => (
                <div key={question}>

                  <h3 className="text-2xl font-semibold text-slate-950">
                    {question}
                  </h3>

                  <p className="mt-3 text-lg leading-8 text-slate-600">
                    {answer}
                  </p>

                </div>
              ))}

            </div>

          </section>

        </div>

      </section>

    </main>
  );
}