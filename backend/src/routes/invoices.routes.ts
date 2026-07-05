import { Router } from "express";
import { requireTelegramAuth } from "../middleware/telegramAuth";
import { getOrderById } from "../services/orderService";
import { generateInvoiceForOrder, resolveInvoicePath } from "../services/invoiceService";

export const invoicesRouter = Router();

// Generate (if needed) and download the invoice PDF for a given order.
invoicesRouter.get("/order/:orderId", requireTelegramAuth, async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    if (!order || order.customerId !== req.customer!.id) {
      return res.status(404).json({ error: "Order not found" });
    }

    const invoice = order.invoice ?? (await generateInvoiceForOrder(order.id));
    const filePath = resolveInvoicePath(invoice.pdfPath);
    res.download(filePath, `${invoice.invoiceNumber}.pdf`);
  } catch (err) {
    next(err);
  }
});
