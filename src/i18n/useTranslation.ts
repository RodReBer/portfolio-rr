import { useState, useEffect } from 'react';
import { ui, defaultLang } from './languages';

type Lang = keyof typeof ui;
type TranslationKey = keyof typeof ui[typeof defaultLang];

export function useTranslation() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('language') as Lang) || defaultLang;
    }
    return defaultLang;
  });

  useEffect(() => {
    const handler = (e: Event) => setLang((e as CustomEvent<Lang>).detail);
    window.addEventListener('languageChange', handler);
    return () => window.removeEventListener('languageChange', handler);
  }, []);

  function t(key: TranslationKey): string {
    return (ui[lang][key] || ui[defaultLang][key]) as string;
  }

  return { t, lang };
}
