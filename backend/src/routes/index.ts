import { Router } from "express";
import { productsRouter } from "./products.routes";
import { customersRouter } from "./customers.routes";
import { ordersRouter } from "./orders.routes";
import { invoicesRouter } from "./invoices.routes";
import { paymentsRouter } from "./payments.routes";
import { adminRouter } from "./admin.routes";

export const apiRouter = Router();

apiRouter.use("/products", productsRouter);
apiRouter.use("/customers", customersRouter);
apiRouter.use("/orders", ordersRouter);
apiRouter.use("/invoices", invoicesRouter);
apiRouter.use("/payments", paymentsRouter);
apiRouter.use("/admin", adminRouter);
