import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../i18n/LanguageContext";
import { VAT_RATE } from "../constants";

function formatPrice(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

export function Cart() {
  const { lines, removeLine, updateQuantity, subtotalMinor } = useCart();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const currency = lines[0]?.variant.currency ?? "RUB";
  const vatMinor = Math.round(subtotalMinor * VAT_RATE);
  const totalMinor = subtotalMinor + vatMinor;

  if (lines.length === 0) {
    return (
      <div className="content">
        <h2>{t.cart.title}</h2>
        <div className="empty-state">{t.cart.empty}</div>
      </div>
    );
  }

  return (
    <div className="content">
      <h2>{t.cart.title}</h2>
      {lines.map((line) => {
        const name = lang === "ru" ? line.product.nameRu : line.product.nameEn;
        const colorLabel = line.variant.color === "BLACK" ? t.catalog.black : t.catalog.white;
        return (
          <div className="cart-line" key={line.variant.id}>
            <div className="info">
              <b>{name}</b>
              <span>
                {t.catalog.selectSize} {line.variant.size} · {colorLabel}
              </span>
              <div style={{ marginTop: 6, display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  className="qty-input"
                  type="number"
                  min={line.variant.minOrderQty}
                  max={line.variant.stockQty}
                  value={line.quantity}
                  onChange={(e) => updateQuantity(line.variant.id, Number(e.target.value))}
                />
                <button className="btn secondary" style={{ width: "auto", padding: "6px 10px" }} onClick={() => removeLine(line.variant.id)}>
                  {t.cart.remove}
                </button>
              </div>
            </div>
            <div>{formatPrice(line.variant.priceMinor * line.quantity, line.variant.currency)}</div>
          </div>
        );
      })}

      <div className="summary-row">
        <span>{t.cart.subtotal}</span>
        <span>{formatPrice(subtotalMinor, currency)}</span>
      </div>
      <div className="summary-row">
        <span>
          {t.cart.vat} ({(VAT_RATE * 100).toFixed(0)}%)
        </span>
        <span>{formatPrice(vatMinor, currency)}</span>
      </div>
      <div className="summary-row total">
        <span>{t.cart.total}</span>
        <span>{formatPrice(totalMinor, currency)}</span>
      </div>

      <button className="btn" style={{ marginTop: 16 }} onClick={() => navigate("/checkout")}>
        {t.cart.checkout}
      </button>
    </div>
  );
}
