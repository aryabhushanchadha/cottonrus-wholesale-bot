import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { prisma } from "../db/prisma";
import { generateInvoiceNumber } from "../utils/ids";
import { renderInvoicePdf } from "./pdf/invoiceTemplate";

const INVOICES_DIR = path.resolve(__dirname, "../../invoices");

if (!fs.existsSync(INVOICES_DIR)) {
  fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

export async function generateInvoiceForOrder(orderId: string) {
  const existing = await prisma.invoice.findUnique({ where: { orderId } });
  if (existing) return existing;

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: {
      customer: true,
      items: { include: { productVariant: { include: { product: true } } } },
    },
  });

  const count = await prisma.invoice.count();
  const sequence = count + 1;
  const invoiceNumber = generateInvoiceNumber(sequence);
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(INVOICES_DIR, fileName);

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  // pdfkit's built-in fonts only cover Latin (WinAnsi) text; the invoice is
  // primarily Russian, so a Unicode TTF with Cyrillic glyphs is required.
  // Registered under new names rather than "Helvetica"/"Helvetica-Bold":
  // pdfkit instantiates its default standard Helvetica font in the
  // PDFDocument constructor (before this code runs) and caches it by name,
  // so re-registering those exact names doesn't override the cached instance.
  doc.registerFont("Body", require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans.ttf"));
  doc.registerFont("Bold", require.resolve("dejavu-fonts-ttf/ttf/DejaVuSans-Bold.ttf"));
  doc.font("Body");
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  renderInvoicePdf(doc, order, invoiceNumber, sequence);
  doc.end();

  await new Promise<void>((resolve, reject) => {
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  return prisma.invoice.create({
    data: {
      orderId,
      invoiceNumber,
      pdfPath: fileName,
    },
  });
}

export function resolveInvoicePath(fileName: string) {
  return path.join(INVOICES_DIR, fileName);
}
