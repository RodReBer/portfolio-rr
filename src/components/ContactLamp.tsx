"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "./LampContainer";
import { useTranslation } from "../i18n/useTranslation";

export const ContactLamp = () => {
  const { t } = useTranslation();

  return (
    <LampContainer className="min-h-[30vh] md:min-h-[50vh]">
      <motion.h1
        initial={{ opacity: 0.5, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-slate-300 to-slate-500 py-2 bg-clip-text text-center text-xl sm:text-2xl md:text-5xl lg:text-7xl font-medium tracking-tight text-transparent"
      >
        {t("contact.lamp.title")}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0.5, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          delay: 0.5,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-2 text-center text-slate-400 text-xs sm:text-sm md:text-lg max-w-[260px] md:max-w-md"
      >
        {t("contact.lamp.subtitle")}
      </motion.p>
    </LampContainer>
  );
};
