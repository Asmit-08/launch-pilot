"use client";

import { supabase } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://launch-pilot-backend.onrender.com";

export interface UsageResource {
  used: number;
  limit: number;
  remaining: number;
}

export interface UsageStatus {
  plan: string;

  usage: {
    audits: UsageResource;
    chat_messages: UsageResource;
    personas: UsageResource;
    landing_page_analyses: UsageResource;
  };

  ai: {
    requests_used: number;
    tokens_used: number;
  };

  period_start: string;
}

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User is not authenticated.");
  }

  return session.access_token;
}

export async function getUsage(): Promise<UsageStatus> {
  const accessToken = await getAccessToken();

  const response = await fetch(`${API_URL}/usage`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch usage.");
  }

  return response.json();
}