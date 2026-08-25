"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  Globe2,
  Loader2,
  LockKeyhole,
  Search,
  Sparkles,
  Target,
  ShieldCheck,
  TriangleAlert,
  Zap,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/services/user";

type AnalysisResult = {
  overall_score: number;
  executive_summary: string;

  messaging: {
    score: number;
    summary: string;
  };

  value_proposition?: {
    score: number;
    summary: string;
  };

  cta?: {
    score: number;
    summary: string;
  };

  trust?: {
    score: number;
    summary: string;
  };

  conversion_clarity?: {
    score: number;
    summary: string;
  };

  icp_alignment?: {
    score: number;
    summary: string;
  };

  conversion_problems?: string[];
  recommendations?: string[];
};

type UsageLimitError = {
  error: string;
  resource?: string;
  plan?: string;
  limit?: number;
  used?: number;
};

const loadingStages = [
  {
    title: "Connecting to your landing page",
    description: "Reading the page structure and visible content.",
  },
  {
    title: "Understanding your messaging",
    description:
      "Identifying the value proposition and core promise.",
  },
  {
    title: "Evaluating your audience",
    description:
      "Checking how clearly the page communicates who it is for.",
  },
  {
    title: "Looking for conversion friction",
    description:
      "Examining CTAs, trust signals, and clarity.",
  },
  {
    title: "Building your Plavtora analysis",
    description:
      "Turning the findings into useful, prioritized insights.",
  },
];

function scoreLabel(score: number) {
  if (score >= 8) return "Strong";
  if (score >= 6) return "Needs attention";
  return "Weak";
}

function scoreTone(score: number) {
  if (score >= 8) {
    return {
      badge: "bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      bar: "bg-emerald-500",
    };
  }

  if (score >= 6) {
    return {
      badge: "bg-amber-50 text-amber-700",
      text: "text-amber-700",
      bar: "bg-amber-500",
    };
  }

  return {
    badge: "bg-rose-50 text-rose-700",
    text: "text-rose-700",
    bar: "bg-rose-500",
  };
}

function ScoreMetric({
  title,
  score,
  description,
}: {
  title: string;
  score: number;
  description?: string;
}) {
  const tone = scoreTone(score);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-500">{title}</p>
          {description && (
            <p className="mt-1 text-[11px] leading-5 text-slate-400">
              {description}
            </p>
          )}
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${tone.badge}`}
        >
          {scoreLabel(score)}
        </span>
      </div>

      <div className="mt-5 flex items-end gap-2">
        <span className="text-3xl font-bold tracking-tight text-slate-950">
          {score}
        </span>
        <span className="pb-1 text-sm text-slate-400">/10</span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${tone.bar}`}
          style={{
            width: `${Math.min(Math.max(score, 0), 10) * 10}%`,
          }}
        />
      </div>
    </div>
  );
}

function InsightCard({
  eyebrow,
  title,
  score,
  summary,
  tone = "blue",
}: {
  eyebrow: string;
  title: string;
  score: number;
  summary: string;
  tone?: "blue" | "violet" | "emerald" | "cyan";
}) {
  const toneClasses = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      eyebrow: "text-blue-600",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      eyebrow: "text-violet-600",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      eyebrow: "text-emerald-600",
    },
    cyan: {
      icon: "bg-cyan-50 text-cyan-600",
      eyebrow: "text-cyan-600",
    },
  }[tone];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.17em] ${toneClasses.eyebrow}`}
          >
            {eyebrow}
          </p>

          <h3 className="mt-2 text-lg font-bold text-slate-950">
            {title}
          </h3>
        </div>

        <div className="rounded-xl bg-slate-50 px-3 py-2 text-lg font-bold text-slate-900">
          {score}/10
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{summary}</p>
    </div>
  );
}

function LockedFeature({
  eyebrow,
  title,
  description,
  onUnlock,
}: {
  eyebrow: string;
  title: string;
  description: string;
  onUnlock: () => void;
}) {
  return (
    <div className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
            <LockKeyhole size={18} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-700">
              {eyebrow}
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
          onClick={onUnlock}
          className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
        >
          Unlock Premium
        </button>
      </div>
    </div>
  );
}

function LoadingStages() {
  const [loadingStage, setLoadingStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingStage((current) =>
        current < loadingStages.length - 1 ? current + 1 : current
      );
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-6">
      <div className="mx-auto max-w-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <Sparkles size={24} />
          </div>

          <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
            Plavtora analysis
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            Analyzing your landing page
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Plavtora is examining the page from a conversion perspective.
          </p>
        </div>

        <div className="mt-8 space-y-2">
          {loadingStages.map((stage, index) => {
            const completed = index < loadingStage;
            const active = index === loadingStage;

            return (
              <div
                key={stage.title}
                className={`flex items-center gap-4 rounded-2xl border p-4 transition-all ${
                  active
                    ? "border-slate-900 bg-slate-900"
                    : completed
                      ? "border-emerald-100 bg-emerald-50"
                      : "border-slate-200 bg-white opacity-45"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    active
                      ? "bg-white/10 text-white"
                      : completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {completed ? (
                    <Check size={15} />
                  ) : active ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      active
                        ? "text-white"
                        : completed
                          ? "text-emerald-800"
                          : "text-slate-500"
                    }`}
                  >
                    {stage.title}
                  </p>

                  <p
                    className={`mt-1 text-xs leading-5 ${
                      active
                        ? "text-white/50"
                        : "text-slate-400"
                    }`}
                  >
                    {stage.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LandingPageAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [useSavedIcp, setUseSavedIcp] = useState(false);

  const [usageExhausted, setUsageExhausted] = useState(false);
  const [usageLimit, setUsageLimit] = useState<number | null>(null);
  const [usageUsed, setUsageUsed] = useState<number | null>(null);

  useEffect(() => {
    const returnedUrl = searchParams.get("url");

    if (returnedUrl) {
      setUrl(returnedUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadPremiumStatus() {
      try {
        const currentUser = await getCurrentUser();
        const subscription = currentUser?.subscription;

        setIsPremium(
          subscription === "premium" ||
            subscription === "super_premium"
        );
      } catch (error) {
        console.error(
          "Failed to load subscription status:",
          error
        );
        setIsPremium(false);
      }
    }

    loadPremiumStatus();
  }, []);

  async function handleAnalyze() {
    setError("");
    setResult(null);

    if (usageExhausted) {
      return;
    }

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Enter a landing page URL.");
      return;
    }

    let normalizedUrl = trimmedUrl;

    if (
      !normalizedUrl.startsWith("http://") &&
      !normalizedUrl.startsWith("https://")
    ) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError("Enter a valid landing page URL.");
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push(
        `/auth?redirect=/landing_page_analyzer&url=${encodeURIComponent(
          normalizedUrl
        )}`
      );
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      const subscription = currentUser?.subscription;

      setIsPremium(
        subscription === "premium" ||
          subscription === "super_premium"
      );
    } catch (error) {
      console.error(
        "Failed to refresh subscription status:",
        error
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
      setError("The application backend is not configured.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${apiUrl}/landing-page/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            url: normalizedUrl,
            use_saved_icp: useSavedIcp,
          }),
        }
      );

      const responseData = await response.json();

      if (response.status === 429) {
        const detail: UsageLimitError =
          responseData?.detail || {};

        if (
          detail.error === "usage_limit_reached" &&
          detail.resource === "landing_page_analyses"
        ) {
          setUsageExhausted(true);

          setUsageLimit(
            typeof detail.limit === "number"
              ? detail.limit
              : null
          );

          setUsageUsed(
            typeof detail.used === "number"
              ? detail.used
              : null
          );

          setError("");
          return;
        }

        throw new Error(
          typeof responseData?.detail === "string"
            ? responseData.detail
            : "Usage limit reached."
        );
      }

      if (!response.ok) {
        const detail =
          typeof responseData?.detail === "string"
            ? responseData.detail
            : "Unable to analyze this landing page.";

        throw new Error(detail);
      }

      setResult(responseData);
    } catch (err) {
      console.error(
        "Landing page analysis failed:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the page."
      );
    } finally {
      setLoading(false);
    }
  }

  if (usageExhausted) {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 text-slate-950 sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
          <div className="w-full rounded-[30px] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <LockKeyhole size={24} />
            </div>

            <div className="mt-6 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-700">
                Monthly limit reached
              </p>

              <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
                You've used all your analyses.
              </h1>

              <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
                Your current plan has no landing-page analyses left this
                month. Upgrade to keep diagnosing pages.
              </p>
            </div>

            {usageLimit !== null && usageUsed !== null && (
              <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">
                    Landing Page Analyses
                  </span>

                  <span className="text-sm font-bold text-slate-950">
                    {usageUsed}/{usageLimit}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-violet-600"
                    style={{
                      width: `${Math.min(
                        (usageUsed /
                          Math.max(usageLimit, 1)) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50 p-5">
              <p className="font-semibold text-slate-950">
                Premium gives you more room to iterate.
              </p>

              <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                {[
                  "20 landing page analyses / month",
                  "ICP alignment analysis",
                  "CTA & conversion analysis",
                  "Prioritized recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white bg-white/70 px-3 py-2.5"
                  >
                    <span className="mr-2 text-violet-600">
                      ✓
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push("/billing")}
              className="mt-7 h-12 w-full rounded-xl bg-slate-950 text-sm font-semibold text-white transition hover:bg-violet-600"
            >
              Upgrade to Premium
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="mt-3 h-12 w-full rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-3"
          >
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-9 w-9 rounded-xl"
            />

            <div className="text-left">
              <p className="text-[17px] font-bold tracking-tight text-slate-950">
                Plavtora
              </p>

              <p className="hidden text-[10px] font-medium text-slate-400 sm:block">
                Landing Page Intelligence
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dashboard
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_310px] lg:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
              <Globe2 size={13} />
              AI Landing Page Analyzer
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.05em] text-slate-950 sm:text-6xl">
              Find out why your page
              <span className="block text-slate-400">
                converts — or doesn't.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Plavtora examines your messaging, positioning, audience fit,
              trust, and conversion clarity to identify what deserves fixing.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              What you'll get
            </p>

            <div className="mt-4 space-y-3">
              {[
                "Messaging assessment",
                "Conversion clarity",
                "Audience alignment",
                "Trust & CTA review",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Check size={11} strokeWidth={3} />
                  </span>
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={14} />
              Public URL only · No page changes
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-5xl">
          {!loading && !result && (
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Search size={19} />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                    Start analysis
                  </p>

                  <h2 className="mt-2 text-xl font-bold text-slate-950">
                    Give Plavtora the page you want to pressure-test.
                  </h2>

                  <p className="mt-1.5 text-sm leading-6 text-slate-500">
                    Use a public landing page URL. You can optionally compare
                    it against your saved ICP.
                  </p>
                </div>
              </div>

              <div className="mt-7">
                <label className="mb-2 block text-sm font-semibold text-slate-800">
                  Landing page URL
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAnalyze();
                      }
                    }}
                    placeholder="https://yourwebsite.com"
                    className="h-13 min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={usageExhausted}
                    className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Analyze Page
                    <ArrowRight size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setUseSavedIcp((current) => !current)}
                  className={`mt-4 flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                    useSavedIcp
                      ? "border-violet-200 bg-violet-50"
                      : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      useSavedIcp
                        ? "border-violet-600 bg-violet-600 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    <Check size={12} strokeWidth={3} />
                  </span>

                  <span>
                    <span className="block text-sm font-semibold text-slate-800">
                      Compare against my saved ICP
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Plavtora will compare the page against your currently
                      saved ICP. Leave this off if that ICP belongs to another
                      product.
                    </span>
                  </span>
                </button>

                {error && (
                  <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <TriangleAlert
                      size={16}
                      className="mt-0.5 shrink-0"
                    />
                    {error}
                  </div>
                )}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <ToolPreview
                  icon={<Target size={17} />}
                  title="Messaging"
                  description="Is the value proposition clear?"
                />

                <ToolPreview
                  icon={<Zap size={17} />}
                  title="Conversion"
                  description="Where is friction stopping action?"
                />

                <ToolPreview
                  icon={<Sparkles size={17} />}
                  title="ICP alignment"
                  description="Are you speaking to the right buyer?"
                />
              </div>
            </div>
          )}

          {loading && (
            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <LoadingStages />
            </div>
          )}

          {!loading && result && (
            <div className="space-y-5">
              <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
                  <div className="border-b border-slate-100 p-7 sm:p-9 lg:border-b-0 lg:border-r">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                      Landing page score
                    </p>

                    <div className="mt-5 flex items-end gap-3">
                      <span className="text-7xl font-bold leading-none tracking-[-0.07em] text-slate-950">
                        {result.overall_score}
                      </span>

                      <span className="pb-2 text-lg font-medium text-slate-400">
                        /10
                      </span>
                    </div>

                    <p className="mt-4 text-base font-bold text-slate-900">
                      {scoreLabel(result.overall_score)}
                    </p>

                    <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          scoreTone(result.overall_score).bar
                        }`}
                        style={{
                          width: `${Math.min(
                            Math.max(result.overall_score, 0),
                            10
                          ) * 10}%`,
                        }}
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Based on the current page content and visible conversion
                      signals.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-7 text-white sm:p-9">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                      Executive summary
                    </p>

                    <p className="mt-4 text-lg leading-8 text-white/80">
                      {result.executive_summary}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                        Messaging
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                        Conversion
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                        Trust
                      </span>

                      <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                        Positioning
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-3 md:grid-cols-2">
                <ScoreMetric
                  title="Messaging"
                  score={result.messaging.score}
                  description="Value proposition and communication."
                />

                {result.value_proposition && (
                  <ScoreMetric
                    title="Value proposition"
                    score={result.value_proposition.score}
                    description="How clearly the core promise comes through."
                  />
                )}

                {result.cta && (
                  <ScoreMetric
                    title="CTA"
                    score={result.cta.score}
                    description="How effectively the page pushes action."
                  />
                )}

                {result.trust && (
                  <ScoreMetric
                    title="Trust"
                    score={result.trust.score}
                    description="Credibility and confidence signals."
                  />
                )}
              </section>

              <InsightCard
                eyebrow="01 / Messaging"
                title="What your page is communicating"
                score={result.messaging.score}
                summary={result.messaging.summary}
                tone="blue"
              />

              {!isPremium && (
                <section className="rounded-[28px] border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-6 sm:p-7">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                        <Sparkles size={18} />
                      </div>

                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-violet-700">
                          Premium analysis
                        </p>

                        <h2 className="mt-2 text-xl font-bold text-slate-950">
                          The score tells you where. Premium tells you why.
                        </h2>

                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          Unlock ICP alignment, conversion clarity, trust and
                          CTA analysis, conversion problems, and prioritized
                          recommendations.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => router.push("/billing")}
                      className="shrink-0 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600"
                    >
                      Unlock Premium
                    </button>
                  </div>
                </section>
              )}

              {isPremium ? (
                <div className="space-y-5">
                  <section className="rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 p-6 sm:p-7">
                    <div className="flex items-center gap-2 text-violet-700">
                      <Sparkles size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                        Premium analysis
                      </span>
                    </div>

                    <h2 className="mt-3 text-2xl font-bold text-slate-950">
                      Complete landing-page diagnosis
                    </h2>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      Go beyond the first-pass signal and see the specific
                      conversion and positioning issues that matter.
                    </p>
                  </section>

                  {result.icp_alignment && (
                    <InsightCard
                      eyebrow="02 / ICP"
                      title="ICP alignment"
                      score={result.icp_alignment.score}
                      summary={result.icp_alignment.summary}
                      tone="violet"
                    />
                  )}

                  {result.value_proposition && (
                    <InsightCard
                      eyebrow="03 / Value proposition"
                      title="Core promise clarity"
                      score={result.value_proposition.score}
                      summary={result.value_proposition.summary}
                      tone="blue"
                    />
                  )}

                  {result.cta && (
                    <InsightCard
                      eyebrow="04 / CTA"
                      title="Action clarity"
                      score={result.cta.score}
                      summary={result.cta.summary}
                      tone="cyan"
                    />
                  )}

                  {result.trust && (
                    <InsightCard
                      eyebrow="05 / Trust"
                      title="Trust & credibility"
                      score={result.trust.score}
                      summary={result.trust.summary}
                      tone="emerald"
                    />
                  )}

                  {result.conversion_clarity && (
                    <InsightCard
                      eyebrow="06 / Conversion clarity"
                      title="How easy is it to understand and act?"
                      score={result.conversion_clarity.score}
                      summary={result.conversion_clarity.summary}
                      tone="blue"
                    />
                  )}

                  {result.conversion_problems &&
                    result.conversion_problems.length > 0 && (
                      <section className="rounded-[28px] border border-rose-100 bg-rose-50 p-6 sm:p-7">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">
                            <TriangleAlert size={18} />
                          </div>

                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-rose-600">
                              Conversion problems
                            </p>

                            <h2 className="mt-1 text-xl font-bold text-slate-950">
                              What is hurting conversion?
                            </h2>
                          </div>
                        </div>

                        <div className="mt-5 space-y-3">
                          {result.conversion_problems.map(
                            (problem, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-white bg-white/70 p-4 text-sm leading-6 text-slate-600"
                              >
                                <span className="mr-2 font-bold text-rose-600">
                                  {index + 1}.
                                </span>
                                {problem}
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}

                  {result.recommendations &&
                    result.recommendations.length > 0 && (
                      <section className="rounded-[28px] bg-slate-950 p-6 text-white sm:p-7">
                        <div className="flex items-center gap-2 text-violet-300">
                          <Sparkles size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-[0.17em]">
                            Prioritized recommendations
                          </span>
                        </div>

                        <h2 className="mt-3 text-2xl font-bold">
                          What should you fix next?
                        </h2>

                        <div className="mt-5 space-y-3">
                          {result.recommendations.map(
                            (recommendation, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm leading-6 text-white/75"
                              >
                                <span className="mr-2 font-bold text-violet-300">
                                  {index + 1}.
                                </span>
                                {recommendation}
                              </div>
                            )
                          )}
                        </div>
                      </section>
                    )}
                </div>
              ) : (
                <div className="space-y-4">
                  <LockedFeature
                    eyebrow="ICP alignment"
                    title="Are you speaking to the right customer?"
                    description="Compare the landing page against your intended buyer and see whether the positioning matches."
                    onUnlock={() => router.push("/billing")}
                  />

                  <LockedFeature
                    eyebrow="Conversion analysis"
                    title="Find the friction stopping visitors from acting."
                    description="Unlock detailed CTA, conversion clarity, trust, and problem analysis."
                    onUnlock={() => router.push("/billing")}
                  />

                  <LockedFeature
                    eyebrow="Prioritized recommendations"
                    title="Know what to fix next."
                    description="Premium turns the analysis into a prioritized list of changes instead of leaving you with a score alone."
                    onUnlock={() => router.push("/billing")}
                  />
                </div>
              )}

              <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Analyze Another Page
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}

          {!loading && !result && (
            <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
              <ShieldCheck size={14} />
              Public landing-page URL · Plavtora analyzes without modifying it
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ToolPreview({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
        {icon}
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function LandingPageAnalyzer() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Loader2 size={23} className="animate-spin" />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Plavtora
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Preparing the analyzer...
            </p>
          </div>
        </main>
      }
    >
      <LandingPageAnalyzerContent />
    </Suspense>
  );
}

export default LandingPageAnalyzer;