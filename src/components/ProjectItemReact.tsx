"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "./Card3D";
import { cn } from "../utils/cn";
import { useTranslation } from "../i18n/useTranslation";

interface ProjectItemProps {
  imageSrc: string;
  date: string;
  linkProject: string;
  title: string;
  titleKey?: string;
  content: string;
  contentKey?: string;
  authorImage: string;
  authorName: string;
  authorNameSec: string;
  textColor: string;
  inProgress?: boolean;
  tags: Array<{
    name: string;
    class: string;
    icon?: React.ComponentType<{ class?: string }>;
  }>;
}

export const ProjectItemReact: React.FC<ProjectItemProps> = ({
  imageSrc,
  date,
  linkProject,
  title,
  titleKey,
  content,
  contentKey,
  authorImage,
  authorName,
  authorNameSec,
  textColor,
  tags,
  inProgress = false,
}) => {
  const { t } = useTranslation();

  const displayTitle = titleKey ? t(titleKey as any) : title;
  const displayContent = contentKey ? t(contentKey as any) : content;

  return (
    <CardContainer className="inter-var">
      <CardBody className="bg-gradient-to-t from-black/10 to-violet-500/50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-orange-400/[0.1] dark:bg-gradient-to-t dark:from-white/5 dark:to-white/5 border-black/[0.1] dark:border-white/[0.2] w-auto sm:w-full h-auto rounded-xl p-6 border">
        {inProgress && (
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              {t("projects.inProgress")}
            </span>
          </div>
        )}
        <CardItem
          translateZ="50"
          className="text-xl font-bold text-neutral-600 dark:text-white"
        >
          {displayTitle}
        </CardItem>

        <CardItem
          className="mt-4 flex items-center gap-3 text-xs flex-wrap"
          translateZ="40"
        >
          <time dateTime={date} className="text-gray-500">
            {date}
          </time>
          <div className="flex gap-3 flex-row flex-wrap">
            {tags.map((tag, index) => (
              <div
                key={index}
                className={cn(
                  "flex gap-x-2 rounded-full border px-2 py-1 font-xs",
                  tag.class,
                )}
              >
                {tag.icon && <tag.icon class="size-4" />}
                {tag.name}
              </div>
            ))}
          </div>
        </CardItem>

        <CardItem translateZ="100" className="w-full mt-4">
          <img
            src={imageSrc}
            height="1000"
            width="1000"
            className="h-60 w-full object-cover rounded-xl group-hover/card:shadow-xl"
            alt={`Screenshot of ${displayTitle} project`}
          />
        </CardItem>

        <CardItem
          as="p"
          translateZ="60"
          className="text-neutral-500 text-sm max-w-full mt-4 dark:text-neutral-300"
        >
          {displayContent}
        </CardItem>

        <div className="flex justify-between items-center mt-8">
          <CardItem translateZ={20} className="flex items-center gap-x-3">
            <img
              src={authorImage}
              alt={authorName}
              className="h-10 w-10 rounded-full bg-gray-100"
            />
            <div className="text-sm leading-6">
              <p className="font-semibold" style={{ color: textColor }}>
                {authorName}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {authorNameSec}
              </p>
            </div>
          </CardItem>

          {inProgress ? (
            <CardItem
              translateZ={20}
              className="px-4 py-2 rounded-xl bg-gray-400 dark:bg-gray-600 text-white text-xs font-bold cursor-not-allowed opacity-70"
            >
              {t("projects.inProgress")}
            </CardItem>
          ) : (
            <CardItem
              translateZ={20}
              as="a"
              href={linkProject}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl bg-violet-600 dark:bg-orange-400 dark:text-black text-white text-xs font-bold hover:opacity-80 transition-opacity"
            >
              {t("projects.view")}
            </CardItem>
          )}
        </div>
      </CardBody>
    </CardContainer>
  );
};
