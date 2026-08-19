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

  // -----------------------------------
  // Load Usage
  // -----------------------------------

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

  // -----------------------------------
  // Logout
  // -----------------------------------

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

  // -----------------------------------
  // Project Navigation
  // -----------------------------------

  function handleProjectClick(projectId: string) {
    if (loadingAction) return;

    onClose();

    setLoadingAction(`project:${projectId}`);

    router.push(`/projects/${projectId}`);
  }

  // -----------------------------------
  // General Navigation
  // -----------------------------------

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
      {/* ----------------------------------- */}
      {/* Backdrop */}
      {/* ----------------------------------- */}

      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-90 bg-black/50 backdrop-blur-sm
          transition-opacity duration-300
          ${
            isOpen
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* ----------------------------------- */}
      {/* Sidebar */}
      {/* ----------------------------------- */}

      <aside
        className={`
          fixed left-0 top-0 z-100
          flex h-screen w-80 flex-col
          border-r border-white/10
          bg-[#020617]
          transition-transform duration-300
          ${
            isOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ----------------------------------- */}
        {/* Header */}
        {/* ----------------------------------- */}

        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Plavtora
            </h2>

            <p className="text-sm text-gray-400">
              Workspace
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-xl p-2 transition hover:bg-white/5"
          >
            <X
              size={20}
              className="text-white"
            />
          </button>
        </div>

        {/* ----------------------------------- */}
        {/* Scrollable Content */}
        {/* ----------------------------------- */}

        <div className="flex-1 overflow-y-auto p-5">

          {/* ----------------------------------- */}
          {/* Recent Projects */}
          {/* ----------------------------------- */}

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Recent Projects
            </h3>

            <div className="space-y-2">
              {projects.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-gray-500">
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
                        group
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-2xl
                        border
                        border-white/5
                        bg-white/5
                        p-4
                        text-left
                        transition-all
                        duration-300
                        ${
                          projectLoading
                            ? "cursor-wait border-blue-500/30 bg-white/[0.08] opacity-85"
                            : "hover:border-blue-500/30 hover:bg-white/10"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                            rounded-xl
                            bg-gradient-to-br
                            from-blue-500
                            to-violet-600
                            p-2
                            text-white
                            ${
                              projectLoading
                                ? "opacity-80"
                                : ""
                            }
                          `}
                        >
                          {projectLoading ? (
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />
                          ) : (
                            <FolderGit2 size={18} />
                          )}
                        </div>

                        <div className="text-left">
                          <p className="font-medium text-white">
                            {project.name}
                          </p>

                          <p className="text-xs capitalize text-gray-400">
                            {projectLoading
                              ? "Opening project..."
                              : project.stage}
                          </p>
                        </div>
                      </div>

                      {projectLoading && (
                        <Loader2
                          size={16}
                          className="animate-spin text-blue-300"
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* ----------------------------------- */}
          {/* Divider */}
          {/* ----------------------------------- */}

          <div className="my-6 border-t border-white/10" />

          {/* ----------------------------------- */}
          {/* Quick Actions */}
          {/* ----------------------------------- */}

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <SidebarItem
                icon={
                  loadingAction === "audit" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Plus size={18} />
                  )
                }
                title={
                  loadingAction === "audit"
                    ? "Opening..."
                    : "New Audit"
                }
                loading={
                  loadingAction === "audit"
                }
                disabled={!!loadingAction}
                onClick={() =>
                  handleNavigation(
                    "audit",
                    "/dashboard"
                  )
                }
              />

              <SidebarItem
                icon={
                  loadingAction ===
                  "landing-pages" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Globe size={18} />
                  )
                }
                title={
                  loadingAction ===
                  "landing-pages"
                    ? "Opening..."
                    : "Landing Pages"
                }
                loading={
                  loadingAction ===
                  "landing-pages"
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

          {/* ----------------------------------- */}
          {/* Usage */}
          {/* ----------------------------------- */}

          <div className="my-6 border-t border-white/10 pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                Usage
              </h3>

              {usage && (
                <span
                  className={`
                    rounded-full
                    px-2.5
                    py-1
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-wider
                    ${
                      usage.plan === "free"
                        ? "border border-white/10 bg-white/5 text-gray-400"
                        : "border border-violet-400/20 bg-violet-400/10 text-violet-300"
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
                  resource={
                    usage.usage.chat_messages
                  }
                />

                <UsageItem
                  label="ICP"
                  resource={
                    usage.usage.personas
                  }
                />

                <UsageItem
                  label="Landing Pages"
                  resource={
                    usage.usage
                      .landing_page_analyses
                  }
                />

                {usage.plan === "free" && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/settings")
                    }
                    className="
                      mt-2
                      w-full
                      rounded-xl
                      border
                      border-violet-400/20
                      bg-violet-500/[0.08]
                      px-4
                      py-3
                      text-sm
                      font-medium
                      text-violet-200
                      transition
                      hover:border-violet-400/40
                      hover:bg-violet-500/[0.14]
                    "
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 text-xs text-gray-500">
                Usage unavailable.
              </div>
            )}
          </div>
        </div>

        {/* ----------------------------------- */}
        {/* Footer */}
        {/* ----------------------------------- */}

        <div className="space-y-2 border-t border-white/10 p-5">
          <SidebarItem
            icon={
              loadingAction === "settings" ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <Settings size={18} />
              )
            }
            title={
              loadingAction === "settings"
                ? "Opening..."
                : "Settings"
            }
            loading={
              loadingAction === "settings"
            }
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation(
                "settings",
                "/settings"
              )
            }
          />

          <SidebarItem
            icon={
              loadingAction === "logout" ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={18} />
              )
            }
            title={
              loadingAction === "logout"
                ? "Signing out..."
                : "Logout"
            }
            loading={
              loadingAction === "logout"
            }
            disabled={!!loadingAction}
            onClick={handleLogout}
          />
        </div>
      </aside>
    </>
  );
}

/* ----------------------------------- */
/* Usage Item */
/* ----------------------------------- */

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

  const exhausted =
    resource.remaining <= 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs text-gray-300">
          {label}
        </span>

        <span
          className={`text-xs ${
            exhausted
              ? "font-medium text-red-400"
              : "text-gray-500"
          }`}
        >
          {resource.used}/{resource.limit}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-500
            ${
              exhausted
                ? "bg-red-500/70"
                : "bg-gradient-to-r from-blue-500 to-violet-500"
            }
          `}
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-1.5 text-[10px] text-gray-600">
        {exhausted
          ? "Limit reached"
          : `${resource.remaining} remaining`}
      </p>
    </div>
  );
}

/* ----------------------------------- */
/* Usage Loading Skeleton */
/* ----------------------------------- */

function UsageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 flex justify-between">
        <div className="h-3 w-16 rounded bg-white/[0.06]" />

        <div className="h-3 w-8 rounded bg-white/[0.06]" />
      </div>

      <div className="h-1.5 rounded-full bg-white/[0.06]" />

      <div className="mt-1.5 h-2.5 w-20 rounded bg-white/[0.04]" />
    </div>
  );
}

/* ----------------------------------- */
/* Sidebar Item */
/* ----------------------------------- */

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
        group
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        p-4
        text-left
        transition-all
        duration-300
        ${
          loading
            ? "cursor-wait bg-white/[0.05]"
            : "hover:bg-white/5"
        }
        disabled:cursor-wait
      `}
    >
      <div
        className={`
          transition
          ${
            loading
              ? "text-blue-300"
              : "text-gray-400 group-hover:text-blue-400"
          }
        `}
      >
        {icon}
      </div>

      <span
        className={
          loading
            ? "text-blue-100"
            : "text-white"
        }
      >
        {title}
      </span>
    </button>
  );
}