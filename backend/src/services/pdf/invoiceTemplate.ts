import PDFDocument from "pdfkit";
import type { Order, OrderItem, ProductVariant, Product, Customer } from "@prisma/client";
import { env } from "../../config/env";

type FullOrder = Order & {
  customer: Customer;
  items: (OrderItem & { productVariant: ProductVariant & { product: Product } })[];
};

function money(minor: number, currency: string) {
  return `${(minor / 100).toFixed(2)} ${currency}`;
}

// Bilingual (EN / RU) premium wholesale invoice.
export function renderInvoicePdf(
  doc: PDFKit.PDFDocument,
  order: FullOrder,
  invoiceNumber: string
) {
  const c = env.company;

  doc.fontSize(20).text("INVOICE / СЧЁТ-ФАКТУРА", { align: "left" });
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#555").text(`${invoiceNumber}`);
  doc.fillColor("#000");
  doc.moveDown(1);

  doc.fontSize(11).text(`${c.name}`);
  if (c.address) doc.text(c.address);
  if (c.email) doc.text(`Email: ${c.email}`);
  if (c.inn) doc.text(`INN/ИНН: ${c.inn}`);
  doc.moveDown(1);

  doc.fontSize(12).text("Bill To / Плательщик:", { underline: true });
  doc.fontSize(11).text(order.customer.companyName || order.customer.fullName || "—");
  doc.text(`Customer ID / ID клиента: ${order.customer.customerCode}`);
  if (order.customer.email) doc.text(`Email: ${order.customer.email}`);
  if (order.customer.phone) doc.text(`Phone/Телефон: ${order.customer.phone}`);
  doc.moveDown(1);

  doc.fontSize(11).text(`Order / Заказ: ${order.orderNumber}`);
  doc.text(`Date / Дата: ${order.createdAt.toISOString().slice(0, 10)}`);
  doc.text(`Status / Статус: ${order.status}`);
  doc.moveDown(1);

  const tableTop = doc.y;
  const colX = { desc: 40, size: 250, color: 310, qty: 380, price: 430, total: 500 };

  doc.fontSize(10).fillColor("#555");
  doc.text("Item / Товар", colX.desc, tableTop);
  doc.text("Size/Размер", colX.size, tableTop);
  doc.text("Color/Цвет", colX.color, tableTop);
  doc.text("Qty/Кол-во", colX.qty, tableTop);
  doc.text("Price/Цена", colX.price, tableTop);
  doc.text("Total/Итог", colX.total, tableTop);
  doc.fillColor("#000");
  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.3);

  for (const item of order.items) {
    const y = doc.y;
    const v = item.productVariant;
    doc.fontSize(10);
    doc.text(v.product.nameEn, colX.desc, y, { width: 200 });
    doc.text(String(v.size), colX.size, y);
    doc.text(v.color === "BLACK" ? "Black/Чёрный" : "White/Белый", colX.color, y);
    doc.text(String(item.quantity), colX.qty, y);
    doc.text(money(item.unitPriceMinor, order.currency), colX.price, y);
    doc.text(money(item.lineTotalMinor, order.currency), colX.total, y);
    doc.moveDown(1);
  }

  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#ccc").stroke();
  doc.moveDown(0.5);

  doc.fontSize(11).text(`Subtotal / Промежуточный итог: ${money(order.subtotalMinor, order.currency)}`, {
    align: "right",
  });
  doc
    .fontSize(13)
    .text(`Total / Итого к оплате: ${money(order.totalMinor, order.currency)}`, { align: "right" });

  doc.moveDown(2);
  doc.fontSize(9).fillColor("#777");
  doc.text(
    "Product spec / Спецификация товара: 100% Cotton, 220 GSM premium heavyweight, reinforced seams. " +
      "Wholesale only. / 100% хлопок, плотность 220 г/м², премиальное качество, усиленные швы. Только оптовая продажа."
  );
}
