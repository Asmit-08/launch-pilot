"use client";

import { useState } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setStageIndex(0);

    LOADING_STAGES.forEach((_, i) => {
      setTimeout(() => setStageIndex(i), i * 1400);
    });

    const payload = {
      ...formData,
      additional_details: formData.additional_details || null,
    };

    const response = await fetch(
      "https://launch-pilot-backend.onrender.com/persona",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    setResult(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <Eyebrow>Generating your report</Eyebrow>
          <p className="mt-4 text-2xl font-semibold text-zinc-100">
            {LOADING_STAGES[stageIndex]}
          </p>

          <div className="mx-auto mt-8 h-1 w-72 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-blue-500"
              style={{
                width: `${((stageIndex + 1) / LOADING_STAGES.length) * 100}%`,
                transition: "width 0.6s ease",
              }}
            />
          </div>
        </div>
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
              Launch Pilot helps founders validate ideas, identify launch
              risks, and prepare products before launch.
            </p>
            <Button
              asChild
              size="lg"
              className="mt-6 h-11 rounded-full bg-blue-600 px-6 text-white hover:bg-blue-500"
            >
              <Link href="/">Continue with Launch Pilot →</Link>
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
        <Eyebrow>Free · No signup required</Eyebrow>
        <h1 className="mx-auto mt-4 max-w-2xl text-5xl font-bold leading-tight text-zinc-100">
          Generate Detailed <span className="text-blue-500">AI User Personas</span> in Seconds
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Describe your product and let AI identify your ideal customers,
          pain points, motivations, buying behavior and marketing
          opportunities.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-8 h-12 rounded-full bg-blue-600 px-8 text-white hover:bg-blue-500"
        >
          <a href="#persona-form">Generate Persona</a>
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
            className="h-12 w-full rounded-full bg-blue-600 text-white hover:bg-blue-500"
          >
            Generate Persona
          </Button>
        </form>
      </div>
    </main>
  );
}