import { useLanguage } from "../i18n/LanguageContext";

export function Header() {
  const { lang, setLang, t } = useLanguage();
  return (
    <header className="header">
      <h1>{t.appName}</h1>
      <div className="lang-switch">
        <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
          EN
        </button>
        <button className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>
          RU
        </button>
      </div>
    </header>
  );
}
