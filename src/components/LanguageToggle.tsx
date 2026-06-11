"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../utils/cn";

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
      <span className="text-sm font-medium text-black dark:text-white">
        {lang === 'en' ? '🇬🇧 EN' : '🇪🇸 ES'}
      </span>
    </button>
  );
};
