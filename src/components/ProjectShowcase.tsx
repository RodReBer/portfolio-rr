"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "../i18n/useTranslation";

interface Project {
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  imageSrc: string;
  linkProject: string;
  inProgress?: boolean;
  authorName?: string;
  authorNameSec?: string;
  authorImage?: string;
}

interface ProjectShowcaseProps {
  projects: Project[];
}

export const ProjectShowcase: React.FC<ProjectShowcaseProps> = ({
  projects,
}) => {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-6xl mx-auto"
      onMouseMove={handleMouseMove}
    >
      {/* Project List */}
      <div className="relative z-10">
        {projects.map((project, index) => {
          const displayTitle = project.titleKey
            ? t(project.titleKey as any)
            : project.title;
          const displayDescription = project.descriptionKey
            ? t(project.descriptionKey as any)
            : project.description;
          const isActive = activeIndex === index;

          return (
            <div
              key={index}
              className="group relative border-b border-white/10 transition-all duration-500"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Main Row */}
              <div className="flex items-center justify-between py-6 md:py-8 px-4 cursor-pointer">
                {/* Number */}
                <span
                  className="text-cyan-400/50 font-mono text-sm md:text-base w-12 transition-all duration-300"
                  style={{
                    transform: isActive ? "translateX(10px)" : "translateX(0)",
                    color: isActive ? "#22d3ee" : undefined,
                  }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Title */}
                <h3
                  className="flex-1 text-xl md:text-3xl lg:text-4xl font-bold text-white transition-all duration-500"
                  style={{
                    transform: isActive ? "translateX(20px)" : "translateX(0)",
                    textShadow: isActive
                      ? "0 0 30px rgba(34, 211, 238, 0.5)"
                      : "none",
                  }}
                >
                  {displayTitle}
                </h3>

                {/* Status / Arrow */}
                <div className="ml-4 flex items-center gap-3">
                  {project.inProgress ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400">
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="hidden md:inline">
                        {t("projects.inProgress")}
                      </span>
                    </span>
                  ) : (
                    <a
                      href={project.linkProject}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 transition-all duration-300 hover:bg-cyan-400 hover:border-cyan-400 group/btn"
                      style={{
                        transform: isActive
                          ? "rotate(-45deg) scale(1.1)"
                          : "rotate(0)",
                        borderColor: isActive ? "#22d3ee" : undefined,
                      }}
                    >
                      <svg
                        className="w-5 h-5 text-white transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </div>

              {/* Expanded Preview - Shows on hover */}
              <div
                className="overflow-hidden transition-all duration-500 ease-out"
                style={{
                  maxHeight: isActive ? "400px" : "0",
                  opacity: isActive ? 1 : 0,
                }}
              >
                <div className="px-4 pb-8 flex flex-col md:flex-row gap-6">
                  {/* Image Preview */}
                  <div className="relative w-full md:w-1/2 aspect-video rounded-xl overflow-hidden">
                    <img
                      src={project.imageSrc}
                      alt={displayTitle}
                      className="w-full h-full object-cover transition-transform duration-700"
                      style={{
                        transform: isActive ? "scale(1.05)" : "scale(1)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                    {/* Author badge */}
                    {project.authorImage && (
                      <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <img
                          src={project.authorImage}
                          alt={project.authorName}
                          className="w-8 h-8 rounded-full object-cover bg-gray-700"
                        />
                        <div className="text-sm">
                          <p className="font-medium text-white">
                            {project.authorName}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {project.authorNameSec}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-gray-300 text-base md:text-lg leading-relaxed mb-6">
                      {displayDescription}
                    </p>

                    {!project.inProgress && (
                      <a
                        href={project.linkProject}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-cyan-400 font-medium hover:text-cyan-300 transition-colors group/link"
                      >
                        {t("projects.view")}
                        <svg
                          className="w-4 h-4 transition-transform group-hover/link:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Hover Line Accent */}
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-400 to-cyan-500 transition-all duration-500"
                style={{
                  width: isActive ? "100%" : "0%",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectShowcase;
