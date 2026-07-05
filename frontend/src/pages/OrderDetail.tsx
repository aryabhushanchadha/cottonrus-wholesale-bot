import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, Order, OrderStatus } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";

function formatPrice(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

const STATUS_FLOW: OrderStatus[] = ["NEW", "PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { lang, t } = useLanguage();
  const [order, setOrder] = useState<Order | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (id) api.getOrder(id).then(setOrder);
  }, [id]);

  if (!order) return <div className="content muted">Loading…</div>;

  const isCancelled = order.status === "CANCELLED";
  const currentIndex = STATUS_FLOW.indexOf(order.status);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await api.downloadInvoice(order.id, `${order.invoice?.invoiceNumber ?? order.orderNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="content">
      <h2>{order.orderNumber}</h2>
      <StatusBadge status={order.status} />

      <div className="order-card" style={{ marginTop: 16 }}>
        {order.items.map((item) => {
          const name = lang === "ru" ? item.productVariant.product.nameRu : item.productVariant.product.nameEn;
          const colorLabel = item.productVariant.color === "BLACK" ? t.catalog.black : t.catalog.white;
          return (
            <div key={item.id} className="cart-line">
              <div className="info">
                <b>{name}</b>
                <span>
                  {t.catalog.selectSize} {item.productVariant.size} · {colorLabel} · {t.cart.qty}{" "}
                  {item.quantity}
                </span>
              </div>
              <div>{formatPrice(item.lineTotalMinor, order.currency)}</div>
            </div>
          );
        })}
        <div className="summary-row total">
          <span>{t.orders.total}</span>
          <span>{formatPrice(order.totalMinor, order.currency)}</span>
        </div>
      </div>

      <h3 style={{ marginTop: 24 }}>{t.orders.trackingTitle}</h3>
      <div className="timeline">
        {!isCancelled &&
          STATUS_FLOW.map((status, idx) => (
            <div
              className="timeline-item"
              key={status}
              style={{ opacity: idx <= currentIndex ? 1 : 0.35 }}
            >
              <span className="dot" />
              {t.status[status]}
            </div>
          ))}
        {isCancelled && (
          <div className="timeline-item">
            <span className="dot" />
            {t.status.CANCELLED}
          </div>
        )}
      </div>

      {order.invoice && (
        <button className="btn secondary" style={{ marginTop: 20 }} onClick={handleDownload} disabled={downloading}>
          {t.orders.downloadInvoice}
        </button>
      )}
    </div>
  );
}
