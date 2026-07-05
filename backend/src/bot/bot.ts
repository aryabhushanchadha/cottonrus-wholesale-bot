import { Bot, InlineKeyboard } from "grammy";
import { env } from "../config/env";
import { t, detectLanguage } from "../i18n";
import { findOrCreateCustomerByTelegramId, setCustomerLanguage } from "../services/customerService";
import { listOrdersForCustomer } from "../services/orderService";
import { registerBot } from "./notifier";

export function createBot() {
  if (!env.telegramBotToken) {
    console.warn("TELEGRAM_BOT_TOKEN is not set - bot will not start.");
    return null;
  }

  const bot = new Bot(env.telegramBotToken);

  bot.command("start", async (ctx) => {
    const from = ctx.from!;
    const customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(from.id),
      telegramUsername: from.username,
      fullName: from.first_name,
      language: detectLanguage(from.language_code),
    });

    const keyboard = new InlineKeyboard()
      .webApp(t(customer.language, "openCatalog"), env.miniAppUrl)
      .row()
      .text(t(customer.language, "myOrders"), "my_orders")
      .row()
      .text(t(customer.language, "switchLanguage"), "toggle_language");

    await ctx.reply(t(customer.language, "welcome", { customerCode: customer.customerCode }), {
      reply_markup: keyboard,
    });
  });

  bot.command("id", async (ctx) => {
    const from = ctx.from!;
    const customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(from.id),
      telegramUsername: from.username,
      fullName: from.first_name,
      language: detectLanguage(from.language_code),
    });
    await ctx.reply(t(customer.language, "yourCustomerId", { customerCode: customer.customerCode }));
  });

  bot.command("help", async (ctx) => {
    const from = ctx.from!;
    const customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(from.id),
      telegramUsername: from.username,
      fullName: from.first_name,
      language: detectLanguage(from.language_code),
    });
    await ctx.reply(t(customer.language, "help"));
  });

  bot.command("orders", async (ctx) => {
    await sendOrdersList(ctx);
  });

  bot.callbackQuery("my_orders", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sendOrdersList(ctx);
  });

  bot.callbackQuery("toggle_language", async (ctx) => {
    const from = ctx.from!;
    const customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(from.id),
      telegramUsername: from.username,
      fullName: from.first_name,
      language: detectLanguage(from.language_code),
    });
    const nextLanguage = customer.language === "EN" ? "RU" : "EN";
    const updated = await setCustomerLanguage(BigInt(from.id), nextLanguage);
    await ctx.answerCallbackQuery();
    await ctx.reply(t(updated.language, "languageSet"));
  });

  async function sendOrdersList(ctx: any) {
    const from = ctx.from!;
    const customer = await findOrCreateCustomerByTelegramId({
      telegramId: BigInt(from.id),
      telegramUsername: from.username,
      fullName: from.first_name,
      language: detectLanguage(from.language_code),
    });
    const orders = await listOrdersForCustomer(customer.id);
    if (orders.length === 0) {
      await ctx.reply(t(customer.language, "noOrders"));
      return;
    }
    const lines = orders
      .slice(0, 10)
      .map((o) => `${o.orderNumber} — ${o.status} — ${(o.totalMinor / 100).toFixed(2)} ${o.currency}`);
    await ctx.reply(lines.join("\n"));
  }

  registerBot(bot);
  return bot;
}
