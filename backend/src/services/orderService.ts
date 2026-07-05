import { OrderStatus } from "@prisma/client";
import { prisma } from "../db/prisma";
import { generateOrderNumber } from "../utils/ids";

export class OrderValidationError extends Error {}

export async function createOrder(params: {
  customerId: string;
  items: { productVariantId: string; quantity: number }[];
  notes?: string;
}) {
  if (params.items.length === 0) {
    throw new OrderValidationError("Order must contain at least one item");
  }

  const variantIds = params.items.map((i) => i.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const variantById = new Map(variants.map((v) => [v.id, v]));

  let subtotalMinor = 0;
  let currency: string | null = null;
  const lineItems: {
    productVariantId: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
  }[] = [];

  for (const item of params.items) {
    const variant = variantById.get(item.productVariantId);
    if (!variant) {
      throw new OrderValidationError(`Unknown product variant: ${item.productVariantId}`);
    }
    if (item.quantity < variant.minOrderQty) {
      throw new OrderValidationError(
        `Minimum wholesale quantity for SKU ${variant.sku} is ${variant.minOrderQty}`
      );
    }
    if (item.quantity > variant.stockQty) {
      throw new OrderValidationError(`Insufficient stock for SKU ${variant.sku}`);
    }
    if (currency === null) currency = variant.currency;
    if (variant.currency !== currency) {
      throw new OrderValidationError("All items in an order must share the same currency");
    }

    const lineTotal = variant.priceMinor * item.quantity;
    subtotalMinor += lineTotal;
    lineItems.push({
      productVariantId: variant.id,
      quantity: item.quantity,
      unitPriceMinor: variant.priceMinor,
      lineTotalMinor: lineTotal,
    });
  }

  const totalMinor = subtotalMinor; // no taxes/shipping modeled in this MVP

  const order = await prisma.$transaction(async (tx) => {
    const count = await tx.order.count();
    const orderNumber = generateOrderNumber(count + 1);

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerId: params.customerId,
        currency: currency!,
        subtotalMinor,
        totalMinor,
        notes: params.notes,
        items: { create: lineItems },
        statusHistory: { create: { status: OrderStatus.NEW } },
      },
      include: { items: { include: { productVariant: { include: { product: true } } } } },
    });

    for (const item of lineItems) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stockQty: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return order;
}

export async function listOrdersForCustomer(customerId: string) {
  return prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    include: {
      items: { include: { productVariant: { include: { product: true } } } },
      invoice: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: { include: { productVariant: { include: { product: true } } } },
      invoice: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, note?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.update({ where: { id: orderId }, data: { status } });
    await tx.orderStatusEvent.create({ data: { orderId, status, note } });
    return order;
  });
}
