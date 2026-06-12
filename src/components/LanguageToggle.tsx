"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../utils/cn";

const FlagGB = () => (
  <svg viewBox="0 0 60 30" className="w-5 h-auto rounded-[2px] shadow-sm" aria-hidden="true">
    <clipPath id="gb-clip">
      <path d="M0 0v30h60V0z" />
    </clipPath>
    <clipPath id="gb-clip2">
      <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
    </clipPath>
    <g clipPath="url(#gb-clip)">
      <path d="M0 0v30h60V0z" fill="#012169" />
      <path d="M0 0l60 30m0-30L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30m0-30L0 30" clipPath="url(#gb-clip2)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </g>
  </svg>
);

const FlagES = () => (
  <svg viewBox="0 0 60 30" className="w-5 h-auto rounded-[2px] shadow-sm" aria-hidden="true">
    <path d="M0 0h60v30H0z" fill="#c60b1e" />
    <path d="M0 7.5h60v15H0z" fill="#ffc400" />
  </svg>
);

export const LanguageToggle = () => {
  const [lang, setLang] = useState<'en' | 'es'>('en');

  useEffect(() => {
    // Get initial language from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language') as 'en' | 'es' || 'en';
    setLang(savedLang);
    document.documentElement.setAttribute('data-lang', savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'es' : 'en';
    setLang(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.setAttribute('data-lang', newLang);

    // Trigger custom event to notify other components
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-black/10 dark:bg-white/10 backdrop-blur-sm",
        "border border-black/20 dark:border-white/20",
        "hover:bg-black/20 dark:hover:bg-white/20",
        "transition-all duration-300"
      )}
      aria-label="Toggle language"
      type="button"
    >
      {lang === 'en' ? <FlagGB /> : <FlagES />}
      <span className="text-sm font-medium text-black dark:text-white">
        {lang === 'en' ? 'EN' : 'ES'}
      </span>
    </button>
  );
};
