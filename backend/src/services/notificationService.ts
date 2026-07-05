import { Customer, OrderStatus } from "@prisma/client";
import { notifyTelegram } from "../bot/notifier";
import { t } from "../i18n";

export async function notifyOrderStatusChange(
  customer: Customer,
  orderNumber: string,
  status: OrderStatus
) {
  const message = t(customer.language, `orderNotification.${status}`, { orderNumber });
  await notifyTelegram(customer.telegramId, message);
}
