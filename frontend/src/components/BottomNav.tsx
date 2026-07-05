import { NavLink } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageContext";
import { useCart } from "../context/CartContext";

export function BottomNav() {
  const { t } = useLanguage();
  const { lines } = useCart();
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
        {t.nav.home}
      </NavLink>
      <NavLink to="/catalog" className={({ isActive }) => (isActive ? "active" : "")}>
        {t.nav.catalog}
      </NavLink>
      <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
        {t.nav.cart}
        {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
      </NavLink>
      <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
        {t.nav.orders}
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
        {t.nav.profile}
      </NavLink>
    </nav>
  );
}
