import { Router } from "express";
import { prisma } from "../db/prisma";

export const productsRouter = Router();

productsRouter.get("/", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { variants: { orderBy: [{ size: "asc" }, { color: "asc" }] } },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
});
