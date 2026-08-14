"use client";

import { useRouter } from "next/navigation";
import {
  X,
  FolderGit2,
  Plus,
  Globe,
  Settings,
  LogOut,
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

export default function Sidebar({
  isOpen,
  onClose,
  projects,
}: SidebarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      onClose();

      await signOut();

      router.replace("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  function handleProjectClick(projectId: string) {
    onClose();

    router.push(`/projects/${projectId}`);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`
          fixed inset-0 z-40 bg-black/50 backdrop-blur-sm
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
          fixed left-0 top-0 z-50
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
              Launch Pilot
            </h2>

            <p className="text-sm text-gray-400">
              Workspace
            </p>
          </div>

          <button
            onClick={onClose}
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
                projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() =>
                      handleProjectClick(project.id)
                    }
                    className="
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
                      transition-all
                      duration-300
                      hover:border-blue-500/30
                      hover:bg-white/10
                    "
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 p-2 text-white">
                        <FolderGit2 size={18} />
                      </div>

                      <div className="text-left">
                        <p className="font-medium text-white">
                          {project.name}
                        </p>

                        <p className="text-xs capitalize text-gray-400">
                          {project.stage}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
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
                icon={<Plus size={18} />}
                title="New Audit"
                onClick={() => {
                  onClose();
                  router.push("/dashboard");
                }}
              />

              <SidebarItem
                icon={<Globe size={18} />}
                title="Landing Pages"
                onClick={() => {
                  onClose();
                  router.push("/landing-pages");
                }}
              />

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="space-y-2 border-t border-white/10 p-5">

          <SidebarItem
            icon={<Settings size={18} />}
            title="Settings"
            onClick={() => {
              onClose();
              router.push("/settings");
            }}
          />

          <SidebarItem
            icon={<LogOut size={18} />}
            title="Logout"
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
}

function SidebarItem({
  icon,
  title,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className="
        group
        flex
        w-full
        items-center
        gap-4
        rounded-2xl
        p-4
        transition-all
        duration-300
        hover:bg-white/5
      "
    >
      <div className="text-gray-400 transition group-hover:text-blue-400">
        {icon}
      </div>

      <span className="text-white">
        {title}
      </span>
    </button>
  );
}