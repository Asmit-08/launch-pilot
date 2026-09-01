"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import {
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ExternalLink,
  FolderGit2,
  Loader2,
  Package,
  Rocket,
  Send,
  ShieldAlert,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

import {
  getProjectById,
  getDailyObjective,
  submitObjectiveOutcome,
  Project,
  LatestAudit,
  DailyObjectiveResponse,
} from "@/services/projects";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] =
    useState<Project | null>(null);

  const [latestAudit, setLatestAudit] =
    useState<LatestAudit | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState("Overview");

  const [message, setMessage] =
    useState("");

  const [messages, setMessages] = useState<
    {
      role: "user" | "assistant";
      content: string;
    }[]
  >([]);

  const [isTyping, setIsTyping] =
    useState(false);

  const [chatError, setChatError] =
    useState<string | null>(null);

  const [navigationLoading, setNavigationLoading] =
    useState<string | null>(null);

  /* =========================================================
     DAILY OBJECTIVE STATE
     ========================================================= */

  const [dailyObjective, setDailyObjective] =
    useState<DailyObjectiveResponse | null>(null);

  const [dailyObjectiveLoading, setDailyObjectiveLoading] =
    useState(true);

  const [dailyObjectiveError, setDailyObjectiveError] =
    useState<string | null>(null);

  const [showOutcomeForm, setShowOutcomeForm] =
    useState(false);

  const [outcomeSubmitting, setOutcomeSubmitting] =
    useState(false);

  const [outcomeError, setOutcomeError] =
    useState<string | null>(null);

  const [completionStatus, setCompletionStatus] =
    useState<
      "completed" |
      "success" |
      "partial" |
      "failed" |
      "not_completed"
    >("completed");

  const [quantity, setQuantity] =
    useState(1);

  const [observations, setObservations] =
    useState("");

  const [evidence, setEvidence] =
    useState("");

  const [userInterpretation, setUserInterpretation] =
    useState("");

  const [unexpectedResult, setUnexpectedResult] =
    useState("");

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     LOAD PROJECT + DAILY OBJECTIVE
     ========================================================= */

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setError(null);
        setDailyObjectiveLoading(true);
        setDailyObjectiveError(null);

        const workspace =
          await getProjectById(projectId);

        setProject(workspace.project);
        setLatestAudit(
          workspace.latest_audit
        );

        try {
          const objectiveData =
            await getDailyObjective(projectId);

          setDailyObjective(objectiveData);
        } catch (objectiveError) {
          console.error(
            "Failed to load Daily Objective:",
            objectiveError
          );

          setDailyObjectiveError(
            objectiveError instanceof Error
              ? objectiveError.message
              : "Failed to load Daily Objective."
          );
        } finally {
          setDailyObjectiveLoading(false);
        }
      } catch (error) {
        console.error(
          "Failed to load project:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load project."
        );

        setDailyObjectiveLoading(false);
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  /* =========================================================
     CHAT SCROLL
     ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  /* =========================================================
     NAVIGATION
     ========================================================= */

  const handleNavigation = (
    key: string,
    href: string
  ) => {
    if (navigationLoading) return;

    if (href === "#") {
      setActiveTab("Chat");
      return;
    }

    setNavigationLoading(key);
    router.push(href);
  };

  /* =========================================================
     DAILY OBJECTIVE SUBMISSION
     ========================================================= */

  const handleSubmitObjective = async () => {
    if (
      !project ||
      !dailyObjective?.objective ||
      outcomeSubmitting
    ) {
      return;
    }

    if (!observations.trim()) {
      setOutcomeError(
        "Tell us what actually happened before submitting."
      );

      return;
    }

    if (quantity < 1) {
      setOutcomeError(
        "Quantity must be at least 1."
      );

      return;
    }

    setOutcomeError(null);
    setOutcomeSubmitting(true);

    try {
      const result =
  await submitObjectiveOutcome(
    project.id,
    {
      completion_status:
        completionStatus,
      quantity,
      observations:
        observations.trim(),
      evidence:
        evidence.trim() || null,
      user_interpretation:
        userInterpretation.trim() ||
        null,
      unexpected_result:
        unexpectedResult.trim() ||
        null,
    }
  );

setShowOutcomeForm(false);

setObservations("");
setEvidence("");
setUserInterpretation("");
setUnexpectedResult("");
setQuantity(1);
setCompletionStatus("completed");

/*
 * The outcome response already contains the next decision state.
 * Update the UI immediately from that response.
 */

const nextObjective =
  result?.transition?.next_objective;

const nextBelief =
  result?.transition?.next_belief;

const nextState =
  result?.transition?.state;

if (nextObjective) {
  setDailyObjective({
    project_id: project.id,
    has_active_objective: true,
    state: nextState,
    constraint: nextBelief,
    objective: nextObjective,
  });
} else {
  setDailyObjective({
    project_id: project.id,
    has_active_objective: false,
    state: nextState,
    constraint: null,
    objective: null,
  });
}
    } catch (error) {
      console.error(
        "Objective submission failed:",
        error
      );

      setOutcomeError(
        error instanceof Error
          ? error.message
          : "Failed to submit objective outcome."
      );
    } finally {
      setOutcomeSubmitting(false);
    }
  };

  /* =========================================================
     CHAT ERROR HANDLING
     ========================================================= */

  const getChatErrorMessage = (
    errorData: any,
    responseStatus: number
  ) => {
    if (
      responseStatus === 401 ||
      responseStatus === 403
    ) {
      return "Your session has expired. Please sign in again.";
    }

    if (
      errorData?.detail &&
      typeof errorData.detail ===
        "object" &&
      errorData.detail.error ===
        "usage_limit_reached"
    ) {
      const resource =
        errorData.detail.resource ||
        "chat_messages";

      const used =
        errorData.detail.used ?? 0;

      const limit =
        errorData.detail.limit ?? 0;

      const plan =
        errorData.detail.plan ||
        "free";

      return `You've reached your ${plan} ${resource.replace(
        /_/g,
        " "
      )} limit (${used}/${limit}).`;
    }

    if (
      typeof errorData?.detail ===
      "string"
    ) {
      return errorData.detail;
    }

    if (
      typeof errorData?.error ===
      "string"
    ) {
      return errorData.error;
    }

    if (
      typeof errorData?.message ===
      "string"
    ) {
      return errorData.message;
    }

    return `Chat request failed (${responseStatus}).`;
  };

  /* =========================================================
     CHAT
     ========================================================= */

  const handleSendMessage = async () => {
    if (
      !message.trim() ||
      !project ||
      isTyping
    ) {
      return;
    }

    const currentMessage =
      message.trim();

    setChatError(null);

    const userMessage = {
      role: "user" as const,
      content: currentMessage,
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setMessage("");
    setIsTyping(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setMessages(messages);
        setMessage(currentMessage);
        router.push("/auth");
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "The backend URL is not configured."
        );
      }

      const auditResult =
        latestAudit?.result;

      const response = await fetch(
        `${apiUrl}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: currentMessage,
            audit_result:
              auditResult
                ? {
                    overall_score:
                      auditResult.overall_score,
                    product:
                      auditResult.product_json,
                    validation:
                      auditResult.validation_json,
                    launch_readiness:
                      auditResult.launch_json,
                    risk:
                      auditResult.risk_json,
                  }
                : {},
            startup_data: {
              id: project.id,
              name: project.name,
              description:
                project.description,
              website:
                project.website,
              industry:
                project.industry,
              stage:
                project.stage,
            },
            chat_history:
              updatedMessages,
          }),
        }
      );

      if (!response.ok) {
        let errorData: any = null;

        try {
          errorData =
            await response.json();
        } catch {
          // Ignore malformed response.
        }

        const errorMessage =
          getChatErrorMessage(
            errorData,
            response.status
          );

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          await supabase.auth.signOut();

          setMessages(messages);
          setMessage(currentMessage);

          router.push("/auth");
          return;
        }

        if (
          errorData?.detail &&
          typeof errorData.detail ===
            "object" &&
          errorData.detail.error ===
            "usage_limit_reached"
        ) {
          setMessages(messages);
          setMessage(currentMessage);
          setChatError(errorMessage);
          return;
        }

        throw new Error(
          errorMessage
        );
      }

      const data =
        await response.json();

      const assistantResponse =
        typeof data.response ===
        "string"
          ? data.response
          : typeof data.message ===
              "string"
            ? data.message
            : typeof data.content ===
                "string"
              ? data.content
              : null;

      if (!assistantResponse) {
        throw new Error(
          "The AI responded, but no message was returned by the backend."
        );
      }

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            assistantResponse,
        },
      ]);
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages(messages);
      setMessage(currentMessage);

      setChatError(
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting your AI Co-Founder."
      );
    } finally {
      setIsTyping(false);
    }
  };

  /* =========================================================
     LOADING / ERROR
     ========================================================= */

  if (loading) {
    return <ProjectLoader />;
  }

  if (error || !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-6">
        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <TriangleAlert size={24} />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Project not found
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "This project does not exist or you don't have access to it."}
          </p>

          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "error-dashboard",
                "/dashboard"
              )
            }
            disabled={
              !!navigationLoading
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            {navigationLoading ===
              "error-dashboard" && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  const auditResult =
    latestAudit?.result;

  const productScore = getScore(
    auditResult?.product_json
  );

  const validationScore =
    getScore(
      auditResult?.validation_json
    );

  const launchScore = getScore(
    auditResult?.launch_json
  );

  const riskScore = getScore(
    auditResult?.risk_json
  );

  const overallScore =
    Number(
      auditResult?.overall_score ?? 0
    );

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      {/* Header */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              router.push(
                "/dashboard"
              )
            }
            className="group flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft
              size={17}
              className="transition-transform group-hover:-translate-x-1"
            />
            Dashboard
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            <img
              src="/icon.png"
              alt="Plavtora"
              className="h-8 w-8 rounded-lg"
            />

            <span className="text-sm font-bold tracking-tight text-slate-900">
              Plavtora
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              latestAudit
                ? handleNavigation(
                    "latest-audit",
                    `/projects/${projectId}/audits/${latestAudit.session.id}`
                  )
                : handleNavigation(
                    "run-audit",
                    "/audit"
                  )
            }
            disabled={
              !!navigationLoading
            }
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-600"
          >
            {(navigationLoading ===
              "latest-audit" ||
              navigationLoading ===
                "run-audit") && (
              <Loader2
                size={14}
                className="animate-spin"
              />
            )}

            {latestAudit
              ? "Open Full Audit"
              : "Run Audit"}
          </button>
        </div>
      </header>

      {/* Project context */}

      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm sm:h-16 sm:w-16">
                <FolderGit2
                  size={27}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-[-0.03em] text-slate-950 sm:text-3xl">
                    {project.name}
                  </h1>

                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    {project.stage}
                  </span>
                </div>

                {project.description && (
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    {project.description}
                  </p>
                )}

                {project.website && (
                  <a
                    href={
                      project.website
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                  >
                    {project.website}
                    <ExternalLink
                      size={13}
                    />
                  </a>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleNavigation(
                    "audits-tab",
                    `/projects/${projectId}/audits`
                  )
                }
                disabled={
                  !!navigationLoading
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Audit history
              </button>

              <button
                type="button"
                onClick={() =>
                  latestAudit
                    ? handleNavigation(
                        "latest-audit",
                        `/projects/${projectId}/audits/${latestAudit.session.id}`
                      )
                    : handleNavigation(
                        "run-audit",
                        "/audit"
                      )
                }
                disabled={
                  !!navigationLoading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                {latestAudit
                  ? "Open latest audit"
                  : "Run first audit"}
                <ArrowRight
                  size={15}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation */}

      <nav className="mx-auto mt-7 max-w-7xl overflow-x-auto px-5 sm:px-6 lg:px-8">
        <div className="flex min-w-max gap-1 border-b border-slate-200">
          <ProjectTab
            label="Overview"
            active={
              activeTab ===
              "Overview"
            }
            onClick={() =>
              setActiveTab(
                "Overview"
              )
            }
          />

          <ProjectTab
            label="Audits"
            active={
              activeTab ===
              "Audits"
            }
            onClick={() =>
              handleNavigation(
                "audits-tab",
                `/projects/${projectId}/audits`
              )
            }
          />

          <ProjectTab
            label="ICP Analysis"
            badge="New"
            onClick={() =>
              handleNavigation(
                "icp-tab",
                "/persona"
              )
            }
          />

          <ProjectTab
            label="Landing Page"
            badge="New"
            onClick={() =>
              handleNavigation(
                "landing-tab",
                "/landing_page_analyzer"
              )
            }
          />

          <ProjectTab
            label="Roadmap"
            badge="Soon"
            active={
              activeTab ===
              "Roadmap"
            }
            onClick={() =>
              setActiveTab(
                "Roadmap"
              )
            }
          />

          <ProjectTab
            label="AI Co-Founder"
            active={
              activeTab ===
              "Chat"
            }
            onClick={() =>
              setActiveTab("Chat")
            }
          />

          <ProjectTab
            label="Settings"
            active={
              activeTab ===
              "Settings"
            }
            onClick={() =>
              setActiveTab(
                "Settings"
              )
            }
          />
        </div>
      </nav>

      {/* Workspace */}

      {activeTab === "Chat" ? (
        <ChatWorkspace
          project={project}
          latestAudit={
            latestAudit
          }
          auditResult={
            auditResult
          }
          messages={messages}
          message={message}
          isTyping={
            isTyping
          }
          chatError={
            chatError
          }
          messagesEndRef={
            messagesEndRef
          }
          onMessageChange={
            setMessage
          }
          onSend={
            handleSendMessage
          }
          onSuggestion={
            setMessage
          }
        />
      ) : activeTab ===
        "Overview" ? (
        <OverviewWorkspace
          project={project}
          latestAudit={
            latestAudit
          }
          auditResult={
            auditResult
          }
          overallScore={
            overallScore
          }
          productScore={
            productScore
          }
          validationScore={
            validationScore
          }
          launchScore={
            launchScore
          }
          riskScore={
            riskScore
          }
          navigationLoading={
            navigationLoading
          }
          onNavigation={
            handleNavigation
          }
          dailyObjective={
            dailyObjective
          }
          dailyObjectiveLoading={
            dailyObjectiveLoading
          }
          dailyObjectiveError={
            dailyObjectiveError
          }
          showOutcomeForm={
            showOutcomeForm
          }
          outcomeSubmitting={
            outcomeSubmitting
          }
          outcomeError={
            outcomeError
          }
          completionStatus={
            completionStatus
          }
          quantity={quantity}
          observations={
            observations
          }
          evidence={
            evidence
          }
          userInterpretation={
            userInterpretation
          }
          unexpectedResult={
            unexpectedResult
          }
          onShowOutcomeForm={() => {
            setOutcomeError(null);
            setShowOutcomeForm(
              true
            );
          }}
          onCloseOutcomeForm={() => {
            setOutcomeError(null);
            setShowOutcomeForm(
              false
            );
          }}
          onCompletionStatusChange={
            setCompletionStatus
          }
          onQuantityChange={
            setQuantity
          }
          onObservationsChange={
            setObservations
          }
          onEvidenceChange={
            setEvidence
          }
          onUserInterpretationChange={
            setUserInterpretation
          }
          onUnexpectedResultChange={
            setUnexpectedResult
          }
          onSubmitOutcome={
            handleSubmitObjective
          }
        />
      ) : (
        <PlaceholderWorkspace
          title={activeTab}
        />
      )}
    </main>
  );
}

/* =========================================================
   OVERVIEW WORKSPACE
   ========================================================= */

function OverviewWorkspace({
  project,
  latestAudit,
  auditResult,
  overallScore,
  productScore,
  validationScore,
  launchScore,
  riskScore,
  navigationLoading,
  onNavigation,
  dailyObjective,
  dailyObjectiveLoading,
  dailyObjectiveError,
  showOutcomeForm,
  outcomeSubmitting,
  outcomeError,
  completionStatus,
  quantity,
  observations,
  evidence,
  userInterpretation,
  unexpectedResult,
  onShowOutcomeForm,
  onCloseOutcomeForm,
  onCompletionStatusChange,
  onQuantityChange,
  onObservationsChange,
  onEvidenceChange,
  onUserInterpretationChange,
  onUnexpectedResultChange,
  onSubmitOutcome,
}: {
  project: Project;
  latestAudit: LatestAudit | null;
  auditResult: any;
  overallScore: number;
  productScore: number;
  validationScore: number;
  launchScore: number;
  riskScore: number;
  navigationLoading: string | null;
  onNavigation: (
    key: string,
    href: string
  ) => void;

  dailyObjective:
    DailyObjectiveResponse | null;

  dailyObjectiveLoading: boolean;

  dailyObjectiveError:
    string | null;

  showOutcomeForm: boolean;

  outcomeSubmitting: boolean;

  outcomeError: string | null;

  completionStatus:
    | "completed"
    | "success"
    | "partial"
    | "failed"
    | "not_completed";

  quantity: number;

  observations: string;

  evidence: string;

  userInterpretation: string;

  unexpectedResult: string;

  onShowOutcomeForm: () => void;

  onCloseOutcomeForm: () => void;

  onCompletionStatusChange: (
    value:
      | "completed"
      | "success"
      | "partial"
      | "failed"
      | "not_completed"
  ) => void;

  onQuantityChange: (
    value: number
  ) => void;

  onObservationsChange: (
    value: string
  ) => void;

  onEvidenceChange: (
    value: string
  ) => void;

  onUserInterpretationChange: (
    value: string
  ) => void;

  onUnexpectedResultChange: (
    value: string
  ) => void;

  onSubmitOutcome: () => void;
}) {
  if (!latestAudit) {
    return (
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
            <Rocket size={24} />
          </div>

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
            First decision
          </p>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            Run your first audit.
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Plavtora will evaluate{" "}
            {project.name} across
            product, validation,
            launch readiness, and
            risk.
          </p>

          <button
            type="button"
            onClick={() =>
              onNavigation(
                "run-first-audit",
                "/audit"
              )
            }
            disabled={
              !!navigationLoading
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            {navigationLoading ===
              "run-first-audit" && (
              <Loader2
                size={15}
                className="animate-spin"
              />
            )}

            Run SaaS Audit

            <ArrowRight
              size={16}
            />
          </button>
        </div>
      </section>
    );
  }

  const overallLabel =
    overallScore >= 80
      ? "Strong position"
      : overallScore >= 60
        ? "Needs attention"
        : "High risk";

  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

      {/* =====================================================
          DAILY OBJECTIVE
          ===================================================== */}

      <DailyObjectiveCard
        data={dailyObjective}
        loading={
          dailyObjectiveLoading
        }
        error={
          dailyObjectiveError
        }
        showOutcomeForm={
          showOutcomeForm
        }
        outcomeSubmitting={
          outcomeSubmitting
        }
        outcomeError={
          outcomeError
        }
        completionStatus={
          completionStatus
        }
        quantity={quantity}
        observations={
          observations
        }
        evidence={evidence}
        userInterpretation={
          userInterpretation
        }
        unexpectedResult={
          unexpectedResult
        }
        onShowOutcomeForm={
          onShowOutcomeForm
        }
        onCloseOutcomeForm={
          onCloseOutcomeForm
        }
        onCompletionStatusChange={
          onCompletionStatusChange
        }
        onQuantityChange={
          onQuantityChange
        }
        onObservationsChange={
          onObservationsChange
        }
        onEvidenceChange={
          onEvidenceChange
        }
        onUserInterpretationChange={
          onUserInterpretationChange
        }
        onUnexpectedResultChange={
          onUnexpectedResultChange
        }
        onSubmitOutcome={
          onSubmitOutcome
        }
      />

      {/* =====================================================
          MAIN VERDICT
          ===================================================== */}

      <div className="mt-5 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Latest startup diagnosis
            </p>

            <div className="mt-4 flex items-end gap-3">
              <span className="text-6xl font-bold leading-none tracking-[-0.06em] text-slate-950">
                {overallScore}
              </span>

              <span className="pb-1 text-lg font-medium text-slate-400">
                /100
              </span>
            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              {overallLabel}
            </p>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your latest audit is the current baseline for this project.
              Use it to decide what deserves attention before spending more.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  onNavigation(
                    "full-audit",
                    `/projects/${project.id}/audits/${latestAudit.session.id}`
                  )
                }
                disabled={
                  !!navigationLoading
                }
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600"
              >
                View full audit
                <ArrowRight
                  size={15}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  onNavigation(
                    "new-audit",
                    "/audit"
                  )
                }
                disabled={
                  !!navigationLoading
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Run another audit
              </button>
            </div>
          </div>

          <div className="rounded-3xl bg-slate-950 p-6 text-white sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Four angles
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Where your startup stands
                </h2>
              </div>

              <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/60">
                {formatDate(
                  auditResult?.created_at ||
                    latestAudit.session.created_at
                )}
              </span>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <DarkScoreRow
                label="Product"
                score={productScore}
                max={10}
              />

              <DarkScoreRow
                label="Validation"
                score={
                  validationScore
                }
                max={10}
              />

              <DarkScoreRow
                label="Launch readiness"
                score={
                  launchScore
                }
                max={10}
              />

              <DarkScoreRow
                label="Risk"
                score={riskScore}
                max={10}
                risk
              />
            </div>
          </div>
        </div>
      </div>

      {/* Score cards */}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <ScoreCard
          title="Overall"
          score={
            overallScore
          }
          maxScore={100}
          icon={
            <Target size={18} />
          }
          primary
        />

        <ScoreCard
          title="Product"
          score={
            productScore
          }
          maxScore={10}
          icon={
            <Package size={18} />
          }
        />

        <ScoreCard
          title="Validation"
          score={
            validationScore
          }
          maxScore={10}
          icon={
            <CheckCircle2
              size={18}
            />
          }
        />

        <ScoreCard
          title="Launch"
          score={
            launchScore
          }
          maxScore={10}
          icon={
            <Rocket
              size={18}
            />
          }
        />

        <RiskCard
          score={
            riskScore
          }
          icon={
            <ShieldAlert
              size={18}
            />
          }
        />
      </div>

      {/* Project status + next steps */}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Project status
          </p>

          <h2 className="mt-2 text-xl font-bold capitalize text-slate-950">
            {project.stage}
          </h2>

          <div className="mt-6 space-y-4">
            <StatusRow
              label="Audit completed"
              completed={
                latestAudit.session.status ===
                "completed"
              }
            />

            <StatusRow
              label="Product analyzed"
              completed={
                productScore > 0
              }
            />

            <StatusRow
              label="Validation analyzed"
              completed={
                validationScore > 0
              }
            />

            <StatusRow
              label="Launch analyzed"
              completed={
                launchScore > 0
              }
            />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-end justify-between gap-5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Continue building
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-950">
                Turn the diagnosis into another decision.
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use the result to investigate a specific weak point instead
                of starting another broad research loop.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <ActionCard
              title="Analyze ICP"
              description="Refine who should actually buy this."
              onNavigate={() =>
                onNavigation(
                  "action-icp",
                  "/persona"
                )
              }
            />

            <ActionCard
              title="Analyze Landing Page"
              description="Find conversion friction before traffic scales."
              onNavigate={() =>
                onNavigation(
                  "action-landing",
                  "/landing_page_analyzer"
                )
              }
            />

            <ActionCard
              title="Generate Roadmap"
              description="Turn findings into a prioritized execution plan."
              comingSoon
            />
          </div>
        </div>
      </div>

      {/* Premium context */}

      <div className="mt-5 overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
              <Sparkles size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-950">
                Want to question the diagnosis?
              </p>

              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                Use the AI Co-Founder to challenge the audit, investigate a
                finding, and work through what to do next.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              onNavigation(
                "project-chat",
                "#"
              )
            }
            className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            Open AI Co-Founder
          </button>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DAILY OBJECTIVE CARD
   ========================================================= */

function DailyObjectiveCard({
  data,
  loading,
  error,
  showOutcomeForm,
  outcomeSubmitting,
  outcomeError,
  completionStatus,
  quantity,
  observations,
  evidence,
  userInterpretation,
  unexpectedResult,
  onShowOutcomeForm,
  onCloseOutcomeForm,
  onCompletionStatusChange,
  onQuantityChange,
  onObservationsChange,
  onEvidenceChange,
  onUserInterpretationChange,
  onUnexpectedResultChange,
  onSubmitOutcome,
}: {
  data: DailyObjectiveResponse | null;
  loading: boolean;
  error: string | null;
  showOutcomeForm: boolean;
  outcomeSubmitting: boolean;
  outcomeError: string | null;

  completionStatus:
    | "completed"
    | "success"
    | "partial"
    | "failed"
    | "not_completed";

  quantity: number;
  observations: string;
  evidence: string;
  userInterpretation: string;
  unexpectedResult: string;

  onShowOutcomeForm: () => void;
  onCloseOutcomeForm: () => void;

  onCompletionStatusChange: (
    value:
      | "completed"
      | "success"
      | "partial"
      | "failed"
      | "not_completed"
  ) => void;

  onQuantityChange: (
    value: number
  ) => void;

  onObservationsChange: (
    value: string
  ) => void;

  onEvidenceChange: (
    value: string
  ) => void;

  onUserInterpretationChange: (
    value: string
  ) => void;

  onUnexpectedResultChange: (
    value: string
  ) => void;

  onSubmitOutcome: () => void;
}) {
  if (loading) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-violet-100" />

          <div>
            <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-5 w-52 animate-pulse rounded bg-slate-100" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
            <TriangleAlert size={19} />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">
              Daily Objective
            </p>

            <h2 className="mt-2 text-lg font-bold text-slate-950">
              Unable to load your objective
            </h2>

            <p className="mt-1 text-sm leading-6 text-amber-800/80">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (
    !data?.has_active_objective ||
    !data.objective
  ) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
            <CheckCircle2
              size={20}
            />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Daily Objective
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-950">
              No active objective right now.
            </h2>

            <p className="mt-1 text-sm leading-6 text-emerald-900/70">
              Your current V2 state has no objective waiting for input.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const objective =
    data.objective;

  const constraint =
    data.constraint;

  const dueDate =
    formatDateOnly(
      objective.due_at
    );

  return (
    <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-100 bg-slate-950 px-6 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
                <Target size={18} />
              </div>

              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                Today's objective
              </p>
            </div>

            <h2 className="mt-4 max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
              {objective.text}
            </h2>
          </div>

          <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/40">
              Due
            </p>

            <p className="mt-1 text-sm font-semibold text-white">
              {dueDate}
            </p>
          </div>
        </div>

        {constraint && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
              Current constraint
            </p>

            <p className="mt-1 text-sm leading-6 text-white/75">
              {constraint.claim}
            </p>
          </div>
        )}
      </div>

      {/* Main */}

      <div className="p-6 sm:p-7">

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              What to do
            </p>

            <p className="mt-3 text-sm leading-7 text-slate-700">
              {objective.action}
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <ObjectiveInfoBox
                label="Target"
                value={`${objective.target_count} ${formatEvidenceKind(
                  objective.evidence_kind
                )}`}
              />

              <ObjectiveInfoBox
                label="Evidence type"
                value={formatEvidenceKind(
                  objective.evidence_kind
                )}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Success criteria
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {objective.success_criteria}
            </p>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Do not do
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                {objective.do_not_do}
              </p>
            </div>
          </div>
        </div>

        {!showOutcomeForm ? (
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Completed the experiment?
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Record what actually happened. Plavtora will use the
                result to update your startup state.
              </p>
            </div>

            <button
              type="button"
              onClick={onShowOutcomeForm}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
            >
              Log outcome
              <ArrowRight size={15} />
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">

            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                  Objective outcome
                </p>

                <h3 className="mt-2 text-xl font-bold text-slate-950">
                  What actually happened?
                </h3>
              </div>

              <button
                type="button"
                onClick={
                  onCloseOutcomeForm
                }
                disabled={
                  outcomeSubmitting
                }
                className="text-xs font-semibold text-slate-400 transition hover:text-slate-700"
              >
                Cancel
              </button>
            </div>

            {outcomeError && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  {outcomeError}
                </p>
              </div>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Result
                </label>

                <select
                  value={
                    completionStatus
                  }
                  onChange={(event) =>
                    onCompletionStatusChange(
                      event.target
                        .value as
                        | "completed"
                        | "success"
                        | "partial"
                        | "failed"
                        | "not_completed"
                    )
                  }
                  disabled={
                    outcomeSubmitting
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="completed">
                    Completed
                  </option>

                  <option value="success">
                    Successful
                  </option>

                  <option value="partial">
                    Partially completed
                  </option>

                  <option value="failed">
                    Failed
                  </option>

                  <option value="not_completed">
                    Not completed
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(event) =>
                    onQuantityChange(
                      Math.max(
                        1,
                        Number(
                          event.target
                            .value
                        )
                      )
                    )
                  }
                  disabled={
                    outcomeSubmitting
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-700">
                What happened?
              </label>

              <textarea
                value={
                  observations
                }
                onChange={(event) =>
                  onObservationsChange(
                    event.target.value
                  )
                }
                disabled={
                  outcomeSubmitting
                }
                rows={4}
                placeholder="Describe the actual outcome, what users did, and what you observed."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-700">
                Evidence
                <span className="ml-1 font-normal text-slate-400">
                  optional
                </span>
              </label>

              <textarea
                value={
                  evidence
                }
                onChange={(event) =>
                  onEvidenceChange(
                    event.target.value
                  )
                }
                disabled={
                  outcomeSubmitting
                }
                rows={3}
                placeholder="Quotes, counts, behavioral signals, links, or anything concrete that supports the outcome."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-700">
                Your interpretation
                <span className="ml-1 font-normal text-slate-400">
                  optional
                </span>
              </label>

              <textarea
                value={
                  userInterpretation
                }
                onChange={(event) =>
                  onUserInterpretationChange(
                    event.target.value
                  )
                }
                disabled={
                  outcomeSubmitting
                }
                rows={3}
                placeholder="What do you think this result means?"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-5">
              <label className="text-xs font-semibold text-slate-700">
                Unexpected result
                <span className="ml-1 font-normal text-slate-400">
                  optional
                </span>
              </label>

              <textarea
                value={
                  unexpectedResult
                }
                onChange={(event) =>
                  onUnexpectedResultChange(
                    event.target.value
                  )
                }
                disabled={
                  outcomeSubmitting
                }
                rows={3}
                placeholder="Anything surprising, contradictory, or materially different from what you expected."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={
                  onCloseOutcomeForm
                }
                disabled={
                  outcomeSubmitting
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  onSubmitOutcome
                }
                disabled={
                  outcomeSubmitting ||
                  !observations.trim()
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {outcomeSubmitting ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Processing...
                  </>
                ) : (
                  <>
                    Submit outcome
                    <ArrowRight
                      size={15}
                    />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   CHAT WORKSPACE
   ========================================================= */

function ChatWorkspace({
  project,
  latestAudit,
  auditResult,
  messages,
  message,
  isTyping,
  chatError,
  messagesEndRef,
  onMessageChange,
  onSend,
  onSuggestion,
}: {
  project: Project;
  latestAudit: LatestAudit | null;
  auditResult: any;
  messages: {
    role: "user" | "assistant";
    content: string;
  }[];
  message: string;
  isTyping: boolean;
  chatError: string | null;
  messagesEndRef: React.RefObject<
    HTMLDivElement | null
  >;
  onMessageChange: (
    value: string
  ) => void;
  onSend: () => void;
  onSuggestion: (
    value: string
  ) => void;
}) {
  return (
    <section className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6 sm:p-7">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <Bot size={23} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
                AI decision support
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Your AI Co-Founder
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Working from the context of{" "}
                {project.name}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              Project context
            </span>

            {latestAudit && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Latest audit:{" "}
                {auditResult?.overall_score ??
                  0}
                /100
              </span>
            )}

            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Strategic chat
            </span>
          </div>
        </div>

        {chatError && (
          <div className="border-b border-amber-200 bg-amber-50 px-6 py-4">
            <div className="flex items-start gap-3">
              <ShieldAlert
                size={18}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Chat unavailable
                </p>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  {chatError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="h-[520px] overflow-y-auto bg-slate-50/60 p-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                <Bot size={25} />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-950">
                Challenge the audit.
              </h3>

              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">
                Ask why a score is low, what to fix first, or how to validate
                an assumption. The project and latest audit are provided as
                context.
              </p>

              <div className="mt-7 grid w-full max-w-xl gap-2 text-left sm:grid-cols-2">
                <Suggestion
                  text="What should I fix first?"
                  onClick={() =>
                    onSuggestion(
                      "What should I fix first?"
                    )
                  }
                />

                <Suggestion
                  text="What is my biggest risk?"
                  onClick={() =>
                    onSuggestion(
                      "What is my biggest risk?"
                    )
                  }
                />

                <Suggestion
                  text="How can I improve validation?"
                  onClick={() =>
                    onSuggestion(
                      "How can I improve validation?"
                    )
                  }
                />

                <Suggestion
                  text="What should I do next?"
                  onClick={() =>
                    onSuggestion(
                      "What should I do next?"
                    )
                  }
                />
              </div>
            </div>
          ) : (
            <>
              {messages.map(
                (msg, index) => (
                  <div
                    key={index}
                    className={`mb-5 flex ${
                      msg.role ===
                      "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-7 ${
                        msg.role ===
                        "user"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      {msg.role ===
                      "assistant" ? (
                        <div className="prose prose-slate max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-headings:font-semibold prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-slate-950">
                          <ReactMarkdown>
                            {
                              msg.content
                            }
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {
                            msg.content
                          }
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {isTyping && (
                <div className="mb-5 flex justify-start">
                  <div className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-500 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Loader2
                        size={15}
                        className="animate-spin"
                      />
                      AI Co-Founder is thinking...
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={
                  messagesEndRef
                }
              />
            </>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white p-5">
          <div className="flex gap-3">
            <input
              value={
                message
              }
              onChange={(event) =>
                onMessageChange(
                  event.target
                    .value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                    "Enter" &&
                  !event.shiftKey
                ) {
                  event.preventDefault();
                  onSend();
                }
              }}
              disabled={
                isTyping
              }
              placeholder="Ask your AI Co-Founder..."
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />

            <button
              type="button"
              onClick={
                onSend
              }
              disabled={
                !message.trim() ||
                isTyping
              }
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isTyping ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Send
                  size={17}
                />
              )}

              <span className="hidden sm:inline">
                {isTyping
                  ? "Thinking..."
                  : "Send"}
              </span>
            </button>
          </div>

          <p className="mt-3 text-[10px] leading-5 text-slate-400">
            Chat uses the project's startup context and latest audit.
            Usage limits are enforced by the backend.
          </p>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   DAILY OBJECTIVE HELPERS
   ========================================================= */

function ObjectiveInfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatEvidenceKind(
  kind: string
) {
  const labels: Record<
    string,
    string
  > = {
    interview: "user interviews",
    commit: "commitments",
    signup: "signups",
    checkout_attempt:
      "checkout attempts",
    payment: "payments",
    retention: "retention signals",
    ad_spend: "ad-spend results",
    message_reply:
      "message replies",
    waitlist: "waitlist signups",
    usage: "usage observations",
    other: "observations",
  };

  return (
    labels[kind] ||
    kind.replace(
      /_/g,
      " "
    )
  );
}

/* =========================================================
   GENERAL UI
   ========================================================= */

function ProjectLoader() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-200" />

            <div>
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />

              <div className="mt-2 h-2.5 w-36 animate-pulse rounded bg-slate-100" />
            </div>
          </div>

          <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
        </div>

        <div className="mt-10 rounded-[28px] bg-white p-7 shadow-sm ring-1 ring-slate-200">
          <div className="flex gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-100" />

            <div className="flex-1">
              <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />

              <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-3 w-64 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({
            length: 5,
          }).map(
            (_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200"
              />
            )
          )}
        </div>
      </div>
    </main>
  );
}

interface ProjectTabProps {
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

function ProjectTab({
  label,
  active = false,
  badge,
  onClick,
}: ProjectTabProps) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? "text-slate-950"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {label}

      {badge && (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          {badge}
        </span>
      )}

      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-slate-950" />
      )}
    </button>
  );
}

function Suggestion({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-950"
    >
      {text}
    </button>
  );
}

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  icon: React.ReactNode;
  primary?: boolean;
}

function ScoreCard({
  title,
  score,
  maxScore,
  icon,
  primary = false,
}: ScoreCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${
        primary
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {title}
        </span>

        <div
          className={
            primary
              ? "text-blue-600"
              : "text-slate-400"
          }
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {score}

        <span className="text-sm font-medium text-slate-400">
          /{maxScore}
        </span>
      </p>
    </div>
  );
}

function RiskCard({
  score,
  icon,
}: {
  score: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-red-700">
          Risk
        </span>

        <div className="text-red-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {score}

        <span className="text-sm font-medium text-slate-400">
          /10
        </span>
      </p>
    </div>
  );
}

function DarkScoreRow({
  label,
  score,
  max,
  risk = false,
}: {
  label: string;
  score: number;
  max: number;
  risk?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-white/50">
          {label}
        </span>

        <span
          className={`text-sm font-bold ${
            risk
              ? "text-rose-300"
              : "text-white"
          }`}
        >
          {score}/
          {max}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full rounded-full ${
            risk
              ? "bg-rose-400"
              : "bg-violet-400"
          }`}
          style={{
            width: `${Math.min(
              (score /
                Math.max(
                  max,
                  1
                )) *
                100,
              100
            )}%`,
          }}
        />
      </div>
    </div>
  );
}

function StatusRow({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      {completed ? (
        <CheckCircle2
          size={18}
          className="text-emerald-600"
        />
      ) : (
        <span className="h-2 w-2 rounded-full bg-slate-300" />
      )}
    </div>
  );
}

function ActionCard({
  title,
  description,
  onNavigate,
  comingSoon = false,
}: {
  title: string;
  description: string;
  onNavigate?: () => void;
  comingSoon?: boolean;
}) {
  const [loading, setLoading] =
    useState(false);

  const handleClick = () => {
    if (
      comingSoon ||
      loading ||
      !onNavigate
    ) {
      return;
    }

    setLoading(true);
    onNavigate();
  };

  return (
    <button
      type="button"
      onClick={
        handleClick
      }
      disabled={
        comingSoon ||
        loading
      }
      className={`rounded-2xl border p-5 text-left transition ${
        comingSoon
          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60"
          : loading
            ? "cursor-wait border-blue-200 bg-blue-50"
            : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        {comingSoon && (
          <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-amber-700">
            Soon
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600">
        {loading ? (
          <>
            <Loader2
              size={14}
              className="animate-spin"
            />
            Opening...
          </>
        ) : comingSoon ? (
          "Planned"
        ) : (
          <>
            Open
            <ArrowRight
              size={14}
            />
          </>
        )}
      </span>
    </button>
  );
}

function getScore(
  data:
    | Record<
        string,
        any
      >
    | undefined
): number {
  if (!data) return 0;

  const possibleKeys = [
    "score",
    "overall_score",
    "product_score",
    "validation_score",
    "launch_readiness_score",
  ];

  for (const key of possibleKeys) {
    if (
      typeof data[
        key
      ] === "number"
    ) {
      return data[key];
    }
  }

  return 0;
}

function formatDate(
  date:
    | string
    | undefined
) {
  if (!date) return "Unknown";

  return new Date(
    date
  ).toLocaleString(
    "en-IN",
    {
      dateStyle:
        "medium",
      timeStyle:
        "short",
    }
  );
}

function formatDateOnly(
  date: string
) {
  return new Date(
    date
  ).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}

function PlaceholderWorkspace({
  title,
}: {
  title: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
          <Sparkles
            size={24}
          />
        </div>

        <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
          Coming next
        </p>

        <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          This workspace is not available yet. It will be added to
          your Plavtora project as the feature is released.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          In development
        </div>
      </div>
    </section>
  );
}