import type { TranslationShape } from "./en";

export const ru: TranslationShape = {
  welcome:
    "Добро пожаловать в Premium Cotton Wholesale!\n\nВаш ID клиента: {{customerCode}}\n\nОзнакомьтесь с каталогом премиальных футболок из 100% хлопка (размеры 46-56, чёрный и белый) и оформите оптовый заказ прямо в Telegram.",
  openCatalog: "Открыть магазин",
  myOrders: "Мои заказы",
  switchLanguage: "English",
  help:
    "Команды:\n/start - открыть магазин\n/orders - мои заказы\n/id - показать мой ID клиента\n/language - сменить язык",
  yourCustomerId: "Ваш ID клиента: {{customerCode}}",
  noOrders: "У вас пока нет заказов.",
  orderNotification: {
    NEW: "Заказ {{orderNumber}} создан. Ожидается оплата.",
    PAID: "Оплата заказа {{orderNumber}} подтверждена. Спасибо!",
    PROCESSING: "Заказ {{orderNumber}} передан в производство/на упаковку.",
    SHIPPED: "Заказ {{orderNumber}} отправлен.",
    DELIVERED: "Заказ {{orderNumber}} доставлен. Спасибо за покупку!",
    CANCELLED: "Заказ {{orderNumber}} отменён.",
  },
  languageSet: "Язык переключён на русский.",
};
