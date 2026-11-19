import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import en from "@/locales/en.json";
import bn from "@/locales/bn.json";
import hi from "@/locales/hi.json";

export type SupportedLanguage = "en" | "bn" | "hi";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
];

const translations: Record<SupportedLanguage, any> = {
  en,
  bn,
  hi,
};

const LANG_STORAGE_KEY = "stampSafar.lang";
export const LANGUAGE_CHANGED_EVENT = "stampSafar:lang-changed";

interface I18nContextType {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
  t: (path: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (path: string, fallback?: string) => fallback || path,
});

export function getSavedLanguage(): SupportedLanguage {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as SupportedLanguage;
    if (saved && (saved === "en" || saved === "bn" || saved === "hi")) {
      return saved;
    }
  } catch {}
  return "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<SupportedLanguage>(() => getSavedLanguage());

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
      window.dispatchEvent(new CustomEvent(LANGUAGE_CHANGED_EVENT, { detail: newLang }));
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = lang;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === LANG_STORAGE_KEY && e.newValue) {
        if (e.newValue === "en" || e.newValue === "bn" || e.newValue === "hi") {
          setLangState(e.newValue as SupportedLanguage);
          document.documentElement.lang = e.newValue;
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [lang]);

  // Nested property resolver (e.g. "hero.headlinePrefix")
  const t = (path: string, fallback?: string): string => {
    const keys = path.split(".");
    let current = translations[lang];

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation is missing in current language
        let enFallback = translations["en"];
        for (const fKey of keys) {
          if (enFallback && typeof enFallback === "object" && fKey in enFallback) {
            enFallback = enFallback[fKey];
          } else {
            return fallback || path;
          }
        }
        return typeof enFallback === "string" ? enFallback : fallback || path;
      }
    }

    return typeof current === "string" ? current : fallback || path;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
