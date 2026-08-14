"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import {
  ArrowLeft,
  ExternalLink,
  FolderGit2,
  Loader2,
  ShieldAlert,
  Target,
  Rocket,
  Package,
  CheckCircle2,
  Send,
  Bot,
} from "lucide-react";

import {
  getProjectById,
  Project,
  LatestAudit,
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

  /* =========================================================
     Project Navigation
  ========================================================= */

  const [activeTab, setActiveTab] =
    useState("Overview");

  /* =========================================================
     Chat State
  ========================================================= */

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

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  /* =========================================================
     Load Project
  ========================================================= */

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        setError(null);

        const workspace =
          await getProjectById(projectId);

        setProject(workspace.project);
        setLatestAudit(
          workspace.latest_audit
        );

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

      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  /* =========================================================
     Scroll Chat
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  /* =========================================================
     Send Chat Message
  ========================================================= */

  const handleSendMessage = async () => {
    if (!message.trim() || !project) {
      return;
    }

    const currentMessage =
      message.trim();

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
      const auditResult =
        latestAudit?.result;

      const response = await fetch(
        "https://launch-pilot-backend.onrender.com/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: currentMessage,

            /*
             * Normalize the database audit
             * into the structure expected
             * by the AI Co-Founder.
             */

            audit_result: auditResult
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

            /*
             * Project context.
             */

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
        throw new Error(
          `Chat request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      setMessages([
        ...updatedMessages,

        {
          role: "assistant",

          content:
            typeof data.response ===
            "string"
              ? data.response
              : String(
                  data.response ??
                    "I couldn't generate a response."
                ),
        },
      ]);

    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      setMessages([
        ...updatedMessages,

        {
          role: "assistant",
          content:
            "Sorry, I couldn't process that request right now. Please try again.",
        },
      ]);

    } finally {
      setIsTyping(false);
    }
  };

  /* =========================================================
     Loading
  ========================================================= */

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#020617] text-white">

        <div className="flex items-center gap-3 text-gray-400">

          <Loader2
            size={20}
            className="animate-spin"
          />

          Loading project...

        </div>

      </main>
    );
  }

  /* =========================================================
     Error
  ========================================================= */

  if (error || !project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#020617] px-6 text-white">

        <div className="text-center">

          <h1 className="text-2xl font-semibold">
            Project not found
          </h1>

          <p className="mt-2 text-gray-400">
            {error ||
              "This project does not exist or you don't have access to it."}
          </p>

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-500"
          >
            Back to Dashboard
          </button>

        </div>

      </main>
    );
  }

  /* =========================================================
     Audit Scores
  ========================================================= */

  const auditResult =
    latestAudit?.result;

  const productScore = getScore(
    auditResult?.product_json
  );

  const validationScore = getScore(
    auditResult?.validation_json
  );

  const launchScore = getScore(
    auditResult?.launch_json
  );

  const riskScore = getScore(
    auditResult?.risk_json
  );

  /* =========================================================
     Render
  ========================================================= */

  return (
    <main className="min-h-screen bg-[#020617] text-white">

      {/* =====================================================
          Top Navigation
      ===================================================== */}

      <header className="border-b border-white/10">

        <div className="mx-auto flex max-w-7xl items-center px-6 py-5">

          <button
            onClick={() =>
              router.push("/dashboard")
            }
            className="group flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >

            <ArrowLeft
              size={18}
              className="transition-transform group-hover:-translate-x-1"
            />

            Back to Dashboard

          </button>

        </div>

      </header>

      {/* =====================================================
          Project Header
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 pt-8">

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">

          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg">

                <FolderGit2 size={30} />

              </div>

              <div>

                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold">
                    {project.name}
                  </h1>

                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium capitalize text-blue-300">
                    {project.stage}
                  </span>

                </div>

                {project.description && (
                  <p className="mt-2 max-w-2xl text-gray-400">
                    {project.description}
                  </p>
                )}

                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
                  >

                    {project.website}

                    <ExternalLink
                      size={14}
                    />

                  </a>
                )}

              </div>

            </div>

            <button
              onClick={() => {
                if (latestAudit) {
                  router.push(
                    `/projects/${projectId}/audits/${latestAudit.session.id}`
                  );
                } else {
                  router.push("/audit");
                }
              }}
              className="
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-violet-600
                px-5
                py-3
                font-medium
                text-white
                shadow-lg
                transition-all
                hover:-translate-y-0.5
                hover:shadow-blue-500/20
              "
            >
              {latestAudit
                ? "Open Audit"
                : "Run Audit"}
            </button>

          </div>

        </div>

      </section>

      {/* =====================================================
          Project Navigation
      ===================================================== */}

      <nav className="mx-auto mt-8 max-w-7xl overflow-x-auto px-6">

        <div className="flex min-w-max gap-1 border-b border-white/10">

          <ProjectTab
            label="Overview"
            active={
              activeTab === "Overview"
            }
            onClick={() =>
              setActiveTab("Overview")
            }
          />

          <ProjectTab
            label="Audits"
            active={
              activeTab === "Audits"
            }
            onClick={() =>
              router.push(
                `/projects/${projectId}/audits`
              )
            }
          />

          <ProjectTab
            label="ICP Analysis"
            badge="New"
            active={
              activeTab ===
              "ICP Analysis"
            }
            onClick={() =>
              setActiveTab("ICP Analysis")
            }
          />

          <ProjectTab
            label="Landing Page"
            badge="New"
            active={
              activeTab ===
              "Landing Page"
            }
            onClick={() =>
              setActiveTab("Landing Page")
            }
          />

          <ProjectTab
            label="Roadmap"
            badge="New"
            active={
              activeTab === "Roadmap"
            }
            onClick={() =>
              setActiveTab("Roadmap")
            }
          />

          <ProjectTab
            label="Chat"
            active={
              activeTab === "Chat"
            }
            onClick={() =>
              setActiveTab("Chat")
            }
          />

          <ProjectTab
            label="Settings"
            active={
              activeTab === "Settings"
            }
            onClick={() =>
              setActiveTab("Settings")
            }
          />

        </div>

      </nav>

      {/* =====================================================
          Chat
      ===================================================== */}

      {activeTab === "Chat" ? (

        <section className="mx-auto max-w-5xl px-6 py-8">

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">

            {/* Chat Header */}

            <div className="border-b border-white/10 p-7">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">

                  <Bot size={25} />

                </div>

                <div>

                  <h2 className="text-xl font-semibold">
                    AI Co-Founder
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Your strategic partner for{" "}
                    {project.name}
                  </p>

                </div>

              </div>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                  Project context
                </span>

                {latestAudit && (
                  <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-300">
                    Latest audit:{" "}
                    {auditResult?.overall_score ??
                      0}
                    /100
                  </span>
                )}

              </div>

            </div>

            {/* Conversation */}

            <div className="h-[520px] overflow-y-auto p-6">

              {messages.length === 0 ? (

                <div className="flex h-full flex-col items-center justify-center text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-3xl">
                    🤖
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold">
                    Your AI Co-Founder
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-relaxed text-gray-400">

                    Ask questions about your
                    product, validation,
                    launch strategy, risks,
                    or next steps.

                    {latestAudit
                      ? " Your latest audit is available as context."
                      : " Run an audit to give your AI Co-Founder deeper project context."}

                  </p>

                  <div className="mt-7 grid gap-2 text-left sm:grid-cols-2">

                    <Suggestion
                      text="What should I fix first?"
                      onClick={() =>
                        setMessage(
                          "What should I fix first?"
                        )
                      }
                    />

                    <Suggestion
                      text="What is my biggest risk?"
                      onClick={() =>
                        setMessage(
                          "What is my biggest risk?"
                        )
                      }
                    />

                    <Suggestion
                      text="How can I improve validation?"
                      onClick={() =>
                        setMessage(
                          "How can I improve validation?"
                        )
                      }
                    />

                    <Suggestion
                      text="What should I do next?"
                      onClick={() =>
                        setMessage(
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
                          msg.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        <div
                          className={`
                            max-w-[85%]
                            rounded-2xl
                            px-5
                            py-4
                            text-sm
                            leading-7
                            ${
                              msg.role === "user"
                                ? "bg-blue-600 text-white"
                                : "border border-white/10 bg-white/5 text-gray-200"
                            }
                          `}
                        >
                          {msg.role === "assistant" ? (
                            <div className="prose prose-invert max-w-none prose-p:my-3 prose-headings:mb-3 prose-headings:mt-5 prose-headings:font-semibold prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-strong:text-white">
                              <ReactMarkdown>
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          )}
                        </div>

                      </div>

                    )
                  )}

                  {isTyping && (

                    <div className="mb-5 flex justify-start">

                      <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-gray-400">

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
                    ref={messagesEndRef}
                  />

                </>

              )}

            </div>

            {/* Input */}

            <div className="border-t border-white/10 p-5">

              <div className="flex gap-3">

                <input
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  onKeyDown={(event) => {

                    if (
                      event.key ===
                      "Enter"
                    ) {
                      event.preventDefault();

                      handleSendMessage();
                    }

                  }}
                  disabled={isTyping}
                  placeholder="Ask your AI Co-Founder..."
                  className="
                    flex-1
                    rounded-xl
                    border
                    border-white/10
                    bg-black/20
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-gray-600
                    focus:border-blue-500/40
                  "
                />

                <button
                  onClick={
                    handleSendMessage
                  }
                  disabled={
                    !message.trim() ||
                    isTyping
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-white
                    transition
                    hover:bg-blue-500
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >

                  <Send size={17} />

                  Send

                </button>

              </div>

              <p className="mt-3 text-xs text-gray-600">
                The AI Co-Founder uses this project's
                information and latest audit as context.
              </p>

            </div>

          </div>

        </section>

      ) : activeTab === "Overview" ? (

        /* ===================================================
           Overview
        =================================================== */

        <section className="mx-auto max-w-7xl px-6 py-8">

          {!latestAudit ? (

            <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">

                <Rocket
                  size={24}
                  className="text-gray-400"
                />

              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                No audits yet
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-gray-400">
                Run your first launch audit
                for {project.name} to start
                building your project workspace.
              </p>

            </div>

          ) : (

            <>

              {/* Score Cards */}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                <ScoreCard
                  title="Overall"
                  score={
                    auditResult?.overall_score ??
                    0
                  }
                  maxScore={100}
                  icon={
                    <Target size={20} />
                  }
                  primary
                />

                <ScoreCard
                  title="Product"
                  score={productScore}
                  maxScore={10}
                  icon={
                    <Package size={20} />
                  }
                />

                <ScoreCard
                  title="Validation"
                  score={validationScore}
                  maxScore={10}
                  icon={
                    <CheckCircle2
                      size={20}
                    />
                  }
                />

                <ScoreCard
                  title="Launch Readiness"
                  score={launchScore}
                  maxScore={10}
                  icon={
                    <Rocket size={20} />
                  }
                />

                <RiskCard
                  score={riskScore}
                  icon={
                    <ShieldAlert
                      size={20}
                    />
                  }
                />

              </div>

              {/* Latest Audit */}

              <div className="mt-8 grid gap-6 lg:grid-cols-3">

                <div className="rounded-3xl border border-white/10 bg-white/5 p-7 lg:col-span-2">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-gray-500">
                        Latest Audit
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        Launch Audit
                      </h2>

                    </div>

                    <span className="rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-medium capitalize text-green-400">
                      {
                        latestAudit
                          .session
                          .status
                      }
                    </span>

                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">

                    <div>

                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Overall Score
                      </p>

                      <p className="mt-1 text-3xl font-bold">

                        {
                          auditResult?.overall_score ??
                          0
                        }

                        <span className="text-lg text-gray-500">
                          /100
                        </span>

                      </p>

                    </div>

                    <div>

                      <p className="text-xs uppercase tracking-wider text-gray-500">
                        Audited
                      </p>

                      <p className="mt-1 text-sm text-gray-300">

                        {formatDate(
                          auditResult?.created_at ||
                            latestAudit
                              .session
                              .created_at
                        )}

                      </p>

                    </div>

                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/projects/${projectId}/audits`
                      )
                    }
                    className="
                      mt-7
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      px-4
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      transition
                      hover:bg-white/10
                    "
                  >
                    View Full Audit
                  </button>

                </div>

                {/* Project Status */}

                <div className="rounded-3xl border border-white/10 bg-white/5 p-7">

                  <p className="text-sm text-gray-500">
                    Project Status
                  </p>

                  <h2 className="mt-1 text-xl font-semibold capitalize">
                    {project.stage}
                  </h2>

                  <div className="mt-6 space-y-4">

                    <StatusRow
                      label="Audit completed"
                      completed={
                        latestAudit
                          .session
                          .status ===
                        "completed"
                      }
                    />

                    <StatusRow
                      label="Product analysis"
                      completed={
                        productScore > 0
                      }
                    />

                    <StatusRow
                      label="Validation analysis"
                      completed={
                        validationScore >
                        0
                      }
                    />

                    <StatusRow
                      label="Launch analysis"
                      completed={
                        launchScore > 0
                      }
                    />

                  </div>

                </div>

              </div>

              {/* Recommended Actions */}

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-7">

                <div>

                  <p className="text-sm text-gray-500">
                    Continue Building
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Recommended Next Steps
                  </h2>

                  <p className="mt-2 text-sm text-gray-400">
                    Generate additional insights
                    only when you need them.
                  </p>

                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">

                  <ActionCard
                    title="Analyze ICP"
                    description="Understand and refine your ideal customer profile."
                  />

                  <ActionCard
                    title="Analyze Landing Page"
                    description="Review your landing page before sending traffic."
                  />

                  <ActionCard
                    title="Generate Roadmap"
                    description="Turn your audit findings into an execution plan."
                  />

                </div>

              </div>

            </>

          )}

        </section>

      ) : (

        /* ===================================================
           Placeholder for Future Tabs
        =================================================== */

        <section className="mx-auto max-w-7xl px-6 py-8">

          <div className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center">

            <h2 className="text-2xl font-semibold">
              {activeTab}
            </h2>

            <p className="mt-2 text-gray-400">
              This workspace is coming next.
            </p>

          </div>

        </section>

      )}

    </main>
  );
}

/* =========================================================
   Project Tab
========================================================= */

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
      onClick={onClick}
      className={`
        relative
        flex
        items-center
        gap-2
        px-4
        py-3
        text-sm
        transition-colors
        ${
          active
            ? "text-blue-400"
            : "text-gray-400 hover:text-white"
        }
      `}
    >

      {label}

      {badge && (
        <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-300">
          {badge}
        </span>
      )}

      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
      )}

    </button>
  );
}

/* =========================================================
   Suggestion
========================================================= */

function Suggestion({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        rounded-xl
        border
        border-white/10
        bg-white/[0.03]
        px-4
        py-3
        text-left
        text-sm
        text-gray-400
        transition
        hover:border-blue-500/30
        hover:bg-white/[0.06]
        hover:text-white
      "
    >
      {text}
    </button>
  );
}

/* =========================================================
   Score Card
========================================================= */

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
      className={`
        rounded-3xl
        border
        p-6
        backdrop-blur-xl
        ${
          primary
            ? "border-blue-500/30 bg-blue-500/10"
            : "border-white/10 bg-white/5"
        }
      `}
    >

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          {title}
        </span>

        <div className="text-blue-400">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-3xl font-bold">

        {score}

        <span className="text-base text-gray-500">
          /{maxScore}
        </span>

      </p>

    </div>
  );
}

/* =========================================================
   Risk Card
========================================================= */

interface RiskCardProps {
  score: number;
  icon: React.ReactNode;
}

function RiskCard({
  score,
  icon,
}: RiskCardProps) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-red-500/20
        bg-white/5
        p-6
        backdrop-blur-xl
      "
    >

      <div className="flex items-center justify-between">

        <span className="text-sm text-gray-400">
          Risk
        </span>

        <div className="text-red-400">
          {icon}
        </div>

      </div>

      <p className="mt-5 text-3xl font-bold">

        {score}

        <span className="text-base text-gray-500">
          /10
        </span>

      </p>

    </div>
  );
}

/* =========================================================
   Status Row
========================================================= */

interface StatusRowProps {
  label: string;
  completed: boolean;
}

function StatusRow({
  label,
  completed,
}: StatusRowProps) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-sm text-gray-400">
        {label}
      </span>

      {completed ? (
        <CheckCircle2
          size={18}
          className="text-green-400"
        />
      ) : (
        <span className="h-2 w-2 rounded-full bg-gray-600" />
      )}

    </div>
  );
}

/* =========================================================
   Action Card
========================================================= */

interface ActionCardProps {
  title: string;
  description: string;
}

function ActionCard({
  title,
  description,
}: ActionCardProps) {
  return (
    <button
      className="
        rounded-2xl
        border
        border-white/10
        bg-white/[0.03]
        p-5
        text-left
        transition-all
        hover:border-blue-500/30
        hover:bg-white/[0.06]
      "
    >

      <h3 className="font-medium text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-gray-400">
        {description}
      </p>

      <span className="mt-4 inline-block text-sm text-blue-400">
        Coming next →
      </span>

    </button>
  );
}

/* =========================================================
   Helpers
========================================================= */

function getScore(
  data: Record<string, any> | undefined
): number {
  if (!data) {
    return 0;
  }

  const possibleKeys = [
    "score",
    "overall_score",
    "product_score",
    "validation_score",
    "launch_readiness_score",
  ];

  for (const key of possibleKeys) {
    if (
      typeof data[key] === "number"
    ) {
      return data[key];
    }
  }

  return 0;
}

function formatDate(
  date: string | undefined
) {
  if (!date) {
    return "Unknown";
  }

  return new Date(date).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
}
