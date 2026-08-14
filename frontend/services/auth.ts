"use client";

import { supabase } from "@/lib/supabase";

/**
 * Sign in with Google.
 *
 * redirectPath:
 *   The internal page the user should return to after OAuth.
 *
 * redirectParams:
 *   Optional query parameters that should also survive OAuth.
 *
 * Example:
 *
 * /auth?redirect=/landing-page-analyzer&url=https://example.com
 *        ↓
 * Google OAuth
 *        ↓
 * /auth/callback?redirect=/landing-page-analyzer&url=https://example.com
 *        ↓
 * /landing-page-analyzer?url=https://example.com
 */
export async function signInWithGoogle(
  redirectPath?: string,
  redirectParams?: Record<string, string>
) {
  const callbackUrl = new URL(
    `${window.location.origin}/auth/callback`
  );

  if (redirectPath) {
    callbackUrl.searchParams.set(
      "redirect",
      redirectPath
    );
  }

  if (redirectParams) {
    Object.entries(redirectParams).forEach(
      ([key, value]) => {
        callbackUrl.searchParams.set(
          key,
          value
        );
      }
    );
  }

  console.log(
    "OAuth callback URL:",
    callbackUrl.toString()
  );

  const { error } =
    await supabase.auth.signInWithOAuth({
      provider: "google",

      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

  if (error) {
    console.error(
      "Google sign in failed:",
      error
    );
  }
}


/**
 * Sign in with GitHub.
 *
 * Same redirect behavior as Google.
 */
export async function signInWithGithub(
  redirectPath?: string,
  redirectParams?: Record<string, string>
) {
  const callbackUrl = new URL(
    `${window.location.origin}/auth/callback`
  );

  if (redirectPath) {
    callbackUrl.searchParams.set(
      "redirect",
      redirectPath
    );
  }

  if (redirectParams) {
    Object.entries(redirectParams).forEach(
      ([key, value]) => {
        callbackUrl.searchParams.set(
          key,
          value
        );
      }
    );
  }

  const { error } =
    await supabase.auth.signInWithOAuth({
      provider: "github",

      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

  if (error) {
    console.error(
      "GitHub sign in failed:",
      error
    );
  }
}


/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } =
    await supabase.auth.signOut();

  if (error) {
    console.error(
      "Sign out failed:",
      error
    );
  }
}