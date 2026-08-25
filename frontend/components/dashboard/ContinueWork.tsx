"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  History,
  FolderGit2,
  Loader2,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  stage: string;
  updated_at?: string;
}

interface ContinueWorkProps {
  onOpenSidebar: () => void;
  projects: Project[];
}

export default function ContinueWork({
  onOpenSidebar,
  projects,
}: ContinueWorkProps) {
  const router = useRouter();

  const [openingProject, setOpeningProject] =
    useState<string | null>(null);

  const handleProjectOpen = (projectId: string) => {
    if (openingProject) return;

    setOpeningProject(projectId);
    router.push(`/projects/${projectId}`);
  };

  return (
    <section className="mx-auto max-w-7xl px-6 pb-12 pt-10">
      {/* Continue banner */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
            <History size={21} />
          </div>

          <div>
            <h3 className="font-bold text-slate-900">
              Continue previous work
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Open your saved audits and continue where you left off.
            </p>
          </div>
        </div>

        <ArrowRight
          size={19}
          className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900"
        />
      </button>

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>

              <h3 className="mt-1 text-xl font-bold text-slate-950">
                Recent projects
              </h3>
            </div>

            <span className="text-xs font-medium text-slate-400">
              {projects.length} saved
            </span>
          </div>

          <div className="grid gap-3">
            {projects.map((project) => {
              const isOpening =
                openingProject === project.id;

              return (
                <button
                  key={project.id}
                  type="button"
                  disabled={!!openingProject}
                  onClick={() =>
                    handleProjectOpen(project.id)
                  }
                  className={`
                    group flex w-full items-center justify-between
                    rounded-2xl border border-slate-200
                    bg-white p-4 text-left
                    shadow-sm transition
                    ${
                      isOpening
                        ? "cursor-wait border-blue-200 opacity-80"
                        : "hover:border-slate-300 hover:shadow-md"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                      {isOpening ? (
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />
                      ) : (
                        <FolderGit2 size={19} />
                      )}
                    </div>

                    <div>
                      <h4 className="font-semibold text-slate-900">
                        {project.name}
                      </h4>

                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {isOpening
                          ? "Opening project..."
                          : project.stage}
                      </p>
                    </div>
                  </div>

                  {isOpening ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-blue-600"
                    />
                  ) : (
                    <ArrowRight
                      size={18}
                      className="text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-900"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}