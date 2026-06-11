"use client";

import React, { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

interface BentoCardProps {
  imageSrc: string;
  title: string;
  titleKey?: string;
  description: string;
  descriptionKey?: string;
  linkProject: string;
  tags: Array<{
    name: string;
    class: string;
  }>;
  inProgress?: boolean;
  featured?: boolean;
  authorImage?: string;
  authorName?: string;
  authorNameSec?: string;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  imageSrc,
  title,
  titleKey,
  description,
  descriptionKey,
  linkProject,
  tags,
  inProgress = false,
  featured = false,
  authorImage,
  authorName,
  authorNameSec,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const displayTitle = titleKey ? t(titleKey as any) : title;
  const displayDescription = descriptionKey ? t(descriptionKey as any) : description;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm transition-all duration-500 hover:border-cyan-400/30 hover:shadow-glow-cyan ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageSrc}
          alt={displayTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
      </div>

      {/* In Progress Badge */}
      {inProgress && (
        <div className="absolute top-4 right-4 z-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {t("projects.inProgress")}
          </span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6">
        {/* Tags with animations */}
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.slice(0, featured ? 5 : 3).map((tag, index) => (
            <span
              key={index}
              className={`project-tag text-xs px-2.5 py-1 rounded-full border backdrop-blur-sm cursor-default ${tag.class}`}
              style={{
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                transitionDelay: isHovered ? `${index * 50}ms` : "0ms",
                transform: isHovered
                  ? "translateY(0) scale(1)"
                  : "translateY(8px) scale(0.9)",
                opacity: isHovered ? 1 : 0.7,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.1)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px -4px currentColor";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = isHovered
                  ? "translateY(0) scale(1)"
                  : "translateY(8px) scale(0.9)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h3
          className={`font-bold text-white mb-2 ${featured ? "text-2xl md:text-3xl" : "text-xl"}`}
        >
          {displayTitle}
        </h3>

        {/* Description - Only show on featured or hover */}
        <p
          className={`text-gray-400 text-sm mb-4 transition-all duration-300 ${
            featured
              ? "line-clamp-3"
              : isHovered
                ? "line-clamp-2 opacity-100"
                : "line-clamp-1 opacity-0 h-0"
          }`}
        >
          {displayDescription}
        </p>

        {/* Author Info & CTA */}
        <div className="flex items-center justify-between">
          {authorImage && (
            <div className="flex items-center gap-3">
              <img
                src={authorImage}
                alt={authorName}
                className="w-8 h-8 rounded-full object-cover bg-gray-700"
              />
              <div className="text-sm">
                <p className="font-medium text-white">{authorName}</p>
                <p className="text-gray-500 text-xs">{authorNameSec}</p>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {inProgress ? (
            <span className="px-4 py-2 rounded-xl bg-gray-600/50 text-gray-400 text-sm font-medium cursor-not-allowed">
              {t("projects.inProgress")}
            </span>
          ) : (
            <a
              href={linkProject}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-medium hover:bg-cyan-500/30 transition-all duration-300 group/btn"
            >
              {t("projects.view")}
              <svg
                className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
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

      {/* Hover overlay glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-cyan-500/10 to-transparent opacity-0 transition-opacity duration-500 ${
          isHovered ? "opacity-100" : ""
        }`}
      />
    </div>
  );
};

// Bento Grid Container
interface BentoGridProps {
  children: React.ReactNode;
}

export const BentoGrid: React.FC<BentoGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]">
      {children}
    </div>
  );
};
