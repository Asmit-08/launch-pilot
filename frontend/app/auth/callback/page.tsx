"use client";

import {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";
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
          const timeout = window.setTimeout(() => {
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
              "Content-Type": "application/json",
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
              message = data.detail;
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
        setStage("session");

        /*
         * -------------------------------------------------------
         * STEP 1 — Restore Supabase session
         * -------------------------------------------------------
         */

        const session =
          await getSessionWithTimeout();

        if (!session) {
          throw new Error(
            "No authenticated session was found. Please try signing in again."
          );
        }

        if (!mounted) return;

        console.log(
          "OAuth session restored:",
          session.user.email
        );

        /*
         * -------------------------------------------------------
         * STEP 2 — Sync user with backend
         * -------------------------------------------------------
         */

        setStage("sync");

        await syncUser(
          session.access_token
        );

        if (!mounted) return;

        /*
         * -------------------------------------------------------
         * STEP 3 — Build destination
         * -------------------------------------------------------
         */

        setStage("workspace");

        const redirect =
          redirectParam &&
          redirectParam.startsWith("/") &&
          !redirectParam.startsWith("//") &&
          redirectParam !== "/auth/callback"
            ? redirectParam
            : "/dashboard";

        let destination = redirect;

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

        console.log(
          "OAuth redirect destination:",
          destination
        );

        /*
         * -------------------------------------------------------
         * STEP 4 — Redirect
         * -------------------------------------------------------
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
   * ERROR SCREEN
   * ---------------------------------------------------------
   */

  if (stage === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
        <div className="w-full max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/[0.06]">
            <span className="text-2xl">
              !
            </span>
          </div>

          <p className="mt-7 text-[11px] uppercase tracking-[0.24em] text-red-300/70">
            Authentication interrupted
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            We couldn't finish signing you in.
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-zinc-500">
            {errorMessage}
          </p>

          <button
            onClick={() =>
              router.replace("/auth")
            }
            className="mt-8 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black"
          >
            Return to Sign In
          </button>
        </div>
      </main>
    );
  }

  /*
   * ---------------------------------------------------------
   * LOADING SCREEN
   * ---------------------------------------------------------
   */

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050505] px-6 text-white">
      <div className="flex w-full max-w-md flex-col items-center text-center">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/[0.07]">
          <span className="text-lg font-semibold text-violet-200">
            P
          </span>
        </div>

        <div className="relative mt-14 flex h-24 w-24 items-center justify-center">

          <div className="absolute inset-0 animate-spin rounded-full border border-transparent border-t-violet-400 border-r-blue-400/30" />

          <div className="h-10 w-10 animate-pulse rounded-full bg-violet-500/[0.08]" />

        </div>

        <p className="mt-9 text-[10px] uppercase tracking-[0.25em] text-violet-300/80">
          {getStageLabel(stage)}
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          {getStageTitle(stage)}
        </h1>

        <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
          {getStageDescription(stage)}
        </p>

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
        </div>

      </div>
    </main>
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
      return "Taking you in";
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
        <main className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-violet-400" />

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