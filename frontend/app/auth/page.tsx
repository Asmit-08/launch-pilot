"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/services/session";
import {
  signInWithGoogle,
  signInWithGithub,
} from "@/services/auth";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { ArrowRight } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();

  /*
   * ---------------------------------------------------------
   * Get and validate redirect information
   * ---------------------------------------------------------
   */

  function getAuthRedirect() {
    const params = new URLSearchParams(
      window.location.search
    );

    const requestedRedirect =
      params.get("redirect");

    const requestedUrl =
      params.get("url");

    const redirect =
      requestedRedirect &&
      requestedRedirect.startsWith("/") &&
      !requestedRedirect.startsWith("//")
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

      const { redirect, url } =
        getAuthRedirect();

      let destination = redirect;

      /*
       * Preserve the landing-page URL when returning
       * to the analyzer.
       */

      if (
        redirect === "/landing_page_analyzer" &&
        url
      ) {
        destination =
          `${redirect}?url=${encodeURIComponent(url)}`;
      }

      console.log(
        "Authenticated user redirect:",
        destination
      );

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
    const { redirect, url } =
      getAuthRedirect();

    signInWithGoogle(
      redirect,
      url
        ? { url }
        : undefined
    );
  }

  /*
   * ---------------------------------------------------------
   * GitHub
   * ---------------------------------------------------------
   */

  function handleGithubSignIn() {
    const { redirect, url } =
      getAuthRedirect();

    signInWithGithub(
      redirect,
      url
        ? { url }
        : undefined
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-6">

      {/* Background */}
      <div className="absolute inset-0">

        <div className="absolute left-1/2 top-[-180px] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[160px]" />

        <div className="absolute bottom-[-120px] right-[-80px] h-[420px] w-[420px] rounded-full bg-violet-600/20 blur-[140px]" />

        <div className="absolute bottom-10 left-[-100px] h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[120px]" />

      </div>

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-10 shadow-[0_0_80px_rgba(0,0,0,.45)] backdrop-blur-xl">

        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">

          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-500 shadow-2xl">

            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              className="h-10 w-10"
            >
              <path d="M5 19L19 5" />
              <path d="M12 5h7v7" />
            </svg>

          </div>

          <h1 className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-4xl font-bold text-transparent">
            Launch Pilot
          </h1>

          <p className="mt-4 text-center text-sm leading-7 text-gray-400">
            Your AI co-founder for launching SaaS.
            <br />
            Save audits, continue conversations,
            and launch with confidence.
          </p>

        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="group mb-4 flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white px-5 py-4 font-medium text-black transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >

          <div className="flex items-center gap-3">
            <FaGoogle className="text-lg" />
            Continue with Google
          </div>

          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />

        </button>

        {/* GitHub */}
        {/*
        <button
          type="button"
          onClick={handleGithubSignIn}
          className="group flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#1c2535]"
        >
          <div className="flex items-center gap-3">
            <FaGithub className="text-lg" />
            Continue with GitHub
          </div>

          <ArrowRight
            size={18}
            className="transition-transform group-hover:translate-x-1"
          />
        </button>
        */}

        {/* Divider */}
        <div className="my-8 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Features */}
        <div className="grid grid-cols-3 gap-2 text-center">

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-lg">🚀</p>

            <p className="mt-2 text-xs text-gray-300">
              AI Audits
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-lg">💬</p>

            <p className="mt-2 text-xs text-gray-300">
              Chat History
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-lg">📈</p>

            <p className="mt-2 text-xs text-gray-300">
              Dashboard
            </p>
          </div>

        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs leading-6 text-gray-500">
          Secure authentication powered by Google.
          <br />
          Your data stays private.
        </p>

      </div>
    </main>
  );
}