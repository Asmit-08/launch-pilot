"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/session";
import {
  signInWithGoogle,
  signInWithGithub,
} from "@/services/auth";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  /*
   * ---------------------------------------------------------
   * Get and validate redirect information
   * ---------------------------------------------------------
   */

  function getAuthRedirect() {
    const params = new URLSearchParams(window.location.search);

    const requestedRedirect = params.get("redirect");
    const requestedUrl = params.get("url");

    const redirect =
      requestedRedirect &&
      requestedRedirect.startsWith("/") &&
      !requestedRedirect.startsWith("//") &&
      requestedRedirect !== "/auth/callback"
        ? requestedRedirect
        : "/dashboard";

    return {
      redirect,
      url: requestedUrl,
    };
  }

  /*
   * ---------------------------------------------------------
   * Redirect already-authenticated users
   * ---------------------------------------------------------
   */

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();

      if (!session) {
        return;
      }

      const { redirect, url } = getAuthRedirect();

      let destination = redirect;

      if (redirect === "/landing_page_analyzer" && url) {
        destination = `${redirect}?url=${encodeURIComponent(url)}`;
      }

      router.replace(destination);
    }

    checkSession();
  }, [router]);

  /*
   * ---------------------------------------------------------
   * Google
   * ---------------------------------------------------------
   */

  function handleGoogleSignIn() {
    const { redirect, url } = getAuthRedirect();

    signInWithGoogle(
      redirect,
      url
        ? {
            url,
          }
        : undefined
    );
  }

  /*
   * ---------------------------------------------------------
   * GitHub
   * ---------------------------------------------------------
   */

  function handleGithubSignIn() {
    const { redirect, url } = getAuthRedirect();

    signInWithGithub(
      redirect,
      url
        ? {
            url,
          }
        : undefined
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f7f5] px-5 py-10 text-[#111113] sm:px-6">
      {/* ---------------------------------------------------
          Background
      --------------------------------------------------- */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-violet-200/30 blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-180px] h-[550px] w-[550px] rounded-full bg-blue-200/25 blur-[150px]" />

        <div className="absolute bottom-[-220px] left-[-180px] h-[450px] w-[450px] rounded-full bg-amber-100/25 blur-[140px]" />
      </div>

      {/* ---------------------------------------------------
          Subtle grid
      --------------------------------------------------- */}

      <div className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(17,17,19,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,19,0.035)_1px,transparent_1px)] [background-size:48px_48px]" />

      {/* ---------------------------------------------------
          Main layout
      --------------------------------------------------- */}

      <div className="relative z-10 grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        {/* -------------------------------------------------
            Left context panel
        ------------------------------------------------- */}

        <div className="hidden lg:block">
          <div className="max-w-lg">
            {/* Brand */}

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm">
                <img
                  src="/icon.png"
                  alt="Plavtora"
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="text-lg font-semibold tracking-[-0.025em]">
                Plavtora
              </span>
            </div>

            {/* Main message */}

            <div className="mt-16">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-600">
                Startup intelligence
              </p>

              <h1 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] xl:text-6xl">
                Build with more
                <span className="block text-zinc-400">
                  certainty.
                </span>
              </h1>

              <p className="mt-7 max-w-md text-[16px] leading-7 text-zinc-600">
                Plavtora challenges your product, validation, positioning,
                launch readiness, and risks before the market does.
              </p>
            </div>

            {/* Product signals */}

            <div className="mt-10 grid max-w-md grid-cols-2 gap-2">
              {[
                "Product analysis",
                "Validation",
                "Launch readiness",
                "Risk analysis",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-black/[0.07] bg-white/65 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />

                    <span className="text-xs font-medium text-zinc-700">
                      {item}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Trust statement */}

            <div className="mt-8 flex items-center gap-2 text-xs text-zinc-400">
              <ShieldCheck size={15} />

              <span>
                Your startup data stays private.
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------
            Auth card
        ------------------------------------------------- */}

        <div className="w-full">
          {/* Mobile brand */}

          <div className="mb-8 flex flex-col items-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm">
              <img
                src="/icon.png"
                alt="Plavtora"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="mt-3 text-lg font-semibold tracking-[-0.025em]">
              Plavtora
            </span>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[30px] border border-black/[0.08] bg-white/90 p-7 shadow-[0_25px_80px_rgba(17,17,19,0.09)] backdrop-blur-xl sm:p-9">
            {/* Header */}

            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#111113] text-white shadow-sm">
                <span className="text-lg font-semibold">
                  P
                </span>
              </div>

              <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">
                Welcome to Plavtora
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-zinc-500">
                Your startup's second opinion. Sign in to run audits,
                save your results, and continue your analysis.
              </p>
            </div>

            {/* Google */}

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="group mt-8 flex h-12 w-full items-center justify-between rounded-xl border border-black/[0.09] bg-[#111113] px-4.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(17,17,19,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-black hover:shadow-[0_15px_30px_rgba(17,17,19,0.16)]"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                  <FaGoogle className="text-sm text-[#111113]" />
                </span>

                <span>Continue with Google</span>
              </div>

              <ArrowRight
                size={17}
                className="text-white/45 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white"
              />
            </button>

            {/* GitHub
            <button
              type="button"
              onClick={handleGithubSignIn}
              className="group mt-3 flex h-12 w-full items-center justify-between rounded-xl border border-black/[0.09] bg-white px-4.5 text-sm font-semibold text-zinc-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-zinc-50"
            >
              <div className="flex items-center gap-3">
                <FaGithub className="text-lg" />
                <span>Continue with GitHub</span>
              </div>

              <ArrowRight
                size={17}
                className="text-zinc-400 transition-transform duration-200 group-hover:translate-x-1"
              />
            </button>
            */}

            {/* Divider */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-black/[0.07]" />

              <span className="text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                Secure sign in
              </span>

              <div className="h-px flex-1 bg-black/[0.07]" />
            </div>

            {/* What happens next */}

            <div className="rounded-2xl border border-black/[0.07] bg-[#f7f7f5] p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-violet-600 shadow-sm">
                  <ShieldCheck size={15} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-zinc-800">
                    What you'll get
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Access your startup audits, AI Co-Founder conversations,
                    analysis history, and dashboard from one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Privacy */}

            <p className="mt-6 text-center text-[11px] leading-5 text-zinc-400">
              By continuing, you agree to use Plavtora responsibly.
              <br />
              Your startup data is kept private.
            </p>

            {/* Back */}

            <button
              type="button"
              onClick={() => router.push("/")}
              className="mx-auto mt-6 flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-900"
            >
              ← Back to Plavtora
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}