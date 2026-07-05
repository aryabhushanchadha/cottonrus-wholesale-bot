import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { findOrCreateCustomerByTelegramId } from "../services/customerService";
import { detectLanguage } from "../i18n";

export interface TelegramUser {
  id: number;
  first_name?: string;
  username?: string;
  language_code?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      customer?: Awaited<ReturnType<typeof findOrCreateCustomerByTelegramId>>;
    }
  }
}

function verifyInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) return null;

  const userJson = params.get("user");
  if (!userJson) return null;
  return JSON.parse(userJson) as TelegramUser;
}

// Authenticates requests from the Mini App using Telegram's WebApp initData.
// For local development without a real bot token, a debug header is accepted
// (see README) so the app can be exercised end-to-end.
export async function requireTelegramAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const initData = req.header("x-telegram-init-data");
    let telegramUser: TelegramUser | null = null;

    if (initData && env.telegramBotToken) {
      telegramUser = verifyInitData(initData, env.telegramBotToken);
      if (!telegramUser) {
        return res.status(401).json({ error: "Invalid Telegram init data" });
      }
    } else if (process.env.NODE_ENV !== "production" && req.header("x-debug-telegram-id")) {
      telegramUser = {
        id: Number(req.header("x-debug-telegram-id")),
        first_name: req.header("x-debug-name") ?? "Demo User",
        language_code: req.header("x-debug-lang") ?? "en",
      };
    }

    if (!telegramUser) {
      return res.status(401).json({ error: "Missing Telegram authentication" });
    }

    req.telegramUser = telegramUser;
    req.customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(telegramUser.id),
      telegramUsername: telegramUser.username,
      fullName: telegramUser.first_name,
      language: detectLanguage(telegramUser.language_code),
    });

    next();
  } catch (err) {
    next(err);
  }
}
