import { en } from "./en";
import { ru } from "./ru";
import type { Language } from "@prisma/client";

const dictionaries = { EN: en, RU: ru };

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ""));
}

export function t(
  lang: Language,
  path: string,
  vars?: Record<string, string | number>
): string {
  const dict = dictionaries[lang] ?? dictionaries.EN;
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, dict);

  if (typeof value !== "string") {
    return path;
  }
  return interpolate(value, vars);
}

export function detectLanguage(telegramLanguageCode?: string): Language {
  return telegramLanguageCode?.toLowerCase().startsWith("ru") ? "RU" : "EN";
}
