"use client";

import { useEffect, useState } from "react";
import { getSession } from "@/services/session";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import JsonLd from "./components/JsonLd";



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

const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
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
            <li key={i} className="flex gap-2 leading-relaxed">
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
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative flex h-32 w-32 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="6"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-white">{clamped}%</span>
        <span className="text-[10px] uppercase tracking-wide text-zinc-500">
          confidence
        </span>
      </div>
    </div>
  );
}

export default function PersonaPage() {
  const [loading, setLoading] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [result, setResult] = useState<PersonaResult | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    what_are_you_building: "",
    product_description: "",
    additional_details: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const generatePersona = async (data: typeof formData) => {
    if (loading) return;

    setLoading(true);
    setResult(null);
    setGenerationError(null);
    setStageIndex(0);

    const stageTimers = LOADING_STAGES.map((_, i) =>
      window.setTimeout(
        () => setStageIndex(i),
        i * 1400
      )
    );

    try {
      const payload = {
        ...data,
        additional_details: data.additional_details || null,
      };

      const session = await getSession();

      if (!session) {
        throw new Error("Not authenticated");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

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

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData?.detail || "Failed to generate persona."
        );
      }

      setResult(responseData);
    } catch (error) {
      console.error("Persona generation failed:", error);

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
      const pending = sessionStorage.getItem(
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
        const savedFormData = JSON.parse(pending);

        setFormData(savedFormData);
        sessionStorage.removeItem("pending_persona_generation");

        await generatePersona(savedFormData);
      } catch (error) {
        console.error(
          "Failed to resume persona generation:",
          error
        );

        sessionStorage.removeItem("pending_persona_generation");
      }
    }

    resumePendingGeneration();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const session = await getSession();

    if (!session) {
      sessionStorage.setItem(
        "pending_persona_generation",
        JSON.stringify(formData)
      );

      window.location.href = "/auth?redirect=/persona";
      return;
    }

    await generatePersona(formData);
  };

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
        <JsonLd />

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-blue-600/[0.09] blur-[160px]" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-violet-600/[0.07] blur-[150px]" />
          <div className="absolute left-[-140px] top-1/2 h-[420px] w-[420px] rounded-full bg-cyan-500/[0.05] blur-[140px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px]" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-16">
          <div className="relative flex h-28 w-28 items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-blue-400/10" />
            <div className="absolute inset-2 rounded-full border border-white/[0.05]" />
            <div className="absolute inset-0 animate-[personaOrbit_2.8s_linear_infinite] rounded-full border border-transparent border-t-blue-400/90 border-r-violet-400/30" />

            <div className="absolute h-12 w-12 animate-pulse rounded-full bg-blue-500/[0.08] blur-xl" />

            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_40px_rgba(59,130,246,0.12)]">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-300" />
            </div>
          </div>

          <Eyebrow>Generating your report</Eyebrow>

          <h1 className="mt-4 text-center text-3xl font-semibold tracking-[-0.03em] text-zinc-100 sm:text-4xl">
            Building your customer picture
          </h1>

          <p className="mt-4 max-w-xl text-center text-sm leading-6 text-zinc-500">
            Plavtora is turning your product context into a structured ICP
            and persona. This can take a few moments.
          </p>

          <div className="mt-10 w-full max-w-xl">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-zinc-600">
              <span>Analysis progress</span>
              <span>
                {Math.round(
                  ((stageIndex + 1) / LOADING_STAGES.length) * 100
                )}
                %
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400"
                style={{
                  width: `${((stageIndex + 1) / LOADING_STAGES.length) * 100}%`,
                  transition: "width 0.7s ease",
                }}
              />
            </div>
          </div>

          <div className="mt-8 w-full max-w-xl space-y-2">
            {LOADING_STAGES.map((stage, index) => {
              const completed = index < stageIndex;
              const active = index === stageIndex;

              return (
                <div
                  key={stage}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-500 ${
                    active
                      ? "border-blue-400/20 bg-blue-400/[0.07]"
                      : completed
                        ? "border-white/[0.06] bg-white/[0.025]"
                        : "border-white/[0.04] bg-transparent opacity-40"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs ${
                      completed
                        ? "bg-emerald-400/10 text-emerald-300"
                        : active
                          ? "bg-blue-400/10 text-blue-300"
                          : "bg-white/[0.04] text-zinc-600"
                    }`}
                  >
                    {completed ? (
                      "✓"
                    ) : active ? (
                      <span className="h-2 w-2 animate-pulse rounded-full bg-blue-300" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        active
                          ? "text-zinc-100"
                          : "text-zinc-400"
                      }`}
                    >
                      {stage}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <style jsx>{`
          @keyframes personaOrbit {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (result) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <Eyebrow>Your persona report</Eyebrow>
          <h1 className="mt-3 text-4xl font-bold text-zinc-100">
            Here&apos;s who your customers are
          </h1>

          {result.error && (
            <p className="mt-4 text-sm text-red-400">
              Part of this report may be incomplete: {result.error}
            </p>
          )}

          <div className="mt-10 space-y-14">
            {/* Summary + persona + confidence, elevated as the top-level report header */}
            <Card style={cardStyle} className="rounded-2xl">
              <CardContent className="flex flex-col items-center gap-8 py-8 sm:flex-row sm:items-start">
                <ConfidenceRing score={result.confidence_score} />
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div>
                    <Eyebrow>Executive summary</Eyebrow>
                    <p className="mt-2 text-zinc-300">
                      {result.executive_summary}
                    </p>
                  </div>
                  <div className="border-t border-zinc-800/60 pt-4">
                    <Eyebrow>Persona</Eyebrow>
                    <p className="mt-2 font-semibold text-zinc-100">
                      {result.persona?.name}
                      {result.persona?.age_range
                        ? ` · ${result.persona.age_range}`
                        : ""}
                      {result.persona?.occupation
                        ? ` · ${result.persona.occupation}`
                        : ""}
                    </p>
                    <p className="mt-1 text-zinc-400">
                      {result.persona?.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div>
              <Eyebrow>Ideal customer profile</Eyebrow>
              <p className="mt-3 text-lg leading-relaxed text-zinc-300">
                {result.ideal_customer_profile}
              </p>
            </div>

            {/* Premium analysis gate */}
            {(
              !result.pain_points?.length &&
              !result.goals?.length &&
              !result.motivations?.length &&
              !result.buying_triggers?.length &&
              !result.buying_behaviour &&
              !result.common_objections?.length &&
              !result.marketing_channels?.length &&
              !result.messaging_recommendations?.length &&
              !result.content_ideas?.length
            ) ? (
              <section
                className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/[0.08] via-white/[0.03] to-white/[0.02] p-6 sm:p-8"
              >
                <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10 text-lg">
                          🔒
                        </div>
                        <div>
                          <Eyebrow>Premium analysis</Eyebrow>
                          <h2 className="mt-1 text-2xl font-bold text-zinc-100">
                            Go deeper than the basic ICP
                          </h2>
                        </div>
                      </div>

                      <p className="mt-4 max-w-2xl text-zinc-400 leading-relaxed">
                        Your free ICP gives you the core customer picture. Premium
                        unlocks the deeper analysis you can use to shape your product,
                        positioning, messaging, and acquisition strategy.
                      </p>
                    </div>

                    <span className="w-fit shrink-0 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-300">
                      Premium
                    </span>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      ["Pain Points", "Understand what actually blocks your ideal customer."],
                      ["Goals & Motivations", "See what your customer is trying to achieve and why."],
                      ["Buying Triggers", "Identify the moments that can turn intent into action."],
                      ["Objections", "Prepare for the reasons prospects may hesitate."],
                      ["Marketing Channels", "Know where your ideal customers are most likely to be reached."],
                      ["Messaging & Content", "Turn customer insights into sharper messaging and content ideas."],
                    ].map(([title, description]) => (
                      <div
                        key={title}
                        className="rounded-2xl border border-white/10 bg-black/20 p-5 transition-colors hover:border-blue-500/20"
                      >
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 text-sm text-blue-400">🔒</span>
                          <div>
                            <h3 className="font-semibold text-zinc-200">{title}</h3>
                            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                              {description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-blue-500/15 bg-blue-500/[0.06] p-5 sm:flex-row sm:p-6">
                    <div>
                      <p className="font-semibold text-zinc-100">
                        Ready for the full customer analysis?
                      </p>
                      <p className="mt-1 text-sm text-zinc-500">
                        Unlock the strategic insights behind this persona.
                      </p>
                    </div>

                    <Button
                      asChild
                      size="lg"
                      className="h-11 w-full shrink-0 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500 sm:w-auto"
                    >
                      <Link href="/dashboard">
                        Unlock Premium Analysis →
                      </Link>
                    </Button>
                  </div>
                </div>
              </section>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InsightCard
                    eyebrow="What holds them back"
                    title="Pain points"
                    items={result.pain_points}
                  />
                  <InsightCard eyebrow="What they want" title="Goals" items={result.goals} />
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

                <div>
                  <Eyebrow>Buying behaviour</Eyebrow>
                  <p className="mt-3 text-zinc-300">{result.buying_behaviour}</p>
                </div>

                <InsightCard
                  eyebrow="What to prepare for"
                  title="Common objections"
                  items={result.common_objections}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <InsightCard
                    eyebrow="Where to find them"
                    title="Marketing channels"
                    items={result.marketing_channels}
                  />
                  <InsightCard
                    eyebrow="How to talk to them"
                    title="Messaging recommendations"
                    items={result.messaging_recommendations}
                  />
                </div>

                <InsightCard
                  eyebrow="What to publish"
                  title="Content ideas"
                  items={result.content_ideas}
                />
              </>
            )}
          </div>

          {/* Soft, natural next-step — not a redirect, not an ad */}
          <div
            className="mt-20 rounded-2xl p-8 text-center sm:text-left"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(255,255,255,0.02))",
              border: "1px solid rgba(59,130,246,0.15)",
            }}
          >
            <Eyebrow>Next step</Eyebrow>
            <p className="mt-3 text-xl font-semibold text-zinc-100">
              You now know who your customers are.
            </p>
            <p className="mt-2 max-w-xl text-zinc-400">
              The next step is validating whether they&apos;ll actually buy.
              Plavtora helps founders validate ideas, identify launch
              risks, and prepare products before launch.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500"
            >
              <Link href="/dashboard">Continue with Plavtora →</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 pb-16 pt-24 text-center"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% -10%, rgba(59,130,246,0.18), transparent 60%)",
        }}
      >
        <Eyebrow>Free to try · Sign up to generate</Eyebrow>
        <h1 className="mx-auto mt-4 max-w-2xl text-5xl font-bold leading-tight text-zinc-100">
          Generate Detailed <span className="text-blue-500">AI User Personas</span> in Seconds
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
        Generate detailed AI user personas for your startup,
        SaaS, or business. Discover your ideal customers,
        their goals, pain points, motivations, buying behavior,
        and marketing opportunities in seconds.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-500"
        >
          <a href="#persona-form">Generate ICP</a>
        </Button>
      </div>

      {/* Form */}
      <div id="persona-form" className="mx-auto max-w-2xl px-6 pb-24">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card style={cardStyle} className="rounded-2xl">
            <CardHeader>
              <Eyebrow>Step 1</Eyebrow>
              <CardTitle className="text-zinc-100">
                What are you building?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                name="what_are_you_building"
                value={formData.what_are_you_building}
                onChange={handleChange}
                placeholder="AI expense tracker"
                required
              />
            </CardContent>
          </Card>

          <Card style={cardStyle} className="rounded-2xl">
            <CardHeader>
              <Eyebrow>Step 2</Eyebrow>
              <CardTitle className="text-zinc-100">
                Describe your product
              </CardTitle>
              <p className="text-sm text-zinc-500">
                What it does, the problem it solves, and why someone would
                use it.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                name="product_description"
                value={formData.product_description}
                onChange={handleChange}
                placeholder="Describe what your product does, the problem it solves and why someone would use it."
                className="min-h-32"
                required
              />
            </CardContent>
          </Card>

          <Card style={cardStyle} className="rounded-2xl">
            <CardHeader>
              <Eyebrow>Step 3 · Optional</Eyebrow>
              <CardTitle className="text-zinc-100">
                Additional details
              </CardTitle>
              <p className="text-sm text-zinc-500">
                Competitors, pricing, country, stage, unique features,
                existing customers — anything else.
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                name="additional_details"
                value={formData.additional_details}
                onChange={handleChange}
                placeholder="Anything else that might help (optional)"
                className="min-h-24"
              />
            </CardContent>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="h-12 w-full rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:cursor-wait disabled:opacity-80"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                Generating ICP...
              </span>
            ) : (
              "Generate ICP"
            )}
          </Button>
        </form>
      </div>

      {/* ===========================================================
SEO CONTENT — PART 1
=========================================================== */}

<section className="mx-auto max-w-5xl px-6 py-24">

  <div className="space-y-16">

    {/* WHAT IS A USER PERSONA */}

    <section>

      <h2 className="text-4xl font-bold text-white">
        What is a User Persona?
      </h2>

      <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

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

    {/* WHY PERSONAS */}

    <section>

      <h2 className="text-4xl font-bold text-white">
        Why User Personas Matter
      </h2>

      <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

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

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

          <h3 className="text-xl font-semibold text-white">
            Better Product Decisions
          </h3>

          <p className="mt-4 text-zinc-400">
            Build features your target users actually need instead of adding
            functionality based on assumptions.
          </p>

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

          <h3 className="text-xl font-semibold text-white">
            Stronger Marketing
          </h3>

          <p className="mt-4 text-zinc-400">
            Write copy that directly addresses customer pain points,
            motivations, and desired outcomes.
          </p>

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

          <h3 className="text-xl font-semibold text-white">
            Higher Conversion Rates
          </h3>

          <p className="mt-4 text-zinc-400">
            Landing pages perform better when they communicate with a clearly
            defined audience.
          </p>

        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

          <h3 className="text-xl font-semibold text-white">
            Faster Customer Validation
          </h3>

          <p className="mt-4 text-zinc-400">
            Know exactly who to interview, where to find them, and which
            questions to ask during customer discovery.
          </p>

        </div>

      </div>

      <div className="mt-10 space-y-6 text-lg leading-8 text-zinc-400">

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

    {/* AI VS MANUAL */}

    <section>

      <h2 className="text-4xl font-bold text-white">
        AI User Persona Generator vs Manual Persona Creation
      </h2>

      <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

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

      <div className="mt-10 overflow-hidden rounded-2xl border border-zinc-800">

        <table className="w-full text-left">

          <thead className="bg-zinc-900">

            <tr>

              <th className="p-5 text-white">
                Manual Research
              </th>

              <th className="p-5 text-white">
                AI Persona Generator
              </th>

            </tr>

          </thead>

          <tbody className="text-zinc-400">

            <tr className="border-t border-zinc-800">
              <td className="p-5">Several hours or days</td>
              <td className="p-5">Usually under a minute</td>
            </tr>

            <tr className="border-t border-zinc-800">
              <td className="p-5">Starts from scratch</td>
              <td className="p-5">Provides a structured first draft</td>
            </tr>

            <tr className="border-t border-zinc-800">
              <td className="p-5">Requires extensive research</td>
              <td className="p-5">Works from your product description</td>
            </tr>

            <tr className="border-t border-zinc-800">
              <td className="p-5">Manual documentation</td>
              <td className="p-5">Instant organized report</td>
            </tr>

          </tbody>

        </table>

      </div>

      <p className="mt-8 text-lg leading-8 text-zinc-400">
        The most effective approach combines both methods: use AI to generate a
        detailed starting point, then validate and improve the persona through
        conversations with real customers. This saves time while keeping your
        understanding grounded in real-world feedback.
      </p>

    </section>

  </div>

</section>

{/* ================= END OF PART 1 ================= */}

{/* ===========================================================
SEO CONTENT — PART 2
=========================================================== */}

<section>

  <h2 className="text-4xl font-bold text-white">
    How Our AI User Persona Generator Works
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

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

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

      <div className="text-4xl font-bold text-blue-400">
        1
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        Describe Your Product
      </h3>

      <p className="mt-3 text-zinc-400">
        Tell the AI what you're building, the problem you're solving, and who
        you believe your customers are.
      </p>

    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

      <div className="text-4xl font-bold text-blue-400">
        2
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        AI Analysis
      </h3>

      <p className="mt-3 text-zinc-400">
        The AI analyzes your description, identifies customer patterns, and
        predicts motivations, behaviours, and pain points.
      </p>

    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

      <div className="text-4xl font-bold text-blue-400">
        3
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        Detailed Persona
      </h3>

      <p className="mt-3 text-zinc-400">
        Receive a structured user persona with goals, frustrations, buying
        behaviour, preferred channels, messaging, and recommendations.
      </p>

    </div>

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">

      <div className="text-4xl font-bold text-blue-400">
        4
      </div>

      <h3 className="mt-4 text-xl font-semibold text-white">
        Validate & Improve
      </h3>

      <p className="mt-3 text-zinc-400">
        Compare the generated persona with real customer interviews and update
        it as your business grows.
      </p>

    </div>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Who Should Use This AI User Persona Generator?
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

    <p>
      Understanding your audience is valuable regardless of your industry. This
      AI User Persona Generator is designed for individuals and teams who want
      to make smarter product and marketing decisions without spending weeks on
      manual research.
    </p>

  </div>

  <div className="mt-10 grid gap-6 md:grid-cols-2">

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="text-xl font-semibold text-white">
        Startup Founders
      </h3>
      <p className="mt-3 text-zinc-400">
        Validate ideas, understand early adopters, and prioritize the right
        features before building your MVP.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="text-xl font-semibold text-white">
        SaaS Companies
      </h3>
      <p className="mt-3 text-zinc-400">
        Improve onboarding, feature prioritization, customer retention, and
        pricing by understanding your users.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="text-xl font-semibold text-white">
        Marketing Teams
      </h3>
      <p className="mt-3 text-zinc-400">
        Create campaigns that resonate with your audience instead of relying on
        generic messaging.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="text-xl font-semibold text-white">
        Agencies & Freelancers
      </h3>
      <p className="mt-3 text-zinc-400">
        Understand client audiences faster and produce more effective marketing
        strategies.
      </p>
    </div>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Benefits of AI-Generated User Personas
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

    <p>
      AI cannot replace conversations with customers, but it can dramatically
      reduce the time needed to create a thoughtful first draft. Instead of
      spending hours brainstorming customer profiles, founders can begin with a
      structured persona and spend more time validating assumptions.
    </p>

  </div>

  <div className="mt-10 grid gap-5 md:grid-cols-2">

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Save hours of manual research
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Identify customer pain points quickly
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Improve product positioning
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Write better landing pages
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Build stronger marketing campaigns
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Validate startup ideas faster
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Understand customer motivations
    </div>

    <div className="rounded-xl border border-zinc-800 p-5">
      ✓ Make better business decisions
    </div>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Common Mistakes When Creating User Personas
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

    <p>
      A persona is only useful if it reflects reality. Many founders accidentally
      create personas based on assumptions instead of evidence, which can lead
      to poor product and marketing decisions.
    </p>

  </div>

  <div className="mt-10 space-y-6">

    <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6">
      <h3 className="font-semibold text-white">
        ❌ Building for Everyone
      </h3>
      <p className="mt-3 text-zinc-400">
        Trying to target every possible customer usually results in a product
        that resonates with no specific audience.
      </p>
    </div>

    <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6">
      <h3 className="font-semibold text-white">
        ❌ Ignoring Customer Interviews
      </h3>
      <p className="mt-3 text-zinc-400">
        AI provides a starting point, but speaking with real users is essential
        for validation.
      </p>
    </div>

    <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-6">
      <h3 className="font-semibold text-white">
        ❌ Never Updating Personas
      </h3>
      <p className="mt-3 text-zinc-400">
        Customer needs change over time. Revisit your personas regularly as your
        business evolves.
      </p>
    </div>

  </div>

</section>

{/* ===========================================================
SEO CONTENT — PART 3
=========================================================== */}

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Example AI-Generated User Persona
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

    <p>
      To better understand what a complete customer persona looks like, here's
      an example generated for a fictional SaaS startup that helps marketing
      teams automate content creation. While every business is different, this
      illustrates the level of detail a strong persona should include.
    </p>

  </div>

  <div className="mt-12 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8">

    <div className="grid gap-8 md:grid-cols-2">

      <div>

        <h3 className="text-2xl font-semibold text-white">
          Sarah Thompson
        </h3>

        <p className="mt-3 text-zinc-400">
          Marketing Manager at a B2B SaaS startup
        </p>

        <div className="mt-8 space-y-4">

          <div>
            <h4 className="font-semibold text-white">Age</h4>
            <p className="text-zinc-400">31 years old</p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Location</h4>
            <p className="text-zinc-400">Austin, Texas</p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Company Size</h4>
            <p className="text-zinc-400">20–50 employees</p>
          </div>

          <div>
            <h4 className="font-semibold text-white">Technical Skills</h4>
            <p className="text-zinc-400">
              Intermediate
            </p>
          </div>

        </div>

      </div>

      <div>

        <h3 className="text-2xl font-semibold text-white">
          Primary Goals
        </h3>

        <ul className="mt-5 space-y-3 text-zinc-400">

          <li>• Generate more qualified leads</li>
          <li>• Improve marketing ROI</li>
          <li>• Reduce manual work</li>
          <li>• Scale content production</li>
          <li>• Increase demo bookings</li>

        </ul>

        <h3 className="mt-10 text-2xl font-semibold text-white">
          Biggest Pain Points
        </h3>

        <ul className="mt-5 space-y-3 text-zinc-400">

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

        <h3 className="text-xl font-semibold text-white">
          Buying Behaviour
        </h3>

        <p className="mt-4 text-zinc-400">
          Sarah researches extensively before purchasing software. She compares
          competitors, reads customer reviews, watches YouTube demonstrations,
          and usually signs up for a free trial before making a purchasing
          decision.
        </p>

      </div>

      <div>

        <h3 className="text-xl font-semibold text-white">
          Preferred Channels
        </h3>

        <p className="mt-4 text-zinc-400">
          LinkedIn, Reddit, Product Hunt, YouTube, newsletters, founder
          communities, and Google Search.
        </p>

      </div>

    </div>

    <div className="mt-10 rounded-2xl bg-zinc-950 p-6">

      <h3 className="text-xl font-semibold text-white">
        Messaging That Resonates
      </h3>

      <p className="mt-4 text-zinc-400 italic">
        "Save time without sacrificing quality. Launch campaigns faster while
        giving your team more time to focus on growth."
      </p>

    </div>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    How to Validate Your AI-Generated Persona
  </h2>

  <div className="mt-8 space-y-6 text-lg leading-8 text-zinc-400">

    <p>
      AI is excellent at generating structured customer profiles, but the most
      successful startups treat those profiles as hypotheses rather than facts.
      Validation is what transforms a useful draft into a reliable business
      asset.
    </p>

    <p>
      Start by interviewing people who closely resemble your target audience.
      Ask open-ended questions about their workflow, frustrations, goals, and
      decision-making process. Avoid leading questions that push customers
      toward the answers you expect.
    </p>

    <p>
      Compare those conversations with the AI-generated persona. Which
      assumptions were correct? Which behaviours were inaccurate? Which pain
      points appear repeatedly across multiple interviews? Update your persona
      as new evidence emerges.
    </p>

    <p>
      Validation should be an ongoing process rather than a one-time exercise.
      Markets change, competitors evolve, and customer priorities shift over
      time. Revisiting your personas regularly helps ensure your product and
      messaging stay relevant.
    </p>

  </div>

</section>

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Best Practices for Creating User Personas
  </h2>

  <div className="mt-10 grid gap-6 md:grid-cols-2">

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="font-semibold text-white">
        Base Personas on Evidence
      </h3>
      <p className="mt-3 text-zinc-400">
        Use interviews, analytics, surveys, and customer conversations whenever
        possible.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="font-semibold text-white">
        Focus on Behaviours
      </h3>
      <p className="mt-3 text-zinc-400">
        Goals, motivations, and frustrations usually matter more than age or
        demographics alone.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="font-semibold text-white">
        Keep Personas Updated
      </h3>
      <p className="mt-3 text-zinc-400">
        Review your personas regularly as your audience and product evolve.
      </p>
    </div>

    <div className="rounded-xl border border-zinc-800 p-6">
      <h3 className="font-semibold text-white">
        Share Across Your Team
      </h3>
      <p className="mt-3 text-zinc-400">
        Product, design, engineering, marketing, and sales should all work from
        the same customer understanding.
      </p>
    </div>

  </div>

</section>

<section className="mt-24 rounded-3xl border border-blue-900/40 bg-gradient-to-r from-blue-950/30 to-indigo-950/30 p-10">

  <h2 className="text-3xl font-bold text-white">
    Build Better Products with Plavtora
  </h2>

  <div className="mt-6 space-y-6 text-lg leading-8 text-zinc-300">

    <p>
      A great user persona is only the beginning. Successful startups validate
      ideas, understand customer problems, and continuously improve their
      products before launch.
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

{/* ===========================================================
SEO CONTENT — PART 4 (FAQ)
=========================================================== */}

<section className="mt-24">

  <h2 className="text-4xl font-bold text-white">
    Frequently Asked Questions
  </h2>

  <div className="mt-10 space-y-10">

    <div>
      <h3 className="text-2xl font-semibold text-white">
        What is a user persona?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        A user persona is a fictional representation of your ideal customer based
        on research, assumptions, and customer insights. It helps businesses
        understand who they are building for, what problems customers face, and
        how products or services can better meet their needs.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        What is the difference between a user persona and a buyer persona?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        A user persona focuses on the person who actually uses a product,
        while a buyer persona focuses on the individual responsible for making
        the purchasing decision. In many startups these may be the same person,
        but in larger organizations they are often different.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        How accurate are AI-generated user personas?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        AI-generated personas provide an excellent starting point by identifying
        common patterns and likely customer characteristics. However, they should
        always be validated with real customer interviews, analytics, surveys,
        and user feedback before making major business decisions.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Who should use an AI User Persona Generator?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Startup founders, SaaS companies, product managers, marketers,
        agencies, consultants, freelancers, entrepreneurs, and students can all
        benefit from creating structured customer personas before building
        products or launching marketing campaigns.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Can I use this persona for my startup?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Yes. The generated persona is intended to help you understand your
        target audience more quickly. You should refine it as you gather
        customer feedback and validate assumptions during product development.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Is Plavtora's AI User Persona Generator free?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Yes. You can generate detailed user personas without manually creating
        lengthy customer profiles from scratch.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Why are user personas important for startups?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        User personas help founders prioritize features, improve messaging,
        identify customer pain points, validate ideas, and reduce the risk of
        building products that don't solve real problems.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Can I edit my generated persona later?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Absolutely. Your persona should evolve as you conduct customer
        interviews, analyze user behavior, and learn more about your target
        audience.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        What information should a good user persona include?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        A strong persona typically includes demographics, goals, motivations,
        frustrations, daily challenges, buying behavior, preferred communication
        channels, objections, and decision-making factors.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        How often should I update my user personas?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Review your personas whenever your market changes, your product evolves,
        or you gather significant customer feedback. Many startups revisit them
        every few months to ensure they still reflect real users.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        Does this tool replace customer interviews?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        No. AI accelerates the persona creation process, but direct
        conversations with customers remain one of the best ways to validate
        assumptions and understand real-world behavior.
      </p>
    </div>

    <div>
      <h3 className="text-2xl font-semibold text-white">
        How can user personas improve marketing?
      </h3>
      <p className="mt-3 text-lg leading-8 text-zinc-400">
        Personas help marketers create more relevant messaging, choose the right
        acquisition channels, write stronger landing pages, and produce content
        that speaks directly to customer needs.
      </p>
    </div>

  </div>

</section>

{/* ===================== END SEO CONTENT ===================== */}
    </main>
  );
}