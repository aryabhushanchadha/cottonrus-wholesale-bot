import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { en } from "./en";
import { ru } from "./ru";
import { getPreferredLanguage } from "../telegram";

type Lang = "en" | "ru";
const dictionaries = { en, ru };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: typeof en;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(getPreferredLanguage());
  const value = useMemo(() => ({ lang, setLang, t: dictionaries[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
