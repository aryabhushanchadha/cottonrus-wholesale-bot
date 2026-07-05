import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, Customer, Order } from "../api/client";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../i18n/LanguageContext";
import { getTelegramWebApp } from "../telegram";

const VAT_RATE = 0.2; // must match backend VAT_RATE_BPS; shown here for a live estimate only

function formatPrice(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function Checkout() {
  const { lines, subtotalMinor, clear } = useCart();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    inn: "",
    address: "",
    phone: "",
    email: "",
  });
  const [notes, setNotes] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMe().then((me) => {
      setCustomer(me);
      setForm({
        companyName: me.companyName ?? "",
        fullName: me.fullName ?? "",
        inn: me.inn ?? "",
        address: me.address ?? "",
        phone: me.phone ?? "",
        email: me.email ?? "",
      });
    });
  }, []);

  useEffect(() => {
    if (lines.length === 0 && !order) {
      navigate("/cart");
    }
  }, [lines.length, order, navigate]);

  if (lines.length === 0 && !order) {
    return null;
  }

  const currency = lines[0]?.variant.currency ?? "RUB";
  const vatMinor = Math.round(subtotalMinor * VAT_RATE);
  const totalMinor = subtotalMinor + vatMinor;

  const handlePlaceOrder = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.updateMe(form);
      const created = await api.createOrder(
        lines.map((l) => ({ productVariantId: l.variant.id, quantity: l.quantity })),
        notes || undefined
      );
      setOrder(created);
      clear();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const handlePay = async (provider: "stripe" | "yookassa") => {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const result =
        provider === "stripe" ? await api.payWithStripe(order.id) : await api.payWithYooKassa(order.id);
      const webApp = getTelegramWebApp();
      if (webApp) webApp.openLink(result.checkoutUrl);
      else window.location.href = result.checkoutUrl;
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="content">
      <h2>{t.checkout.title}</h2>

      {customer && (
        <div className="muted" style={{ marginBottom: 16 }}>
          {t.checkout.customerId}: <b>{customer.customerCode}</b>
        </div>
      )}

      {!order && (
        <>
          <div className="form-field">
            <label>{t.checkout.companyName}</label>
            <input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.contactName}</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.inn}</label>
            <input value={form.inn} onChange={(e) => setForm({ ...form, inn: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.address}</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.phone}</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.email}</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-field">
            <label>{t.checkout.notes}</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <p className="muted">{t.checkout.requisitesRequired}</p>

          <div className="summary-row">
            <span>{t.cart.subtotal}</span>
            <span>{formatPrice(subtotalMinor, currency)}</span>
          </div>
          <div className="summary-row">
            <span>{t.cart.vat} (20%)</span>
            <span>{formatPrice(vatMinor, currency)}</span>
          </div>
          <div className="summary-row total">
            <span>{t.cart.total}</span>
            <span>{formatPrice(totalMinor, currency)}</span>
          </div>

          {error && <p className="muted">{error}</p>}

          <button className="btn" onClick={handlePlaceOrder} disabled={busy}>
            {t.checkout.placeOrder}
          </button>
        </>
      )}

      {order && (
        <>
          <p className="muted">{t.checkout.orderPlaced}</p>
          <div className="order-card">
            <div className="top-row">
              <b>{order.orderNumber}</b>
              <span>{formatPrice(order.totalMinor, order.currency)}</span>
            </div>
          </div>
          {error && <p className="muted">{error}</p>}
          <button className="btn" style={{ marginBottom: 10 }} onClick={() => handlePay("stripe")} disabled={busy}>
            {t.checkout.payWithCard}
          </button>
          <button className="btn secondary" onClick={() => handlePay("yookassa")} disabled={busy}>
            {t.checkout.payWithYooKassa}
          </button>
        </>
      )}
    </div>
  );
}
