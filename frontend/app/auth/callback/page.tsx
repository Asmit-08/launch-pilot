"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type CallbackStage =
  | "session"
  | "sync"
  | "workspace"
  | "error";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stage, setStage] = useState<CallbackStage>("session");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      try {
        // Give Supabase a moment to finish restoring the OAuth session.
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (cancelled) return;

        setStage("session");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw new Error(
            "We couldn't restore your authentication session."
          );
        }

        if (!session) {
          throw new Error(
            "No authenticated session was found. Please try signing in again."
          );
        }

        if (cancelled) return;

        // ---------------------------------------------------------
        // Sync authenticated user with backend
        // ---------------------------------------------------------

        setStage("sync");

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;

        if (!apiUrl) {
          throw new Error(
            "The application backend is not configured."
          );
        }

        const response = await fetch(
          `${apiUrl}/auth/sync`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "We couldn't finish setting up your account."
          );
        }

        await response.json();

        if (cancelled) return;

        // ---------------------------------------------------------
        // Prepare destination
        // ---------------------------------------------------------

        setStage("workspace");

        const requestedRedirect =
          searchParams.get("redirect");

        const redirect =
          requestedRedirect &&
          requestedRedirect.startsWith("/") &&
          !requestedRedirect.startsWith("//")
            ? requestedRedirect
            : "/dashboard";

        const url = searchParams.get("url");

        let destination = redirect;

        // Preserve the landing-page URL through OAuth.
        if (
          redirect === "/landing_page_analyzer" &&
          url
        ) {
          destination = `${redirect}?url=${encodeURIComponent(
            url
          )}`;
        }

        // Small delay so the final state is actually visible.
        await new Promise((resolve) =>
          setTimeout(resolve, 350)
        );

        if (cancelled) return;

        router.replace(destination);
      } catch (error) {
        if (cancelled) return;

        console.error(
          "Authentication callback failed:",
          error
        );

        setStage("error");

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while finishing authentication."
        );
      }
    }

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  if (stage === "error") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 text-white">
        <Background />

        <div className="relative z-10 w-full max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.06] shadow-[0_0_40px_rgba(248,113,113,0.08)]">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-7 w-7 text-red-300"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path
                d="M12 8v4"
                strokeLinecap="round"
              />
              <path
                d="M12 16h.01"
                strokeLinecap="round"
              />
              <path
                d="M10.3 3.6 2.9 16.5A2 2 0 0 0 4.6 19.5h14.8a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z"
              />
            </svg>
          </div>

          <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.24em] text-red-300/70">
            Authentication interrupted
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
            We couldn't finish signing you in.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
            {errorMessage}
          </p>

          <button
            onClick={() => router.push("/auth")}
            className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:bg-zinc-100"
          >
            Return to Sign In
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 text-white">
      <Background />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.07] shadow-[0_0_45px_rgba(139,92,246,0.12)]">
            <div className="absolute inset-0 rounded-2xl bg-violet-400/10 blur-xl" />

            <span className="relative text-lg font-semibold text-violet-200">
              P
            </span>
          </div>

          <span className="text-xl font-semibold tracking-tight">
            Plavtora
          </span>
        </div>

        {/* Loader */}
        <div className="relative mt-14 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-violet-400/10" />

          <div className="absolute inset-2 rounded-full border border-violet-400/10" />

          <div className="absolute inset-0 animate-[spin_2.8s_linear_infinite] rounded-full border border-transparent border-t-violet-400/80 border-r-blue-400/30" />

          <div className="absolute h-11 w-11 animate-pulse rounded-full bg-violet-500/[0.08] blur-md" />

          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shadow-[0_0_35px_rgba(139,92,246,0.12)]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-300" />
          </div>
        </div>

        {/* Heading */}
        <p className="mt-9 text-[10px] font-medium uppercase tracking-[0.25em] text-violet-300/80">
          {getStageLabel(stage)}
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
          {getStageTitle(stage)}
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
          {getStageDescription(stage)}
        </p>

        {/* Progress */}
        <div className="mt-9 w-full max-w-xs">
          <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-blue-400 via-violet-400 to-fuchsia-400 transition-all duration-700 ${
                stage === "session"
                  ? "w-1/3"
                  : stage === "sync"
                    ? "w-2/3"
                    : "w-full"
              }`}
            />
          </div>

          <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.16em] text-zinc-700">
            <span
              className={
                stage === "session"
                  ? "text-violet-300/70"
                  : ""
              }
            >
              Session
            </span>

            <span
              className={
                stage === "sync"
                  ? "text-violet-300/70"
                  : ""
              }
            >
              Account
            </span>

            <span
              className={
                stage === "workspace"
                  ? "text-violet-300/70"
                  : ""
              }
            >
              Workspace
            </span>
          </div>
        </div>

        <p className="mt-10 text-[10px] text-zinc-700">
          Keep this tab open while we finish setting things up.
        </p>
      </div>

      <style jsx>{`
        @keyframes spin {
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

function Background() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-[-25%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[150px]" />

      <div className="absolute left-[-15%] top-[35%] h-[400px] w-[400px] rounded-full bg-blue-500/[0.04] blur-[130px]" />

      <div className="absolute bottom-[-20%] right-[-10%] h-[450px] w-[450px] rounded-full bg-fuchsia-500/[0.04] blur-[140px]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:56px_56px]" />
    </div>
  );
}

function getStageLabel(stage: CallbackStage) {
  switch (stage) {
    case "session":
      return "Secure authentication";

    case "sync":
      return "Setting up your account";

    case "workspace":
      return "Preparing your workspace";

    default:
      return "Authentication";
  }
}

function getStageTitle(stage: CallbackStage) {
  switch (stage) {
    case "session":
      return "Securing your session";

    case "sync":
      return "Connecting your account";

    case "workspace":
      return "Taking you in";

    default:
      return "Signing you in";
  }
}

function getStageDescription(stage: CallbackStage) {
  switch (stage) {
    case "session":
      return "Verifying your sign-in and restoring your Plavtora session.";

    case "sync":
      return "Connecting your account so your workspace is ready.";

    case "workspace":
      return "Everything is ready. Redirecting you to your workspace.";

    default:
      return "Please wait while we finish authentication.";
  }
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-6 text-white">
          <Background />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.07]">
              <span className="text-lg font-semibold text-violet-200">
                P
              </span>
            </div>

            <div className="mt-8 h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

            <p className="mt-5 text-sm text-zinc-500">
              Preparing Plavtora...
            </p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}