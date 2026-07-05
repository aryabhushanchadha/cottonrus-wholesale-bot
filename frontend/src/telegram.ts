interface TelegramWebApp {
  initData: string;
  initDataUnsafe?: { user?: { id: number; first_name?: string; username?: string; language_code?: string } };
  ready: () => void;
  expand: () => void;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  MainButton: {
    text: string;
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
    offClick: (fn: () => void) => void;
    setText: (text: string) => void;
  };
  BackButton: {
    show: () => void;
    hide: () => void;
    onClick: (fn: () => void) => void;
  };
  openLink: (url: string) => void;
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return window.Telegram?.WebApp ?? null;
}

// A stable fake identity used only when the app is opened outside of Telegram
// (plain browser preview during local development).
const DEV_FALLBACK_USER = { id: 999000111, first_name: "Demo Buyer", language_code: "en" };

export function getAuthHeaders(): Record<string, string> {
  const webApp = getTelegramWebApp();
  if (webApp?.initData) {
    return { "x-telegram-init-data": webApp.initData };
  }
  const user = webApp?.initDataUnsafe?.user ?? DEV_FALLBACK_USER;
  return {
    "x-debug-telegram-id": String(user.id),
    "x-debug-name": user.first_name ?? "Demo Buyer",
    "x-debug-lang": user.language_code ?? "en",
  };
}

export function getPreferredLanguage(): "en" | "ru" {
  const webApp = getTelegramWebApp();
  const code = webApp?.initDataUnsafe?.user?.language_code ?? navigator.language;
  return code?.toLowerCase().startsWith("ru") ? "ru" : "en";
}
