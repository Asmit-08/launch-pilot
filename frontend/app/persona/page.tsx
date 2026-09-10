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
  Target,
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

const FAQS = [
  {
    question: "What is a user persona?",
    answer:
      "A user persona is a structured representation of a target customer based on research, evidence, and informed assumptions. It describes characteristics such as goals, problems, motivations, behaviours, needs, and buying considerations so a team can make decisions around a specific type of customer.",
  },
  {
    question: "What is an AI user persona generator?",
    answer:
      "An AI user persona generator uses artificial intelligence to turn information about a product, service, or startup into a structured customer persona. Plavtora generates an initial customer hypothesis that can include an ideal customer profile, persona description, pain points, goals, motivations, buying triggers, objections, channels, messaging, and content ideas depending on the plan.",
  },
  {
    question: "What is the difference between a user persona and an ICP?",
    answer:
      "An ideal customer profile, or ICP, describes the type of customer or organization that is the best fit for a product. A user persona describes a representative person within that target audience, including their goals, problems, motivations, behaviour, and decision-making context. For B2B products, an ICP and user persona are often used together.",
  },
  {
    question: "What is the difference between a user persona and a buyer persona?",
    answer:
      "A user persona focuses on the person who uses a product, while a buyer persona focuses on the person involved in purchasing it. They can be the same person, but in B2B products the user, decision-maker, and economic buyer may be different people.",
  },
  {
    question: "How does Plavtora's AI User Persona Generator work?",
    answer:
      "You describe what you are building, explain the product and problem it solves, and optionally provide additional context such as competitors, pricing, market, location, or existing customers. Plavtora turns those inputs into a structured ICP and customer persona hypothesis.",
  },
  {
    question: "How accurate are AI-generated user personas?",
    answer:
      "An AI-generated persona should be treated as a hypothesis rather than verified customer research. Its usefulness depends on the quality and specificity of the information provided. Validate important assumptions with customer interviews, user behaviour, analytics, surveys, and actual demand before making major decisions.",
  },
  {
    question: "Can I use an AI-generated persona for my startup?",
    answer:
      "Yes. An AI-generated persona can be useful as a starting point for customer discovery, product positioning, messaging, content planning, and validation. It should become more evidence-based as you learn from real customers.",
  },
  {
    question: "Is Plavtora's AI User Persona Generator free?",
    answer:
      "Plavtora lets users try the persona generator with limited free usage. The Free plan includes up to 2 persona generations per month. Premium provides up to 20 persona generations per month and unlocks deeper customer intelligence such as pain points, motivations, buying triggers, objections, marketing channels, messaging recommendations, and content ideas.",
  },
  {
    question: "What information should I provide to generate a good persona?",
    answer:
      "Start with a clear description of what you are building, the problem it solves, who you believe needs it, and why they might choose it. Additional context such as pricing, competitors, geography, product stage, existing customers, and unique features can make the resulting hypothesis more useful.",
  },
  {
    question: "Does an AI persona generator replace customer interviews?",
    answer:
      "No. AI can help structure assumptions quickly, but it does not replace direct customer research. Interviews, observations, analytics, surveys, and real product behaviour are important for determining whether the generated persona reflects reality.",
  },
  {
    question: "How can user personas improve marketing?",
    answer:
      "A clear persona can help marketers choose more relevant messaging, address specific customer problems, identify potential acquisition channels, create more targeted content, and improve landing-page communication. The persona should be updated when new evidence changes the understanding of the customer.",
  },
  {
    question: "How often should I update a user persona?",
    answer:
      "Update a persona whenever meaningful customer evidence changes your understanding of the audience. That can happen after customer interviews, product changes, new market evidence, major positioning changes, or changes in customer behaviour.",
  },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-blue-500">
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

        <CardTitle className="text-lg font-semibold text-slate-950">
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2 text-slate-600">
          {items?.map((item, i) => (
            <li key={i} className="flex gap-2 leading-relaxed">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-blue-500" />
              <span>{item}</span>
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
    <div
      className="relative flex h-32 w-32 items-center justify-center"
      aria-label={`Persona confidence score: ${clamped}%`}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-32 w-32 -rotate-90"
        aria-hidden="true"
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
            transition: "stroke-dashoffset 0.8s ease",
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

export default function PersonaPage() {
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const [result, setResult] =
    useState<PersonaResult | null>(null);

  const [generationError, setGenerationError] =
    useState<string | null>(null);

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

      const session = await getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

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
                You&apos;ve used all your free persona generations.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
                You&apos;ve used{" "}
                <span className="font-bold text-slate-900">
                  {used}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900">
                  {limit}
                </span>{" "}
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
      result.persona?.name ||
      "Your ideal customer";

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
              alt="Plavtora AI customer intelligence"
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
              Here&apos;s who you&apos;re
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

            <h2 className="sr-only">
              Ideal customer profile generated by Plavtora
            </h2>

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
                      Premium unlocks deeper customer intelligence for product
                      decisions, positioning, messaging, and acquisition.
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
                    "Understand what blocks your ideal customer.",
                  ],
                  [
                    "Goals & motivations",
                    "See what the customer wants and why.",
                  ],
                  [
                    "Buying triggers",
                    "Identify situations that can turn intent into action.",
                  ],
                  [
                    "Objections",
                    "Prepare for reasons prospects may hesitate.",
                  ],
                  [
                    "Marketing channels",
                    "Identify potential places to reach the audience.",
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

                <h2 className="sr-only">
                  Customer buying behaviour
                </h2>

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

                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                  Use the persona as a hypothesis. Compare it against real
                  interviews, user behaviour, analytics, and demand before
                  making major decisions.
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
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-violet-100 blur-[120px]"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -left-40 bottom-[-220px] h-[500px] w-[500px] rounded-full bg-blue-100 blur-[130px]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-6 sm:py-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
              <Sparkles size={13} />
              Free AI user persona generator
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              AI User Persona Generator
              <span className="block text-slate-400">
                for your startup, SaaS, or business.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
              Generate a structured ideal customer profile and user persona
              from your product idea. Understand who you may be building for,
              what they may need, and which customer assumptions deserve
              validation.
            </p>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span>AI customer persona</span>
              <span>ICP generation</span>
              <span>Customer goals</span>
              <span>Pain points</span>
              <span>Buying behaviour</span>
              <span>Customer motivations</span>
            </div>

            <div className="mt-8 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">
                <strong className="text-slate-950">
                  What does an AI user persona generator do?
                </strong>{" "}
                It converts product context into a structured customer
                hypothesis covering the people or businesses most likely to
                need the product. Plavtora then turns that hypothesis into
                customer intelligence you can use for product, positioning,
                marketing, and validation decisions.
              </p>
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
                Give the AI enough context to create a useful customer hypothesis.
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Specific product context generally produces a more useful
                starting point. Validate important assumptions with real
                customers afterward.
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
              Name the product, service, or startup idea in plain language.
            </p>

            <div className="mt-5">
              <label
                htmlFor="what_are_you_building"
                className="sr-only"
              >
                What are you building?
              </label>

              <Input
                id="what_are_you_building"
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
              Explain what it does, the problem it solves, and why someone
              would use it.
            </p>

            <div className="mt-5">
              <label
                htmlFor="product_description"
                className="sr-only"
              >
                Product description
              </label>

              <Textarea
                id="product_description"
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
                  Competitors, pricing, country, stage, unique features,
                  existing customers, or anything else that could sharpen the result.
                </p>
              </div>

              <span className="hidden rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:block">
                Optional
              </span>
            </div>

            <div className="mt-5">
              <label
                htmlFor="additional_details"
                className="sr-only"
              >
                Additional product context
              </label>

              <Textarea
                id="additional_details"
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
                  Build your customer hypothesis.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/60">
                  Plavtora will turn your inputs into an ideal customer profile,
                  persona profile, and confidence signal.
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

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              User persona guide
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              What is a user persona?
            </h2>

            <div className="mt-7 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                A user persona is a structured representation of a target
                customer. It describes the customer&apos;s likely goals,
                problems, motivations, behaviours, needs, and decision-making
                context.
              </p>

              <p>
                Personas help teams move from a vague audience such as
                &quot;small businesses&quot; or &quot;people who need
                productivity software&quot; toward a more specific customer
                hypothesis that can guide product and marketing decisions.
              </p>

              <p>
                A persona is not automatically a fact about your market.
                A strong persona combines evidence with assumptions and should
                become more accurate as you collect interviews, analytics,
                customer feedback, and behavioural data.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              ICP + persona
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              User persona vs ideal customer profile
            </h2>

            <div className="mt-7 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                An ideal customer profile describes the type of customer that
                is the strongest fit for a product. In B2B, this may include
                company characteristics, industry, size, use case, budget,
                or other qualification criteria.
              </p>

              <p>
                A user persona goes one level deeper into the person using,
                evaluating, influencing, or buying the product. It can describe
                their goals, frustrations, motivations, workflow, objections,
                and purchasing behaviour.
              </p>

              <p>
                Using both together gives founders a clearer customer model:
                <strong className="text-slate-950">
                  {" "}
                  which customers to pursue and what matters to the people
                  inside those customers.
                </strong>
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-5 text-sm font-semibold text-slate-950">
                      ICP
                    </th>

                    <th className="p-5 text-sm font-semibold text-slate-950">
                      User Persona
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-slate-600">
                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Defines the best-fit customer
                    </td>

                    <td className="p-5">
                      Defines a representative person
                    </td>
                  </tr>

                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Often focuses on customer or company characteristics
                    </td>

                    <td className="p-5">
                      Focuses on goals, problems, motivations, and behaviour
                    </td>
                  </tr>

                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Helps decide who to target
                    </td>

                    <td className="p-5">
                      Helps decide how to serve and communicate with them
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            What should a good user persona include?
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            A useful persona focuses on information that can influence product,
            positioning, marketing, sales, or customer experience decisions.
            The exact fields depend on the product and market.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [
                "Customer profile",
                "Relevant role, occupation, company context, experience level, or other characteristics.",
              ],
              [
                "Goals",
                "The outcomes the customer is trying to achieve.",
              ],
              [
                "Pain points",
                "Problems, frustrations, constraints, or recurring obstacles.",
              ],
              [
                "Motivations",
                "Reasons the customer may care enough to change their current behaviour.",
              ],
              [
                "Buying triggers",
                "Events or circumstances that can increase purchase intent.",
              ],
              [
                "Buying behaviour",
                "How the customer evaluates alternatives and makes decisions.",
              ],
              [
                "Objections",
                "Reasons the customer may hesitate, delay, or reject a solution.",
              ],
              [
                "Channels",
                "Places where the audience may discover information, products, or communities.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              AI-assisted research
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              AI user persona generator vs manual persona research
            </h2>

            <div className="mt-7 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                Traditional persona research can involve customer interviews,
                surveys, analytics, market research, competitor research, and
                manual documentation. Those methods remain valuable because
                they provide evidence from the market.
              </p>

              <p>
                An AI persona generator addresses a different part of the
                problem: creating a structured starting hypothesis quickly.
                Instead of beginning with an empty document, a founder can
                turn product context into a draft customer model and then
                investigate which assumptions are actually true.
              </p>

              <p>
                The strongest workflow is not AI instead of customer research.
                It is AI for structuring hypotheses followed by real-world
                validation.
              </p>
            </div>

            <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-5 text-sm font-semibold text-slate-950">
                      Manual research
                    </th>

                    <th className="p-5 text-sm font-semibold text-slate-950">
                      AI-assisted persona
                    </th>
                  </tr>
                </thead>

                <tbody className="text-sm text-slate-600">
                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Starts with interviews, research, and raw information
                    </td>

                    <td className="p-5">
                      Starts with structured product context
                    </td>
                  </tr>

                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Requires manual synthesis
                    </td>

                    <td className="p-5">
                      Produces a structured first hypothesis
                    </td>
                  </tr>

                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Strong source of real customer evidence
                    </td>

                    <td className="p-5">
                      Useful for organizing assumptions and possible patterns
                    </td>
                  </tr>

                  <tr className="border-t border-slate-200">
                    <td className="p-5">
                      Essential for validation
                    </td>

                    <td className="p-5">
                      Should be validated against real-world evidence
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            How Plavtora&apos;s AI User Persona Generator works
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Plavtora turns a small amount of product context into a structured
            customer hypothesis that can support customer discovery and
            startup decision-making.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {[
              [
                "1",
                "Describe your product",
                "Explain what you are building, the problem it solves, and the customer you believe may need it.",
              ],
              [
                "2",
                "Provide context",
                "Add competitors, pricing, geography, product stage, existing customers, or other relevant information.",
              ],
              [
                "3",
                "Generate the ICP",
                "Plavtora creates a structured ideal customer profile and persona hypothesis.",
              ],
              [
                "4",
                "Validate the hypothesis",
                "Compare the result with interviews, behaviour, analytics, and actual demand.",
              ],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="text-4xl font-bold text-blue-400">
                  {number}
                </div>

                <h3 className="mt-4 text-lg font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Who can use an AI customer persona generator?
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            Customer personas can support different types of product and
            marketing decisions. Plavtora is particularly useful when you need
            a structured starting point before deeper validation.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [
                "Startup founders",
                "Create an initial customer hypothesis before building, launching, or changing a product.",
              ],
              [
                "SaaS teams",
                "Clarify target users, customer problems, onboarding needs, positioning, and messaging.",
              ],
              [
                "Product teams",
                "Connect feature and experience decisions to specific customer needs.",
              ],
              [
                "Marketing teams",
                "Develop audience-specific messaging, content directions, and acquisition hypotheses.",
              ],
              [
                "Agencies and consultants",
                "Create a structured customer starting point for a new client or project.",
              ],
              [
                "Solo builders",
                "Move from a product idea to a clearer understanding of the customer it is intended to serve.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            What can you do with a customer persona?
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [
                "Improve product decisions",
                "Use customer goals and problems as inputs when deciding which problems and features deserve attention.",
              ],
              [
                "Improve positioning",
                "Connect your product to a specific customer problem instead of describing features without context.",
              ],
              [
                "Write clearer landing pages",
                "Address the customer&apos;s likely problems, desired outcomes, objections, and reasons to act.",
              ],
              [
                "Plan content",
                "Turn customer questions, problems, and motivations into potential content themes.",
              ],
              [
                "Prepare customer interviews",
                "Use the persona as a list of assumptions to investigate rather than answers to defend.",
              ],
              [
                "Identify acquisition hypotheses",
                "Explore where a target audience may spend time and what messages could attract their attention.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Common mistakes when creating user personas
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-600">
              The quality of a persona depends less on how polished the
              document looks and more on whether it helps you understand
              customer reality.
            </p>
          </div>

          <div className="mt-10 space-y-5">
            {[
              [
                "Targeting everyone",
                "A broad audience definition makes it difficult to decide which customer problem, message, or channel deserves priority.",
              ],
              [
                "Treating assumptions as facts",
                "A persona built from assumptions should remain a hypothesis until customer evidence supports it.",
              ],
              [
                "Over-focusing on demographics",
                "Age and location can be useful, but goals, behaviour, problems, motivations, and buying context often provide more actionable information.",
              ],
              [
                "Ignoring customer interviews",
                "Generated personas can suggest useful questions, but real customers are needed to test important assumptions.",
              ],
              [
                "Never updating the persona",
                "Customer needs, markets, products, and competitive conditions change. Your customer model should change when the evidence changes.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-amber-100 bg-amber-50 p-6"
              >
                <h3 className="font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            How to validate an AI-generated user persona
          </h2>

          <div className="mt-7 max-w-4xl space-y-5 text-lg leading-8 text-slate-600">
            <p>
              The most important step after generating a persona is validation.
              Treat the output as a hypothesis about your customer rather than
              a verified description of the market.
            </p>

            <p>
              Start with customer interviews. Ask people about their existing
              workflow, problems, goals, alternatives, constraints, and how
              they currently solve the problem. Open-ended questions are more
              useful than questions designed to confirm your preferred answer.
            </p>

            <p>
              Compare the interview evidence with the persona. Identify which
              assumptions repeat across customers and which assumptions do not.
              Pay particular attention to whether the problem is important
              enough for customers to change behaviour or spend money.
            </p>

            <p>
              Continue updating the customer model as you collect evidence.
              A persona becomes more useful when it reflects what customers
              actually do rather than what the founder hopes they will do.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              [
                "Interview",
                "Talk to people who resemble the target customer.",
              ],
              [
                "Compare",
                "Test persona assumptions against what customers actually say and do.",
              ],
              [
                "Update",
                "Replace weak assumptions with stronger evidence as you learn.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <h3 className="font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Example of a customer persona
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
            The following is a fictional example showing how customer
            information can be structured. It is not research about a real
            person or a claim about a specific market.
          </p>

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                  Fictional example
                </p>

                <h3 className="mt-3 text-2xl font-semibold text-slate-950">
                  B2B SaaS Marketing Manager
                </h3>

                <p className="mt-3 text-slate-600">
                  A marketing manager at a growing software company who needs
                  to produce more content and campaigns without expanding the
                  team at the same rate.
                </p>

                <div className="mt-8 space-y-5">
                  <div>
                    <h4 className="font-semibold text-slate-950">
                      Goals
                    </h4>

                    <p className="mt-2 text-slate-600">
                      Increase qualified leads, improve marketing efficiency,
                      produce more useful content, and demonstrate measurable
                      marketing impact.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-950">
                      Pain points
                    </h4>

                    <p className="mt-2 text-slate-600">
                      Limited resources, pressure to grow, disconnected tools,
                      repetitive work, and difficulty proving which activities
                      create results.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-950">
                    Buying behaviour
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">
                    This fictional customer may compare several alternatives,
                    read reviews, examine product demonstrations, evaluate
                    implementation effort, and look for evidence that the
                    product can solve a specific workflow problem.
                  </p>
                </div>

                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-slate-950">
                    Possible objections
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">
                    The customer may question whether the product is worth the
                    cost, whether it fits the existing workflow, whether the
                    output is reliable, and whether implementation creates
                    additional work.
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-slate-950 p-6">
                  <h3 className="text-xl font-semibold text-white">
                    Example messaging
                  </h3>

                  <p className="mt-4 italic leading-7 text-white/70">
                    &quot;Reduce repetitive marketing work while giving your
                    team more time to focus on strategy and growth.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Best practices for creating useful user personas
          </h2>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              [
                "Start with the problem",
                "Understand what the customer is trying to accomplish and what prevents them from doing it.",
              ],
              [
                "Focus on behaviour",
                "Look at what customers actually do, not only demographic characteristics.",
              ],
              [
                "Separate evidence from assumptions",
                "Mark hypotheses clearly and test the assumptions that matter most to your business.",
              ],
              [
                "Use customer language",
                "Record the words customers use to describe their problems, desired outcomes, and objections.",
              ],
              [
                "Connect personas to decisions",
                "Use the customer model to influence product, positioning, messaging, and acquisition choices.",
              ],
              [
                "Keep the persona current",
                "Update it when customer research or product evidence changes your understanding.",
              ],
            ].map(([title, description]) => (
              <div
                key={title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <h3 className="font-semibold text-slate-950">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
            Beyond personas
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Customer understanding is only one part of startup decision-making.
          </h2>

          <div className="mt-7 max-w-4xl space-y-5 text-lg leading-8 text-slate-700">
            <p>
              A persona can help answer who you may be building for. It does
              not independently prove that the customer has the problem, wants
              your solution, or will pay for it.
            </p>

            <p>
              That is why Plavtora is broader than a persona generator. It is
              designed as an AI decision system for founders, with customer
              understanding, product analysis, validation, positioning, and
              other decision-oriented systems working together as the product
              develops.
            </p>

            <p>
              Use this persona as one input into the larger process: identify
              the customer, test the problem, examine the evidence, make the
              next decision, and repeat.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
            >
              Explore Plavtora
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/landing_page_analyzer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Analyze a landing page
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Frequently Asked Questions
          </h2>

          <div className="mt-10 space-y-10">
            {FAQS.map(({ question, answer }) => (
              <div
                key={question}
                className="border-b border-slate-200 pb-8 last:border-0"
              >
                <h3 className="text-xl font-semibold text-slate-950 sm:text-2xl">
                  {question}
                </h3>

                <p className="mt-3 max-w-4xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  {answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center sm:py-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
            Start with your customer
          </p>

          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
            Turn your product idea into a customer hypothesis.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60">
            Generate an AI-powered ICP and user persona, then validate the
            assumptions against real customers.
          </p>

          <a
            href="#persona-form"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
          >
            Generate your persona
            <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}