import { useEffect, useState } from "react";
import { useLanguage } from "../i18n/LanguageContext";

// Renders nothing until /images/sizechart-{gsm}gsm.jpg exists in frontend/public,
// so the button only appears once that product's size chart image is added.
// Fit differs between the regular and oversize lines, so each GSM gets its own chart.
export function SizeChartButton({ gsm }: { gsm: number }) {
  const { t } = useLanguage();
  const src = `/images/sizechart-${gsm}gsm.jpg`;
  const [available, setAvailable] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setAvailable(true);
  }, [src]);

  if (!available) return null;

  return (
    <>
      <button className="btn secondary" style={{ marginBottom: 12 }} onClick={() => setOpen(true)}>
        {t.catalog.sizeChart}
      </button>
      {open && (
        <div className="size-chart-overlay" onClick={() => setOpen(false)}>
          <img src={src} alt={t.catalog.sizeChart} className="size-chart-image" />
        </div>
      )}
      <img src={src} alt="" style={{ display: "none" }} onError={() => setAvailable(false)} />
    </>
  );
}
