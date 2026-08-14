"use client";

import { supabase } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://launch-pilot-backend.onrender.com";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  website: string | null;
  industry: string | null;
  stage: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditSession {
  id: string;
  project_id: string;
  audit_type: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export interface AuditResult {
  id: string;
  audit_session_id: string;
  overall_score: number;
  product_json: Record<string, any>;
  validation_json: Record<string, any>;
  launch_json: Record<string, any>;
  risk_json: Record<string, any>;
  created_at: string;
}

export interface LatestAudit {
  session: AuditSession;
  result: AuditResult;
}

export interface ProjectWorkspace {
  project: Project;
  latest_audit: LatestAudit | null;
}

// ---------------- Get Project Audit History ---------------- //

export async function getProjectAudits(
  projectId: string
): Promise<any[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `https://launch-pilot-backend.onrender.com/projects/${projectId}/audits`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    throw new Error("Project not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch project audits.");
  }

  return response.json();
}

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User is not authenticated.");
  }

  return session.access_token;
}


// ---------------- Get All Projects ---------------- //

export async function getProjects(): Promise<Project[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(`https://launch-pilot-backend.onrender.com/projects`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch projects.");
  }

  return response.json();
}


// ---------------- Get Project By ID ---------------- //

export async function getProjectById(
  projectId: string
): Promise<ProjectWorkspace> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects/${projectId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    throw new Error("Project not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch project.");
  }

  return response.json();
}

export async function getProjectAudit(
  projectId: string,
  auditId: string
) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects/${projectId}/audits/${auditId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 404) {
    throw new Error("Audit not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch audit.");
  }

  return response.json();
}