import type { Bot } from "grammy";

let botInstance: Bot | null = null;

export function registerBot(bot: Bot) {
  botInstance = bot;
}

export async function notifyTelegram(telegramId: bigint, text: string) {
  if (!botInstance) return;
  try {
    await botInstance.api.sendMessage(telegramId.toString(), text);
  } catch (err) {
    console.error("Failed to notify Telegram user", telegramId.toString(), err);
  }
}
