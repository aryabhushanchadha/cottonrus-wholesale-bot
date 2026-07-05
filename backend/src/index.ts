import "./utils/bigintJson";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { createBot } from "./bot/bot";

const app = express();

app.use(cors());

// Stripe webhook needs the raw body for signature verification, so it must
// be excluded from the global JSON body parser.
app.use((req, res, next) => {
  if (req.originalUrl === "/api/payments/stripe/webhook") return next();
  express.json()(req, res, next);
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", apiRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err?.statusCode ?? 500).json({ error: err?.message ?? "Internal server error" });
});

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});

const bot = createBot();
if (bot) {
  bot
    .start({
      onStart: () => console.log("Telegram bot started (long polling)"),
    })
    .catch((err) => {
      console.error(
        "Telegram bot failed to start (check TELEGRAM_BOT_TOKEN). The API server will keep running without it.",
        err instanceof Error ? err.message : err
      );
    });
}
