import { Router, raw } from "express";
import { requireTelegramAuth } from "../middleware/telegramAuth";
import { getOrderById } from "../services/orderService";
import { createStripeCheckout, handleStripeWebhook } from "../services/payment/stripe";
import { createYooKassaPayment, handleYooKassaWebhook } from "../services/payment/yookassa";

export const paymentsRouter = Router();

paymentsRouter.post("/stripe/checkout/:orderId", requireTelegramAuth, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order || order.customerId !== req.customer!.id) {
      return res.status(404).json({ error: "Order not found" });
    }
    const result = await createStripeCheckout(order.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

paymentsRouter.post("/yookassa/checkout/:orderId", requireTelegramAuth, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order || order.customerId !== req.customer!.id) {
      return res.status(404).json({ error: "Order not found" });
    }
    const result = await createYooKassaPayment(order.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// Stripe requires the raw body to verify the webhook signature.
paymentsRouter.post(
  "/stripe/webhook",
  raw({ type: "application/json" }),
  async (req, res, next) => {
    try {
      const signature = req.header("stripe-signature");
      if (!signature) return res.status(400).json({ error: "Missing stripe-signature header" });
      await handleStripeWebhook(req.body, signature);
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  }
);

paymentsRouter.post("/yookassa/webhook", async (req, res, next) => {
  try {
    const paymentId = req.body?.object?.id;
    if (!paymentId) return res.status(400).json({ error: "Missing payment id in notification" });
    await handleYooKassaWebhook(paymentId);
    res.json({ received: true });
  } catch (err) {
    next(err);
  }
});
