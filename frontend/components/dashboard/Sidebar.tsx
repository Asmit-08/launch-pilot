"use client";

import { useState } from "react";
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
    action: Exclude<LoadingAction, `project:${string}` | "logout" | null>,
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
          fixed inset-0 z-90 bg-black/50 backdrop-blur-sm
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
        {/* Header */}
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
            <X size={20} className="text-white" />
          </button>
        </div>

        {/* Scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Recent Projects */}
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
                            bg-gradient-to-br from-blue-500 to-violet-600
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

          {/* Divider */}
          <div className="my-6 border-t border-white/10" />

          {/* Quick Actions */}
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
                loading={loadingAction === "audit"}
                disabled={!!loadingAction}
                onClick={() =>
                  handleNavigation("audit", "/dashboard")
                }
              />

              <SidebarItem
                icon={
                  loadingAction === "landing-pages" ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Globe size={18} />
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
        </div>

        {/* Footer */}
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
            loading={loadingAction === "settings"}
            disabled={!!loadingAction}
            onClick={() =>
              handleNavigation("settings", "/settings")
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
            loading={loadingAction === "logout"}
            disabled={!!loadingAction}
            onClick={handleLogout}
          />
        </div>
      </aside>
    </>
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
        className={`${
          loading ? "text-blue-100" : "text-white"
        }`}
      >
        {title}
      </span>
    </button>
  );
}