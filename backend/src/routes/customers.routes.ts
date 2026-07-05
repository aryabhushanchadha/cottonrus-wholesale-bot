import { Router } from "express";
import { requireTelegramAuth } from "../middleware/telegramAuth";
import { updateCustomerProfile } from "../services/customerService";

export const customersRouter = Router();

customersRouter.get("/me", requireTelegramAuth, async (req, res, next) => {
  try {
    res.json(req.customer);
  } catch (err) {
    next(err);
  }
});

customersRouter.patch("/me", requireTelegramAuth, async (req, res, next) => {
  try {
    const { companyName, phone, email, fullName } = req.body ?? {};
    const updated = await updateCustomerProfile(req.customer!.id, {
      companyName,
      phone,
      email,
      fullName,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
