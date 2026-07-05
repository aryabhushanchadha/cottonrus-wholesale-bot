import { useLanguage } from "../i18n/LanguageContext";
import type { OrderStatus } from "../api/client";

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useLanguage();
  return <span className={`status-badge status-${status}`}>{t.status[status]}</span>;
}
