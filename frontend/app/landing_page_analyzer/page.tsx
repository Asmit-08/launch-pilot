"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

const loadingStages = [
  {
    title: "Connecting to your landing page",
    description: "Reading the page structure...",
  },
  {
    title: "Understanding your messaging",
    description:
      "Identifying your value proposition and core promise...",
  },
  {
    title: "Evaluating your audience",
    description:
      "Checking how clearly the page communicates who it is for...",
  },
  {
    title: "Looking for conversion friction",
    description:
      "Examining CTAs, trust signals, and clarity...",
  },
  {
    title: "Building your Plavtora analysis",
    description:
      "Turning the findings into useful insights...",
  },
];

function LandingPageAnalyzerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] =
    useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [useSavedIcp, setUseSavedIcp] = useState(false);

  /*
   * ---------------------------------------------------------
   * Restore URL after OAuth
   * ---------------------------------------------------------
   *
   * Expected callback destination:
   *
   * /landing_page_analyzer?url=https://example.com
   *
   * We restore the URL into the input but DO NOT automatically
   * run the analysis.
   */

  useEffect(() => {
    const returnedUrl = searchParams.get("url");

    if (returnedUrl) {
      setUrl(returnedUrl);
    }
  }, [searchParams]);

  /*
   * ---------------------------------------------------------
   * Load Premium status
   * ---------------------------------------------------------
   */

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

  /*
   * ---------------------------------------------------------
   * Loading animation
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!loading) {
      setLoadingStage(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStage((current) => {
        if (current < loadingStages.length - 1) {
          return current + 1;
        }

        return current;
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [loading]);

  /*
   * ---------------------------------------------------------
   * Analyze landing page
   * ---------------------------------------------------------
   */

  async function handleAnalyze() {
    setError("");
    setResult(null);

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

    /*
     * -------------------------------------------------------
     * Check authentication
     * -------------------------------------------------------
     */

    const {
      data: { session },
    } = await supabase.auth.getSession();

    /*
     * -------------------------------------------------------
     * Login gate
     * -------------------------------------------------------
     */

    if (!session) {
      router.push(
        `/auth?redirect=/landing_page_analyzer&url=${encodeURIComponent(
          normalizedUrl
        )}`
      );

      return;
    }

    /*
     * -------------------------------------------------------
     * Refresh Premium status
     *
     * This is important if the user purchased Premium while
     * already being on this page.
     * -------------------------------------------------------
     */

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

      setIsPremium(false);
    }

    /*
     * -------------------------------------------------------
     * Analyze
     * -------------------------------------------------------
     */

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

      if (!response.ok) {
        throw new Error(
          responseData?.detail ||
            "Unable to analyze this landing page."
        );
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050816] text-white">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-1/2 top-[-180px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[160px]" />

        <div className="absolute bottom-[-180px] right-[-120px] h-[500px] w-[500px] rounded-full bg-violet-600/15 blur-[150px]" />

        <div className="absolute left-[-150px] top-1/2 h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[150px]" />

      </div>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.025)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16">

        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-medium text-blue-300">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            AI Landing Page Analyzer
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Find out why your landing page
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              {" "}
              converts — or doesn't.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Plavtora analyzes your landing page's
            messaging, positioning, and conversion clarity
            to uncover what's working and what needs attention.
          </p>

        </div>

        {/* Analyzer Card */}
        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_80px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-8">

          {/* =====================================================
              INPUT
              ===================================================== */}

          {!loading && !result && (
            <>
              <label className="mb-3 block text-sm font-medium text-gray-300">
                Landing page URL
              </label>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  value={url}
                  onChange={(e) =>
                    setUrl(e.target.value)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAnalyze();
                    }
                  }}
                  placeholder="https://yourwebsite.com"
                  className="h-14 flex-1 rounded-2xl border border-white/10 bg-black/20 px-5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
                />

                <button
                  onClick={handleAnalyze}
                  className="h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-violet-500 px-7 font-semibold transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20"
                >
                  Analyze Page
                </button>

              </div>

              <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-white/15 hover:bg-white/[0.05]">
                <input
                  type="checkbox"
                  checked={useSavedIcp}
                  onChange={(e) =>
                    setUseSavedIcp(e.target.checked)
                  }
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-black/20 text-violet-500 focus:ring-2 focus:ring-violet-500/30"
                />

                <span>
                  <span className="block text-sm font-medium text-gray-200">
                    Compare against my saved ICP
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-gray-500">
                    When enabled, Plavtora will compare this landing
                    page against your currently saved ICP. Leave this
                    off if the saved ICP belongs to a different product.
                  </span>
                </span>
              </label>

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-lg">🎯</p>

                  <p className="mt-2 text-sm font-medium">
                    Messaging
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Is your value proposition clear?
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-lg">⚡</p>

                  <p className="mt-2 text-sm font-medium">
                    Conversion
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Find friction hurting action.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <p className="text-lg">🧠</p>

                  <p className="mt-2 text-sm font-medium">
                    ICP Alignment
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    See how well you target your buyer.
                  </p>
                </div>

              </div>
            </>
          )}

          {/* =====================================================
              LOADING
              ===================================================== */}

          {loading && (
            <div className="py-10">

              <div className="mx-auto max-w-xl">

                <div className="mb-10 text-center">

                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 shadow-2xl shadow-blue-500/20">

                    <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />

                  </div>

                  <h2 className="text-2xl font-semibold">
                    Analyzing your landing page
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    Plavtora is examining your page.
                  </p>

                </div>

                <div className="space-y-3">

                  {loadingStages.map(
                    (stage, index) => {

                      const completed =
                        index < loadingStage;

                      const active =
                        index === loadingStage;

                      return (
                        <div
                          key={stage.title}
                          className={`flex items-center gap-4 rounded-2xl border p-4 transition-all duration-500 ${
                            active
                              ? "border-blue-500/30 bg-blue-500/[0.08]"
                              : completed
                                ? "border-white/5 bg-white/[0.025]"
                                : "border-white/5 bg-transparent opacity-40"
                          }`}
                        >

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm ${
                              completed
                                ? "bg-emerald-500/15 text-emerald-400"
                                : active
                                  ? "bg-blue-500/15 text-blue-300"
                                  : "bg-white/5 text-gray-600"
                            }`}
                          >
                            {completed
                              ? "✓"
                              : active
                                ? "•"
                                : index + 1}
                          </div>

                          <div>

                            <p className="text-sm font-medium">
                              {stage.title}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {stage.description}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              </div>

            </div>
          )}

          {/* =====================================================
              RESULTS
              ===================================================== */}

          {!loading && result && (
            <div className="space-y-6">

              {/* Score */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 text-center">

                <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">
                  Landing Page Score
                </p>

                <div className="mt-4 text-7xl font-bold tracking-tight">
                  {result.overall_score}

                  <span className="text-2xl text-gray-600">
                    /10
                  </span>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Based on messaging, positioning, trust, CTA,
                  and conversion factors
                </p>

              </div>

              {/* Executive Summary */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

                <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                  Executive Summary
                </p>

                <p className="mt-4 text-base leading-7 text-gray-300">
                  {result.executive_summary}
                </p>

              </div>

              {/* Messaging */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-7">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                      Messaging
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {result.messaging.score}/10
                    </p>

                  </div>

                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Free analysis
                  </div>

                </div>

                <p className="mt-4 leading-7 text-gray-400">
                  {result.messaging.summary}
                </p>

              </div>

              {/* =====================================================
                  PREMIUM ANALYSIS
                  ===================================================== */}

              {isPremium ? (

                <div className="space-y-4">

                  {/* Premium Header */}
                  <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] via-blue-500/[0.04] to-transparent p-7">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        ✨
                      </span>

                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                        Premium Analysis
                      </p>

                    </div>

                    <h3 className="mt-3 text-2xl font-semibold">
                      Your complete landing page analysis
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-gray-400">
                      Detailed insights across positioning,
                      ICP alignment, conversion, trust, CTA,
                      problems, and recommendations.
                    </p>

                  </div>

                  {/* ICP Alignment */}
                  {result.icp_alignment && (
                    <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-white/[0.03] p-6">

                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.06] to-transparent" />

                      <div className="relative">

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                              ICP Alignment
                            </p>

                            <h3 className="mt-2 text-xl font-semibold">
                              Is your page speaking to the right customer?
                            </h3>

                          </div>

                          <div className="rounded-xl border border-violet-400/20 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300">
                            Premium
                          </div>

                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">

                          <div className="text-4xl font-bold text-violet-300">
                            {result.icp_alignment.score}/10
                          </div>

                          <p className="text-sm leading-6 text-gray-400">
                            {result.icp_alignment.summary}
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* Value Proposition */}
                  {result.value_proposition && (
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                            Value Proposition
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Is your core promise clear?
                          </h3>

                        </div>

                        <div className="text-2xl font-bold text-blue-300">
                          {result.value_proposition.score}/10
                        </div>

                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-400">
                        {result.value_proposition.summary}
                      </p>

                    </div>
                  )}

                  {/* CTA */}
                  {result.cta && (
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-300">
                            CTA Analysis
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Are visitors being pushed toward action?
                          </h3>

                        </div>

                        <div className="text-2xl font-bold text-cyan-300">
                          {result.cta.score}/10
                        </div>

                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-400">
                        {result.cta.summary}
                      </p>

                    </div>
                  )}

                  {/* Trust */}
                  {result.trust && (
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
                            Trust & Credibility
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Does the page create enough trust?
                          </h3>

                        </div>

                        <div className="text-2xl font-bold text-emerald-300">
                          {result.trust.score}/10
                        </div>

                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-400">
                        {result.trust.summary}
                      </p>

                    </div>
                  )}

                  {/* Conversion Clarity */}
                  {result.conversion_clarity && (
                    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                            Conversion Clarity
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            How easy is it to understand and act?
                          </h3>

                        </div>

                        <div className="text-2xl font-bold text-blue-300">
                          {result.conversion_clarity.score}/10
                        </div>

                      </div>

                      <p className="mt-4 text-sm leading-7 text-gray-400">
                        {result.conversion_clarity.summary}
                      </p>

                    </div>
                  )}

                  {/* Conversion Problems */}
                  {result.conversion_problems &&
                    result.conversion_problems.length > 0 && (
                      <div className="rounded-3xl border border-red-400/20 bg-red-500/[0.04] p-7">

                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-300">
                          Conversion Problems
                        </p>

                        <h3 className="mt-2 text-xl font-semibold">
                          What is hurting conversion?
                        </h3>

                        <div className="mt-5 space-y-3">

                          {result.conversion_problems.map(
                            (problem, index) => (
                              <div
                                key={index}
                                className="rounded-2xl border border-white/5 bg-black/20 p-4 text-sm leading-6 text-gray-400"
                              >
                                <span className="mr-2 text-red-400">
                                  {index + 1}.
                                </span>

                                {problem}
                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}

                  {/* Recommendations */}
                  {result.recommendations &&
                    result.recommendations.length > 0 && (
                      <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] via-blue-500/[0.04] to-transparent p-7">

                        <div className="relative">

                          <div className="flex items-center gap-2">

                            <span className="text-lg">
                              🚀
                            </span>

                            <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                              Premium Recommendations
                            </p>

                          </div>

                          <h3 className="mt-4 text-2xl font-semibold">
                            What should you fix next?
                          </h3>

                          <div className="mt-6 space-y-3">

                            {result.recommendations.map(
                              (recommendation, index) => (
                                <div
                                  key={index}
                                  className="rounded-2xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-gray-300"
                                >
                                  <span className="mr-2 font-semibold text-violet-300">
                                    {index + 1}.
                                  </span>

                                  {recommendation}
                                </div>
                              )
                            )}

                          </div>

                        </div>

                      </div>
                    )}

                </div>

              ) : (

                /* =====================================================
                   FREE USER — LOCKED PREMIUM UI
                   ===================================================== */

                <div className="space-y-4">

                  {/* ICP Alignment */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.04] to-transparent" />

                    <div className="relative">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                            ICP Alignment
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Is your page speaking to the right customer?
                          </h3>

                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-lg">
                          🔒
                        </div>

                      </div>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                        See whether your positioning actually
                        matches the customers you're trying to reach.
                        Plavtora compares your page against your
                        saved ICP to identify messaging gaps,
                        positioning mismatches, and missed customer
                        signals.
                      </p>

                      <button
                        onClick={() => router.push("/billing")}
                        className="mt-5 text-sm font-medium text-violet-300 transition hover:text-violet-200"
                      >
                        Unlock ICP analysis →
                      </button>

                    </div>

                  </div>

                  {/* Conversion Analysis */}
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.04] to-transparent" />

                    <div className="relative">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-blue-300">
                            Conversion Analysis
                          </p>

                          <h3 className="mt-2 text-xl font-semibold">
                            Find the friction stopping visitors from acting.
                          </h3>

                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-lg">
                          🔒
                        </div>

                      </div>

                      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
                        Unlock detailed analysis of your CTA,
                        conversion clarity, trust signals, and the
                        biggest problems affecting your page.
                      </p>

                      <button
                        onClick={() => router.push("/billing")}
                        className="mt-5 text-sm font-medium text-blue-300 transition hover:text-blue-200"
                      >
                        Unlock conversion analysis →
                      </button>

                    </div>

                  </div>

                  {/* Premium Analysis CTA */}
                  <div className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.08] via-blue-500/[0.04] to-transparent p-7">

                    <div className="relative">

                      <div className="flex items-center gap-2">

                        <span className="text-lg">
                          🚀
                        </span>

                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-300">
                          Premium Analysis
                        </p>

                      </div>

                      <h3 className="mt-4 text-2xl font-semibold">
                        Don't just find the problems.
                        <br />
                        Know what to fix next.
                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-400">
                        Get the complete breakdown of your landing
                        page, including ICP alignment, conversion
                        problems, trust and CTA analysis, and
                        prioritized recommendations.
                      </p>

                      <div className="mt-6 grid gap-3 sm:grid-cols-2">

                        <div className="rounded-xl border border-white/5 bg-black/10 p-3 text-sm text-gray-400">
                          ✓ ICP alignment
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/10 p-3 text-sm text-gray-400">
                          ✓ CTA & conversion analysis
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/10 p-3 text-sm text-gray-400">
                          ✓ Trust & credibility analysis
                        </div>

                        <div className="rounded-xl border border-white/5 bg-black/10 p-3 text-sm text-gray-400">
                          ✓ Prioritized recommendations
                        </div>

                      </div>

                      <button
                        onClick={() => router.push("/billing")}
                        className="mt-7 rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-xl"
                      >
                        Unlock Premium Analysis
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">

                <button
                  onClick={() => {
                    setResult(null);
                    setError("");
                  }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-gray-300 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Analyze Another Page
                </button>

                <button
                  onClick={() => router.push("/dashboard")}
                  className="rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  Go to Dashboard
                </button>

              </div>

            </div>
          )}

        </div>

        {!loading && !result && (
          <p className="mt-6 text-center text-xs text-gray-600">
            Enter a public landing page URL. Plavtora
            analyzes the page without modifying it.
          </p>
        )}

      </div>

    </main>
  );
}

export default function LandingPageAnalyzer() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050816] px-6 text-white">

          <div className="text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 shadow-xl shadow-blue-500/20">

              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/20 border-t-white" />

            </div>

            <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.22em] text-blue-300/80">
              Plavtora
            </p>

            <p className="mt-2 text-sm text-gray-500">
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