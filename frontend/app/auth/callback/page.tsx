"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import { supabase } from "@/lib/supabase";

type CallbackStage =
  | "session"
  | "sync"
  | "workspace"
  | "error";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasStarted = useRef(false);

  const [stage, setStage] =
    useState<CallbackStage>("session");

  const [errorMessage, setErrorMessage] =
    useState("");

  const redirectParam =
    searchParams.get("redirect");

  const urlParam =
    searchParams.get("url");

  useEffect(() => {
    if (hasStarted.current) return;

    hasStarted.current = true;

    let mounted = true;

    async function getSessionWithTimeout(
      timeoutMs = 10000
    ) {
      return new Promise<any>(
        async (resolve, reject) => {
          const timeout =
            window.setTimeout(() => {
              reject(
                new Error(
                  "Authentication took too long. Please try signing in again."
                )
              );
            }, timeoutMs);

          try {
            const {
              data,
              error,
            } = await supabase.auth.getSession();

            window.clearTimeout(timeout);

            if (error) {
              reject(error);
              return;
            }

            resolve(data.session);
          } catch (error) {
            window.clearTimeout(timeout);
            reject(error);
          }
        }
      );
    }

    async function syncUser(
      accessToken: string
    ) {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "The application backend is not configured."
        );
      }

      const controller =
        new AbortController();

      const timeout = window.setTimeout(() => {
        controller.abort();
      }, 10000);

      try {
        const response = await fetch(
          `${apiUrl}/auth/sync`,
          {
            method: "POST",

            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type":
                "application/json",
            },

            signal: controller.signal,
          }
        );

        if (!response.ok) {
          let message =
            "We couldn't finish setting up your account.";

          try {
            const data =
              await response.json();

            if (data?.detail) {
              message =
                typeof data.detail ===
                "string"
                  ? data.detail
                  : message;
            }
          } catch {
            // Ignore malformed error response.
          }

          throw new Error(message);
        }

        return await response.json();
      } catch (error) {
        if (
          error instanceof DOMException &&
          error.name === "AbortError"
        ) {
          throw new Error(
            "Setting up your account took too long. Please try again."
          );
        }

        throw error;
      } finally {
        window.clearTimeout(timeout);
      }
    }

    async function handleCallback() {
      try {
        /*
         * ------------------------------------------------------
         * STEP 1 — Restore Supabase session
         * ------------------------------------------------------
         */

        setStage("session");

        const session =
          await getSessionWithTimeout();

        if (!session) {
          throw new Error(
            "No authenticated session was found. Please try signing in again."
          );
        }

        if (!mounted) return;

        /*
         * ------------------------------------------------------
         * STEP 2 — Sync user with backend
         * ------------------------------------------------------
         */

        setStage("sync");

        await syncUser(
          session.access_token
        );

        if (!mounted) return;

        /*
         * ------------------------------------------------------
         * STEP 3 — Build destination
         * ------------------------------------------------------
         */

        setStage("workspace");

        const redirect =
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.startsWith("//") &&
          redirectParam !==
            "/auth/callback"
            ? redirectParam
            : "/dashboard";

        let destination = redirect;

        /*
         * Preserve analyzer URL after OAuth.
         */

        if (
          redirect ===
            "/landing_page_analyzer" &&
          urlParam
        ) {
          const params =
            new URLSearchParams();

          params.set("url", urlParam);

          destination =
            `${redirect}?${params.toString()}`;
        }

        /*
         * ------------------------------------------------------
         * STEP 4 — Redirect
         * ------------------------------------------------------
         */

        router.replace(destination);
      } catch (error) {
        console.error(
          "AUTH CALLBACK ERROR:",
          error
        );

        if (!mounted) return;

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
      mounted = false;
    };
  }, [
    router,
    redirectParam,
    urlParam,
  ]);

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (stage === "error") {
    return (
      <main className="min-h-screen bg-[#f7f8fc] px-6 text-slate-950">
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5 sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <TriangleAlert size={24} />
            </div>

            <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-red-600">
              Authentication interrupted
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
              We couldn't finish signing you in.
            </h1>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() =>
                router.replace("/auth")
              }
              className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Return to Sign In
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-6 text-slate-950">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-100 blur-[150px]" />

        <div className="absolute bottom-[-160px] right-[-100px] h-[420px] w-[420px] rounded-full bg-blue-100 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md text-center">
          {/* Brand */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <span className="text-lg font-bold">
              P
            </span>
          </div>

          {/* Animated icon */}
          <div className="relative mx-auto mt-10 flex h-20 w-20 items-center justify-center">
            <div className="absolute inset-0 rounded-3xl border border-slate-200 bg-white shadow-sm" />

            <div className="absolute inset-1 rounded-[22px] border border-transparent border-t-violet-500 animate-spin" />

            <Sparkles
              size={24}
              className="relative text-violet-600"
            />
          </div>

          {/* Stage */}
          <p className="mt-8 text-[10px] font-bold uppercase tracking-[0.22em] text-violet-600">
            {getStageLabel(stage)}
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
            {getStageTitle(stage)}
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-slate-500">
            {getStageDescription(stage)}
          </p>

          {/* Progress */}
          <div className="mx-auto mt-8 max-w-xs">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-950 transition-all duration-700"
                style={{
                  width:
                    stage === "session"
                      ? "33%"
                      : stage === "sync"
                        ? "66%"
                        : "100%",
                }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="mx-auto mt-8 max-w-sm space-y-2 text-left">
            <CallbackStep
              title="Restore secure session"
              active={
                stage === "session"
              }
              complete={
                stage === "sync" ||
                stage === "workspace"
              }
            />

            <CallbackStep
              title="Sync your Plavtora account"
              active={stage === "sync"}
              complete={
                stage === "workspace"
              }
            />

            <CallbackStep
              title="Prepare your workspace"
              active={
                stage === "workspace"
              }
              complete={false}
            />
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck size={13} />
            Secure authentication
          </div>
        </div>
      </div>
    </main>
  );
}

function CallbackStep({
  title,
  active,
  complete,
}: {
  title: string;
  active: boolean;
  complete: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : complete
            ? "border-emerald-100 bg-emerald-50"
            : "border-slate-200 bg-white"
      }`}
    >
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          active
            ? "bg-white/10"
            : complete
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-400"
        }`}
      >
        {complete ? (
          <Check size={14} />
        ) : active ? (
          <Loader2
            size={14}
            className="animate-spin"
          />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
        )}
      </div>

      <span
        className={`text-sm font-medium ${
          active
            ? "text-white"
            : complete
              ? "text-emerald-800"
              : "text-slate-500"
        }`}
      >
        {title}
      </span>
    </div>
  );
}

function getStageLabel(
  stage: CallbackStage
) {
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

function getStageTitle(
  stage: CallbackStage
) {
  switch (stage) {
    case "session":
      return "Securing your session";
    case "sync":
      return "Connecting your account";
    case "workspace":
      return "Preparing your workspace";
    default:
      return "Signing you in";
  }
}

function getStageDescription(
  stage: CallbackStage
) {
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
        <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
          <div className="text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <Loader2
                size={20}
                className="animate-spin"
              />
            </div>

            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Plavtora
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Preparing your workspace...
            </p>
          </div>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}