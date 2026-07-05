export const en = {
  welcome:
    "Welcome to Premium Cotton Wholesale!\n\nYour Customer ID: {{customerCode}}\n\nBrowse our catalog of 100% cotton premium t-shirts (sizes 46-56, Black & White) and place a wholesale order right inside Telegram.",
  openCatalog: "Open Catalog",
  myOrders: "My Orders",
  switchLanguage: "Русский",
  help:
    "Commands:\n/start - open the shop\n/orders - view your orders\n/id - show your Customer ID\n/language - switch language",
  yourCustomerId: "Your Customer ID is: {{customerCode}}",
  noOrders: "You don't have any orders yet.",
  orderNotification: {
    NEW: "Order {{orderNumber}} received. Awaiting payment.",
    PAID: "Payment confirmed for order {{orderNumber}}. Thank you!",
    PROCESSING: "Order {{orderNumber}} is now in production/packing.",
    SHIPPED: "Order {{orderNumber}} has shipped and is on its way.",
    DELIVERED: "Order {{orderNumber}} was delivered. Thank you for your business!",
    CANCELLED: "Order {{orderNumber}} was cancelled.",
  },
  languageSet: "Language set to English.",
};

export type TranslationShape = typeof en;
