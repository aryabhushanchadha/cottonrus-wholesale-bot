import { useEffect, useState } from "react";
import { api, Customer } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";

export function Profile() {
  const { t } = useLanguage();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    inn: "",
    address: "",
    phone: "",
    email: "",
  });
  const [saved, setSaved] = useState(false);

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

  const handleSave = async () => {
    const updated = await api.updateMe(form);
    setCustomer(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="content">
      <h2>{t.profile.title}</h2>
      {customer && (
        <div className="muted" style={{ marginBottom: 16 }}>
          {t.checkout.customerId}: <b>{customer.customerCode}</b>
        </div>
      )}
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
      <button className="btn" onClick={handleSave}>
        {saved ? t.profile.saved : t.profile.save}
      </button>
    </div>
  );
}
