import { getAuthHeaders } from "../telegram";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ProductVariant {
  id: string;
  size: number;
  color: "BLACK" | "WHITE";
  sku: string;
  priceMinor: number;
  currency: string;
  minOrderQty: number;
  stockQty: number;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameRu: string;
  descriptionEn: string;
  descriptionRu: string;
  material: string;
  gsm: number;
  fitEn: string;
  fitRu: string;
  variants: ProductVariant[];
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  language: "EN" | "RU";
}

export type OrderStatus = "NEW" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
  productVariant: ProductVariant & { product: Product };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  currency: string;
  subtotalMinor: number;
  totalMinor: number;
  createdAt: string;
  items: OrderItem[];
  invoice?: { id: string; invoiceNumber: string } | null;
  statusHistory: { status: OrderStatus; createdAt: string; note?: string }[];
}

export const api = {
  getProducts: () => request<Product[]>("/products"),
  getMe: () => request<Customer>("/customers/me"),
  updateMe: (data: Partial<Pick<Customer, "fullName" | "companyName" | "phone" | "email">>) =>
    request<Customer>("/customers/me", { method: "PATCH", body: JSON.stringify(data) }),
  getOrders: () => request<Order[]>("/orders"),
  getOrder: (id: string) => request<Order>(`/orders/${id}`),
  createOrder: (items: { productVariantId: string; quantity: number }[], notes?: string) =>
    request<Order>("/orders", { method: "POST", body: JSON.stringify({ items, notes }) }),
  downloadInvoice: async (orderId: string, fileName: string) => {
    const res = await fetch(`${API_URL}/invoices/order/${orderId}`, {
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to download invoice");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  },
  payWithStripe: (orderId: string) =>
    request<{ checkoutUrl: string }>(`/payments/stripe/checkout/${orderId}`, { method: "POST" }),
  payWithYooKassa: (orderId: string) =>
    request<{ checkoutUrl: string }>(`/payments/yookassa/checkout/${orderId}`, { method: "POST" }),
};

export { getAuthHeaders };
