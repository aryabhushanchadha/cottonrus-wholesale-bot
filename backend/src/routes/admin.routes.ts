import { Router } from "express";
import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { getOrderById, updateOrderStatus } from "../services/orderService";
import { notifyOrderStatusChange } from "../services/notificationService";
import { generateInvoiceForOrder } from "../services/invoiceService";

export const adminRouter = Router();

// Minimal shared-secret guard for the seller-side fulfillment endpoints
// (advance order status: PROCESSING -> SHIPPED -> DELIVERED, or CANCELLED).
adminRouter.use((req, res, next) => {
  const key = req.header("x-admin-key");
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().optional(),
});

adminRouter.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status, note } = statusSchema.parse(req.body);
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    await updateOrderStatus(order.id, status, note);

    // Manual payment confirmation (e.g. bank transfer) follows the same path
    // as the Stripe/YooKassa webhooks: mark paid -> issue the invoice.
    if (status === OrderStatus.PAID) {
      await generateInvoiceForOrder(order.id);
    }

    await notifyOrderStatusChange(order.customer, order.orderNumber, status);

    res.json(await getOrderById(order.id));
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: err.issues });
    next(err);
  }
});
