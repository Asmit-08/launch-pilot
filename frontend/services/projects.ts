"use client";

import { supabase } from "@/lib/supabase";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://launch-pilot-backend.onrender.com";

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

/* =========================================================
   V2 TYPES
   ========================================================= */

export interface DailyObjectiveConstraint {
  id: string;
  project_id: string;
  claim: string;
  type: string;
  status: string;
  confidence: number;
}

export interface DailyObjectiveState {
  project_id: string;
  stage: string;
  one_liner: string;
  current_constraint_belief_id: string | null;
  why_this_constraint: string | null;
  active_objective_id: string | null;
  active_experiment_id: string | null;
  updated_at: string;
}

export interface DailyObjective {
  id: string;
  project_id: string;
  constraint_belief_id: string;
  text: string;
  action: string;
  target_count: number;
  evidence_kind: string;
  success_criteria: string;
  failure_criteria: string;
  do_not_do: string;
  status: string;
  created_at: string;
  due_at: string;
  completed_at: string | null;
}

export interface DailyObjectiveResponse {
  project_id: string;
  has_active_objective: boolean;
  state: DailyObjectiveState;
  constraint: DailyObjectiveConstraint | null;
  objective: DailyObjective | null;
}

export interface ObjectiveOutcomePayload {
  completion_status:
    | "completed"
    | "success"
    | "partial"
    | "failed"
    | "not_completed";

  quantity: number;

  observations: string;

  evidence?: string | null;

  user_interpretation?: string | null;

  unexpected_result?: string | null;
}

/* =========================================================
   AUTH
   ========================================================= */

async function getAccessToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User is not authenticated.");
  }

  return session.access_token;
}

/* =========================================================
   GET PROJECT AUDIT HISTORY
   ========================================================= */

export async function getProjectAudits(
  projectId: string
): Promise<any[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects/${projectId}/audits`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (response.status === 404) {
    throw new Error("Project not found.");
  }

  if (!response.ok) {
    throw new Error(
      "Failed to fetch project audits."
    );
  }

  return response.json();
}

/* =========================================================
   GET ALL PROJECTS
   ========================================================= */

export async function getProjects(): Promise<Project[]> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (!response.ok) {
    throw new Error("Failed to fetch projects.");
  }

  return response.json();
}

/* =========================================================
   GET PROJECT BY ID
   ========================================================= */

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

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (response.status === 404) {
    throw new Error("Project not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch project.");
  }

  return response.json();
}

/* =========================================================
   GET PROJECT AUDIT
   ========================================================= */

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

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (response.status === 404) {
    throw new Error("Audit not found.");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch audit.");
  }

  return response.json();
}

/* =========================================================
   V2 — GET DAILY OBJECTIVE
   ========================================================= */

export async function getDailyObjective(
  projectId: string
): Promise<DailyObjectiveResponse> {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects/${projectId}/daily-objective`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  if (response.status === 404) {
    throw new Error(
      "Daily Objective is not initialized for this project yet."
    );
  }

  if (!response.ok) {
    throw new Error(
      "Failed to fetch Daily Objective."
    );
  }

  return response.json();
}

/* =========================================================
   V2 — SUBMIT DAILY OBJECTIVE OUTCOME
   ========================================================= */

export async function submitObjectiveOutcome(
  projectId: string,
  payload: ObjectiveOutcomePayload
) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${API_URL}/projects/${projectId}/daily-objective/outcome`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    }
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "Your session has expired. Please sign in again."
    );
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    // Ignore malformed response.
  }

  if (!response.ok) {
    if (typeof data?.detail === "string") {
      throw new Error(data.detail);
    }

    throw new Error(
      "Failed to submit objective outcome."
    );
  }

  return data;
}