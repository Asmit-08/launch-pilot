"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  X,
  FolderGit2,
  Plus,
  Globe,
  Settings,
  LogOut,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { signOut } from "@/services/auth";
import { getUsage, UsageStatus } from "@/lib/usage";

interface Project {
  id: string;
  name: string;
  stage: string;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
}

type LoadingAction =
  | `project:${string}`
  | "audit"
  | "landing-pages"
  | "settings"
  | "logout"
  | null;

export default function Sidebar({
  isOpen,
  onClose,
  projects,
}: SidebarProps) {
  const router = useRouter();

  const [loadingAction, setLoadingAction] =
    useState<LoadingAction>(null);

  const [usage, setUsage] =
    useState<UsageStatus | null>(null);

  const [usageLoading, setUsageLoading] =
    useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUsage() {
      try {
        const data = await getUsage();

        if (!cancelled) {
          setUsage(data);
        }
      } catch (error) {
        console.error("Usage loading failed:", error);
      } finally {
        if (!cancelled) {
          setUsageLoading(false);
        }
      }
    }

    loadUsage();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    if (loadingAction) return;

    try {
      setLoadingAction("logout");

      await signOut();

      router.replace("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
      setLoadingAction(null);
    }
  }

  function handleProjectClick(projectId: string) {
    if (loadingAction) return;

    onClose();

    setLoadingAction(`project:${projectId}`);

    router.push(`/projects/${projectId}`);
  }

  function handleNavigation(
    action: Exclude<
      LoadingAction,
      `project:${string}` | "logout" | null
    >,
    href: string
  ) {
    if (loadingAction) return;

    onClose();

    setLoadingAction(action);

    router.push(href);
  }

  const isProjectLoading = (projectId: string) =>
    loadingAction === `project:${projectId}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-90 bg-slate-950/20 backdrop-blur-sm
          transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-100 flex h-screen w-80 flex-col
          border-r border-slate-200 bg-white
          shadow-[10px_0_40px_rgba(15,23,42,0.06)]
          transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-950">
              Plavtora
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Founder workspace
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={19} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {/* Recent projects */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Recent Projects
            </h3>

            <div className="space-y-2">
              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                  No projects yet.
                </div>
              ) : (
                projects.map((project) => {
                  const projectLoading =
                    isProjectLoading(project.id);

                  return (
                    <button
                      key={project.id}
                      type="button"
                      disabled={!!loadingAction}
                      onClick={() =>
                        handleProjectClick(project.id)
                      }
                      className={`
                        group flex w-full items-center justify-between
                        rounded-xl border border-slate-100
                        bg-slate-50 p-3 text-left transition
                        ${
                          projectLoading
                            ? "cursor-wait border-blue-200"
                            : "hover:border-slate-200 hover:bg-white hover:shadow-sm"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 ring-1 ring-slate-200">
                          {projectLoading ? (
                            <Loader2
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <FolderGit2 size={16} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            {project.name}
                          </p>

                          <p className="text-[11px] capitalize text-slate-400">
                            {projectLoading
                              ? "Opening..."
                              : project.stage}
                          </p>
                        </div>
                      </div>

                      {projectLoading && (
                        <Loader2
                          size={14}
                          className="animate-spin text-blue-600"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="my-6 border-t border-slate-100" />

          {/* Quick actions */}
          <div>
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              Quick Actions
            </h3>

            <div className="space-y-1">
              <SidebarItem
                icon={
                  loadingAction === "audit" ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )
                }
                title={
                  loadingAction === "audit"
                    ? "Opening..."
                    : "New Audit"
                }
                loading={loadingAction === "audit"}
                disabled={!!loadingAction}
                onClick={() =>
                  handleNavigation("audit", "/audit")
                }
              />

              <SidebarItem
                icon={
                  loadingAction === "landing-pages" ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Globe size={17} />
                  )
                }
                title={
                  loadingAction === "landing-pages"
                    ? "Opening..."
                    : "Landing Pages"
                }
                loading={
                  loadingAction === "landing-pages"
                }
                disabled={!!loadingAction}
                onClick={() =>
                  handleNavigation(
                    "landing-pages",
                    "/landing_page_analyzer"
                  )
                }
              />
            </div>
          </div>

          {/* Usage */}
          <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Your usage
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  Current plan limits
                </p>
              </div>

              {usage && (
                <span
                  className={`
                    rounded-full px-2.5 py-1 text-[9px]
                    font-bold uppercase tracking-wider
                    ${
                      usage.plan === "free"
                        ? "bg-slate-200 text-slate-500"
                        : "bg-emerald-100 text-emerald-700"
                    }
                  `}
                >
                  {usage.plan}
                </span>
              )}
            </div>

            {usageLoading ? (
              <div className="space-y-4">
                <UsageSkeleton />
                <UsageSkeleton />
                <UsageSkeleton />
                <UsageSkeleton />
              </div>
            ) : usage ? (
              <div className="space-y-4">
                <UsageItem
                  label="Audits"
                  resource={usage.usage.audits}
                />

                <UsageItem
                  label="AI Chat"
                  resource={usage.usage.chat_messages}
                />

                <UsageItem
                  label="ICP"
                  resource={usage.usage.personas}
                />

                <UsageItem
                  label="Landing Pages"
                  resource={
                    usage.usage.landing_page_analyses
                  }
                />

                {usage.plan === "free" && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/billing")
                    }
                    className="group mt-2 flex w-full items-center justify-between rounded-xl bg-slate-950 px-4 py-3 text-left text-white shadow-sm transition hover:bg-slate-800"
                  >
                    <span>
                      <span className="block text-xs font-bold">
                        Unlock Premium
                      </span>

                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        More usage & deeper tools
                      </span>
                    </span>

                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-white p-3 text-xs text-slate-400">
                Usage unavailable.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-1 border-t border-slate-100 p-4">
          <SidebarItem
            icon={
              loadingAction === "settings" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Settings size={17} />
              )
            }
            title={
              loadingAction === "settings"
                ? "Opening..."
                : "Settings"
            }
            loading={loadingAction === "settings"}
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation("settings", "/settings")
            }
          />

          <SidebarItem
            icon={
              loadingAction === "logout" ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <LogOut size={17} />
              )
            }
            title={
              loadingAction === "logout"
                ? "Signing out..."
                : "Logout"
            }
            loading={loadingAction === "logout"}
            disabled={!!loadingAction}
            onClick={handleLogout}
          />
        </div>
      </aside>
    </>
  );
}

function UsageItem({
  label,
  resource,
}: {
  label: string;
  resource: {
    used: number;
    limit: number;
    remaining: number;
  };
}) {
  const percentage =
    resource.limit > 0
      ? Math.min(
          (resource.used / resource.limit) * 100,
          100
        )
      : 0;

  const exhausted = resource.remaining <= 0;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-600">
          {label}
        </span>

        <span
          className={`text-[10px] font-medium ${
            exhausted
              ? "text-red-500"
              : "text-slate-400"
          }`}
        >
          {resource.used}/{resource.limit}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${
            exhausted
              ? "bg-red-500"
              : "bg-slate-900"
          }`}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1 text-[9px] text-slate-400">
        {exhausted
          ? "Limit reached"
          : `${resource.remaining} remaining`}
      </p>
    </div>
  );
}

function UsageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 flex justify-between">
        <div className="h-2.5 w-14 rounded bg-slate-200" />
        <div className="h-2.5 w-7 rounded bg-slate-200" />
      </div>

      <div className="h-1.5 rounded-full bg-slate-200" />

      <div className="mt-1.5 h-2 w-16 rounded bg-slate-100" />
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

function SidebarItem({
  icon,
  title,
  onClick,
  loading = false,
  disabled = false,
}: SidebarItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        group flex w-full items-center gap-3 rounded-xl
        px-3 py-2.5 text-left text-sm transition
        ${
          loading
            ? "bg-slate-50"
            : "hover:bg-slate-50"
        }
      `}
    >
      <span
        className={
          loading
            ? "text-blue-600"
            : "text-slate-400 group-hover:text-slate-700"
        }
      >
        {icon}
      </span>

      <span
        className={
          loading
            ? "font-medium text-blue-700"
            : "font-medium text-slate-700"
        }
      >
        {title}
      </span>
    </button>
  );
}