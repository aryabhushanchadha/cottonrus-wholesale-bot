import { randomUUID } from "crypto";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { PaymentProvider, PaymentStatus, OrderStatus } from "@prisma/client";
import { getOrderById, updateOrderStatus } from "../orderService";
import { generateInvoiceForOrder } from "../invoiceService";
import { notifyOrderStatusChange } from "../notificationService";

const YOOKASSA_API = "https://api.yookassa.ru/v3";

function authHeader() {
  const token = Buffer.from(`${env.yookassaShopId}:${env.yookassaSecretKey}`).toString("base64");
  return `Basic ${token}`;
}

export async function createYooKassaPayment(orderId: string) {
  if (!env.yookassaShopId || !env.yookassaSecretKey) {
    throw new Error("YooKassa is not configured (YOOKASSA_SHOP_ID/SECRET_KEY missing)");
  }
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const response = await fetch(`${YOOKASSA_API}/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      "Idempotence-Key": randomUUID(),
    },
    body: JSON.stringify({
      amount: {
        value: (order.totalMinor / 100).toFixed(2),
        currency: order.currency,
      },
      capture: true,
      confirmation: {
        type: "redirect",
        return_url: `${env.yookassaReturnUrl}?order=${order.orderNumber}`,
      },
      description: `Wholesale order ${order.orderNumber}`,
      metadata: { orderId: order.id, orderNumber: order.orderNumber },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YooKassa payment creation failed: ${response.status} ${text}`);
  }

  const payment = (await response.json()) as {
    id: string;
    status: string;
    confirmation?: { confirmation_url?: string };
  };

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProvider.YOOKASSA,
      providerRef: payment.id,
      status: PaymentStatus.PENDING,
      amountMinor: order.totalMinor,
      currency: order.currency,
      confirmationUrl: payment.confirmation?.confirmation_url,
    },
  });

  return { checkoutUrl: payment.confirmation?.confirmation_url, paymentId: payment.id };
}

// YooKassa webhooks are not signed. Per YooKassa's recommendation, re-fetch the
// payment status from the API using our secret key before trusting the notification body.
export async function handleYooKassaWebhook(paymentId: string) {
  const response = await fetch(`${YOOKASSA_API}/payments/${paymentId}`, {
    headers: { Authorization: authHeader() },
  });
  if (!response.ok) {
    throw new Error(`Failed to verify YooKassa payment ${paymentId}`);
  }
  const payment = (await response.json()) as {
    id: string;
    status: string;
    metadata?: { orderId?: string };
  };

  const orderId = payment.metadata?.orderId;
  if (!orderId) return;

  if (payment.status === "succeeded") {
    await prisma.payment.updateMany({
      where: { providerRef: payment.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });
    await updateOrderStatus(orderId, OrderStatus.PAID);
    await generateInvoiceForOrder(orderId);

    const fullOrder = await getOrderById(orderId);
    if (fullOrder) {
      await notifyOrderStatusChange(fullOrder.customer, fullOrder.orderNumber, OrderStatus.PAID);
    }
  } else if (payment.status === "canceled") {
    await prisma.payment.updateMany({
      where: { providerRef: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
