import { randomInt } from "crypto";

// Customer-facing ID, e.g. WC-482913
export function generateCustomerCode(): string {
  return `WC-${randomInt(100000, 999999)}`;
}

// Order number scoped by year, e.g. ORD-2026-000123
export function generateOrderNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `ORD-${year}-${String(sequence).padStart(6, "0")}`;
}

export function generateInvoiceNumber(sequence: number): string {
  const year = new Date().getFullYear();
  return `INV-${year}-${String(sequence).padStart(6, "0")}`;
}
