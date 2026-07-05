import type { Order, OrderItem, ProductVariant, Product, Customer } from "@prisma/client";
import { env } from "../../config/env";

type FullOrder = Order & {
  customer: Customer;
  items: (OrderItem & { productVariant: ProductVariant & { product: Product } })[];
};

function money(minor: number) {
  return (minor / 100).toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const COLOR_LABEL: Record<string, string> = { BLACK: "Чёрный", WHITE: "Белый" };

// Structured Russian "Счёт на оплату" (invoice for payment), including full
// seller and buyer requisites (both parties' INN are legally expected on a
// wholesale B2B invoice) and a VAT breakdown.
export function renderInvoicePdf(doc: PDFKit.PDFDocument, order: FullOrder, invoiceNumber: string, sequence: number) {
  const c = env.company;
  const buyer = order.customer;

  doc.fontSize(16).text(`Счёт на оплату № ${sequence} от ${formatDate(order.createdAt)}`, { align: "left" });
  doc.fontSize(9).fillColor("#777").text(`${invoiceNumber} · Invoice`);
  doc.fillColor("#000");
  doc.moveDown(1);

  // --- Seller (Поставщик) ---
  doc.fontSize(11).font("Bold").text("Поставщик:");
  doc.font("Body").fontSize(10);
  doc.text(`${c.name}, ИНН ${c.inn}`);
  doc.text(`Р/с ${c.bankAccount} в ${c.bankName}`);
  doc.text(`БИК ${c.bik}, к/с ${c.correspondentAccount}`);
  doc.text(`Email: ${c.email}   Telegram: ${c.telegram}`);
  doc.moveDown(0.8);

  // --- Buyer (Покупатель) ---
  doc.font("Bold").fontSize(11).text("Покупатель:");
  doc.font("Body").fontSize(10);
  doc.text(buyer.companyName || buyer.fullName || "—");
  doc.text(`ИНН: ${buyer.inn ?? "—"}`);
  doc.text(`Адрес: ${buyer.address ?? "—"}`);
  if (buyer.phone) doc.text(`Телефон: ${buyer.phone}`);
  if (buyer.email) doc.text(`Email: ${buyer.email}`);
  doc.text(`ID клиента: ${buyer.customerCode}`);
  doc.moveDown(1);

  // --- Line items table ---
  const colX = { num: 40, desc: 65, qty: 330, unit: 370, price: 415, total: 490 };
  const tableTop = doc.y;

  doc.font("Bold").fontSize(9).fillColor("#555");
  doc.text("№", colX.num, tableTop);
  doc.text("Наименование товара", colX.desc, tableTop);
  doc.text("Кол-во", colX.qty, tableTop);
  doc.text("Ед.", colX.unit, tableTop);
  doc.text("Цена", colX.price, tableTop);
  doc.text("Сумма", colX.total, tableTop);
  doc.fillColor("#000");
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.3);

  order.items.forEach((item, idx) => {
    const y = doc.y;
    const v = item.productVariant;
    const name = `${v.product.nameRu}, ${COLOR_LABEL[v.color]}, размер ${v.size}`;
    doc.font("Body").fontSize(9);
    doc.text(String(idx + 1), colX.num, y);
    doc.text(name, colX.desc, y, { width: 260 });
    doc.text(String(item.quantity), colX.qty, y);
    doc.text("шт", colX.unit, y);
    doc.text(money(item.unitPriceMinor), colX.price, y);
    doc.text(money(item.lineTotalMinor), colX.total, y);
    doc.moveDown(1);
  });

  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.6);

  // --- Totals with VAT breakdown ---
  const vatPercent = (order.vatRateBps / 100).toFixed(0);
  doc.font("Body").fontSize(10);
  doc.text(`Итого без НДС: ${money(order.subtotalMinor)} ${order.currency}`, { align: "right" });
  doc.text(`В т.ч. НДС (${vatPercent}%): ${money(order.vatMinor)} ${order.currency}`, { align: "right" });
  doc.font("Bold").fontSize(13);
  doc.text(`Итого к оплате: ${money(order.totalMinor)} ${order.currency}`, { align: "right" });
  doc.font("Body");

  doc.moveDown(2);
  doc.fontSize(8).fillColor("#777");
  doc.text(
    `Всего наименований ${order.items.length}, на сумму ${money(order.totalMinor)} ${order.currency}. ` +
      "Товар: 100% хлопок, премиальное качество. Оптовая продажа."
  );
}
