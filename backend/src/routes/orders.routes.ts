import { Router } from "express";
import { z } from "zod";
import { requireTelegramAuth } from "../middleware/telegramAuth";
import {
  createOrder,
  getOrderById,
  listOrdersForCustomer,
  OrderValidationError,
} from "../services/orderService";

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z
    .array(z.object({ productVariantId: z.string().uuid(), quantity: z.number().int().positive() }))
    .min(1),
  notes: z.string().optional(),
});

ordersRouter.get("/", requireTelegramAuth, async (req, res, next) => {
  try {
    const orders = await listOrdersForCustomer(req.customer!.id);
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

ordersRouter.get("/:id", requireTelegramAuth, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    if (!order || order.customerId !== req.customer!.id) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

ordersRouter.post("/", requireTelegramAuth, async (req, res, next) => {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const order = await createOrder({ customerId: req.customer!.id, ...parsed });
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return res.status(400).json({ error: err.message });
    }
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: err.issues });
    }
    next(err);
  }
});
