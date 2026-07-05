import "./utils/bigintJson";
import path from "path";
import fs from "fs";
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

// In production the frontend is built alongside the backend and served from
// the same origin/service, so the Mini App and its API share one URL and
// don't need CORS or cross-service configuration. Locally the frontend runs
// on its own Vite dev server instead, so this directory won't exist.
const frontendDist = path.resolve(__dirname, "../../frontend/dist");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get(/^\/(?!api|health).*/, (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

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
