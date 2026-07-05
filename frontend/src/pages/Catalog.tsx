import { useEffect, useState } from "react";
import { api, Product, ProductVariant } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { useCart } from "../context/CartContext";
import { SizeChartButton } from "../components/SizeChart";

function formatPrice(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

function ProductCard({ product }: { product: Product }) {
  const { lang, t } = useLanguage();
  const { addLine } = useCart();

  const sizes = [...new Set(product.variants.map((v) => v.size))].sort((a, b) => a - b);
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState<"BLACK" | "WHITE">("BLACK");
  const variant = product.variants.find((v) => v.size === size && v.color === color) as
    | ProductVariant
    | undefined;
  const [qty, setQty] = useState(variant?.minOrderQty ?? 10);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (variant) setQty(variant.minOrderQty);
  }, [variant?.id]);

  const name = lang === "ru" ? product.nameRu : product.nameEn;
  const description = lang === "ru" ? product.descriptionRu : product.descriptionEn;
  const fit = lang === "ru" ? product.fitRu : product.fitEn;

  const handleAdd = () => {
    if (!variant || qty < variant.minOrderQty || qty > variant.stockQty) return;
    addLine(product, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="product-card">
      {variant && variant.images.length > 0 && (
        <div className="product-gallery">
          {variant.images.map((src) => (
            <img key={src} src={src} alt={name} className="product-photo" />
          ))}
        </div>
      )}
      <h2>{name}</h2>
      <p className="muted" style={{ marginBottom: 10 }}>
        {description}
      </p>
      <div className="product-meta">
        <span>
          {t.catalog.material} · {t.catalog.gsm}: {product.gsm} GSM
        </span>
      </div>
      <div className="product-meta">
        <span>
          {t.catalog.fit}: {fit}
        </span>
      </div>

      <div className="muted" style={{ marginBottom: 6 }}>
        {t.catalog.selectSize}
      </div>
      <div className="swatch-row">
        {sizes.map((s) => (
          <button
            key={s}
            className={`swatch ${s === size ? "selected" : ""}`}
            onClick={() => setSize(s)}
          >
            {s}
          </button>
        ))}
      </div>
      <SizeChartButton gsm={product.gsm} />

      <div className="muted" style={{ marginBottom: 6 }}>
        {t.catalog.selectColor}
      </div>
      <div className="swatch-row">
        <button
          className={`swatch ${color === "BLACK" ? "selected" : ""}`}
          onClick={() => setColor("BLACK")}
        >
          <span className="color-dot black" />
          {t.catalog.black}
        </button>
        <button
          className={`swatch ${color === "WHITE" ? "selected" : ""}`}
          onClick={() => setColor("WHITE")}
        >
          <span className="color-dot white" />
          {t.catalog.white}
        </button>
      </div>

      {variant && (
        <>
          <div className="price-row">
            <span className="price">{formatPrice(variant.priceMinor, variant.currency)}</span>
            <span className="muted">{t.catalog.pricePerUnit}</span>
          </div>
          <div className="muted" style={{ marginBottom: 10 }}>
            {t.catalog.minOrder}: {variant.minOrderQty} {t.catalog.units} · {variant.stockQty}{" "}
            {t.catalog.inStock}
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <input
              className="qty-input"
              type="number"
              min={variant.minOrderQty}
              max={variant.stockQty}
              step={1}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
            />
          </div>
          <button className="btn" onClick={handleAdd} disabled={qty < variant.minOrderQty}>
            {added ? "✓" : t.catalog.addToCart}
          </button>
        </>
      )}
    </div>
  );
}

export function Catalog() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="content">
      <h2 style={{ margin: "0 0 4px" }}>{t.catalog.title}</h2>
      <p className="subtitle">{t.catalog.subtitle}</p>
      {loading && <p className="muted">Loading…</p>}
      {error && <p className="muted">{error}</p>}
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
