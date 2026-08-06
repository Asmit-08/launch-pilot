"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error(error);
        return;
      }

      if (!session) {
        console.error("No session found.");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:8000/auth/sync`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to sync user.");
        }

        const profile = await response.json();

        router.push("/dashboard");
      } catch (err) {
        console.error(err);
      }
    }

    handleCallback();
  }, [router]);

  return <p>Signing you in...</p>;
}