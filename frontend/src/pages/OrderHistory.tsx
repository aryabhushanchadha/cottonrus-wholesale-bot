import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Order } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";

function formatPrice(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function OrderHistory() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div className="content">
      <h2>{t.orders.title}</h2>
      {loading && <p className="muted">Loading…</p>}
      {!loading && orders.length === 0 && <div className="empty-state">{t.orders.empty}</div>}
      {orders.map((o) => (
        <Link to={`/orders/${o.id}`} key={o.id} style={{ textDecoration: "none" }}>
          <div className="order-card">
            <div className="top-row">
              <b>{o.orderNumber}</b>
              <StatusBadge status={o.status} />
            </div>
            <div className="muted">
              {t.orders.total}: {formatPrice(o.totalMinor, o.currency)}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
