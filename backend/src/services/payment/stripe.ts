import Stripe from "stripe";
import { env } from "../../config/env";
import { prisma } from "../../db/prisma";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { getOrderById, updateOrderStatus } from "../orderService";
import { generateInvoiceForOrder } from "../invoiceService";
import { notifyOrderStatusChange } from "../notificationService";
import { OrderStatus } from "@prisma/client";

export const stripeClient = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, { apiVersion: "2024-06-20" })
  : null;

export async function createStripeCheckout(orderId: string) {
  if (!stripeClient) {
    throw new Error("Stripe is not configured (STRIPE_SECRET_KEY missing)");
  }
  const order = await getOrderById(orderId);
  if (!order) throw new Error("Order not found");

  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: order.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: item.unitPriceMinor,
        product_data: {
          name: `${item.productVariant.product.nameEn} - Size ${item.productVariant.size} - ${item.productVariant.color}`,
        },
      },
    })),
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    success_url: `${env.stripeSuccessUrl}?order=${order.orderNumber}`,
    cancel_url: `${env.stripeCancelUrl}?order=${order.orderNumber}`,
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProvider.STRIPE,
      providerRef: session.id,
      status: PaymentStatus.PENDING,
      amountMinor: order.totalMinor,
      currency: order.currency,
      confirmationUrl: session.url ?? undefined,
    },
  });

  return { checkoutUrl: session.url, sessionId: session.id };
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  if (!stripeClient) throw new Error("Stripe is not configured");

  const event = stripeClient.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (!orderId) return;

    await prisma.payment.updateMany({
      where: { providerRef: session.id },
      data: { status: PaymentStatus.SUCCEEDED },
    });

    const order = await updateOrderStatus(orderId, OrderStatus.PAID);
    await generateInvoiceForOrder(orderId);

    const fullOrder = await getOrderById(orderId);
    if (fullOrder) {
      await notifyOrderStatusChange(fullOrder.customer, fullOrder.orderNumber, OrderStatus.PAID);
    }
  }

  return event;
}
