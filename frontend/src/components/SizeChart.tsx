import { useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

// Renders nothing if /size-chart.jpg hasn't been placed in frontend/public yet,
// so the button only appears once the real size chart image is added.
export function SizeChartButton() {
  const { t } = useLanguage();
  const [available, setAvailable] = useState(true);
  const [open, setOpen] = useState(false);

  if (!available) return null;

  return (
    <>
      <button className="btn secondary" style={{ marginBottom: 16 }} onClick={() => setOpen(true)}>
        {t.catalog.sizeChart}
      </button>
      {open && (
        <div className="size-chart-overlay" onClick={() => setOpen(false)}>
          <img
            src="/size-chart.jpg"
            alt={t.catalog.sizeChart}
            className="size-chart-image"
            onError={() => setAvailable(false)}
          />
        </div>
      )}
      <img src="/size-chart.jpg" alt="" style={{ display: "none" }} onError={() => setAvailable(false)} />
    </>
  );
}
