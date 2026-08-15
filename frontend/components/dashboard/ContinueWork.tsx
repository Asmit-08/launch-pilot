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
  const [openingProject, setOpeningProject] = useState<string | null>(null);

  const handleProjectOpen = (projectId: string) => {
    if (openingProject) return;

    setOpeningProject(projectId);
    router.push(`/projects/${projectId}`);
  };

  return (
    <section className="mx-auto mt-12 max-w-7xl px-6 pb-10">
      {/* Main CTA */}
      <button
        onClick={onOpenSidebar}
        className="
          group
          flex w-full items-center justify-between
          rounded-3xl
          border border-white/10
          bg-white/5
          p-6
          backdrop-blur-xl
          transition-all duration-300
          hover:border-blue-500/40
          hover:bg-white/[0.07]
        "
      >
        <div className="flex items-center gap-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg">
            <History size={24} />
          </div>

          <div className="text-left">
            <h3 className="text-xl font-semibold text-white">
              Continue Previous Work
            </h3>

            <p className="mt-1 text-gray-400">
              Open one of your previous audits and continue where you left off.
            </p>
          </div>
        </div>

        <ArrowRight
          className="text-gray-400 transition-transform duration-300 group-hover:translate-x-1"
          size={22}
        />
      </button>

      {/* Recent Projects */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-white">
          Recent Projects
        </h3>

        <div className="grid gap-4">
          {projects.map((project) => {
            const isOpening = openingProject === project.id;

            return (
              <button
                key={project.id}
                type="button"
                disabled={!!openingProject}
                onClick={() => handleProjectOpen(project.id)}
                className={`
                  group
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/5
                  p-5
                  text-left
                  transition-all
                  duration-300
                  ${
                    isOpening
                      ? "cursor-wait border-blue-500/30 bg-white/[0.08] opacity-85"
                      : "hover:border-blue-500/40 hover:bg-white/10"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                      flex h-12 w-12 items-center justify-center
                      rounded-xl
                      bg-gradient-to-br from-blue-500 to-violet-600
                      text-white
                      transition-transform duration-300
                      ${isOpening ? "scale-95" : "group-hover:scale-[1.03]"}
                    `}
                  >
                    {isOpening ? (
                      <Loader2
                        size={20}
                        className="animate-spin"
                      />
                    ) : (
                      <FolderGit2 size={20} />
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-white">
                      {project.name}
                    </h4>

                    <p className="mt-1 text-sm capitalize text-gray-400">
                      {isOpening
                        ? "Opening project..."
                        : project.stage}
                    </p>
                  </div>
                </div>

                {isOpening ? (
                  <Loader2
                    size={20}
                    className="animate-spin text-blue-300"
                  />
                ) : (
                  <ArrowRight
                    size={20}
                    className="text-gray-400 transition-transform group-hover:translate-x-1"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}