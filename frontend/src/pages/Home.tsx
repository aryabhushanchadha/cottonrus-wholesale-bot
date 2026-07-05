import { useNavigate } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { COMPANY } from "../constants";

export function Home() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="content">
      <h2 style={{ marginBottom: 2 }}>{t.home.companyName}</h2>
      <p className="subtitle">{t.home.tagline}</p>

      <p style={{ lineHeight: 1.6, marginBottom: 20 }}>{t.home.intro}</p>

      <h3 style={{ marginBottom: 12 }}>{t.home.promiseTitle}</h3>

      <div className="promise-card">
        <div className="promise-icon">✓</div>
        <div>
          <h4>{t.home.qualityTitle}</h4>
          <p className="muted">{t.home.qualityText}</p>
        </div>
      </div>

      <div className="promise-card">
        <div className="promise-icon">₽</div>
        <div>
          <h4>{t.home.priceTitle}</h4>
          <p className="muted">{t.home.priceText}</p>
        </div>
      </div>

      <div className="promise-card">
        <div className="promise-icon">🚚</div>
        <div>
          <h4>{t.home.deliveryTitle}</h4>
          <p className="muted">{t.home.deliveryText}</p>
        </div>
      </div>

      <button className="btn" style={{ margin: "24px 0" }} onClick={() => navigate("/catalog")}>
        {t.home.cta}
      </button>

      <div className="company-card">
        <h4 style={{ marginTop: 0 }}>{t.home.contactTitle}</h4>
        <p>{t.home.companyName}</p>
        <p>
          {t.home.inn}: {COMPANY.inn}
        </p>
        <p>Email: {COMPANY.email}</p>
        <p>Telegram: {COMPANY.telegram}</p>
      </div>
    </div>
  );
}
