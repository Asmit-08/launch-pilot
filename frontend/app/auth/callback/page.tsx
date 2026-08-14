"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Give Supabase a moment to establish the OAuth session.
        await new Promise((resolve) =>
          setTimeout(resolve, 300)
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Failed to get OAuth session:",
            error
          );
          return;
        }

        if (!session) {
          console.error(
            "No authenticated session found after OAuth."
          );
          return;
        }

        console.log(
          "OAuth session established successfully."
        );

        // ---------------------------------------------------------
        // Sync authenticated user with backend
        // ---------------------------------------------------------

        const response = await fetch(
          "http://localhost:8000/auth/sync",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to sync user with backend."
          );
        }

        await response.json();

        // ---------------------------------------------------------
        // Determine where the user should go
        // ---------------------------------------------------------

        const requestedRedirect =
          searchParams.get("redirect");

        const redirect =
          requestedRedirect &&
          requestedRedirect.startsWith("/") &&
          !requestedRedirect.startsWith("//")
            ? requestedRedirect
            : "/dashboard";

        // ---------------------------------------------------------
        // Preserve URL for Landing Page Analyzer
        // ---------------------------------------------------------

        const url = searchParams.get("url");

        let destination = redirect;

        if (
          redirect === "/landing_page_analyzer" &&
          url
        ) {
          destination = `${redirect}?url=${encodeURIComponent(
            url
          )}`;
        }

        console.log(
          "Auth callback redirect:",
          destination
        );

        router.replace(destination);
      } catch (error) {
        console.error(
          "Authentication callback failed:",
          error
        );
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <p className="text-lg font-medium">
          Signing you in...
        </p>

        <p className="mt-2 text-sm text-gray-400">
          Please wait while we finish authentication.
        </p>
      </div>
    </main>
  );
}