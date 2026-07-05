import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 8080),
  publicApiUrl: process.env.PUBLIC_API_URL ?? "http://localhost:8080",
  miniAppUrl: process.env.MINI_APP_URL ?? "http://localhost:5173",

  databaseUrl: required("DATABASE_URL"),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeSuccessUrl: process.env.STRIPE_SUCCESS_URL ?? "http://localhost:5173/checkout/success",
  stripeCancelUrl: process.env.STRIPE_CANCEL_URL ?? "http://localhost:5173/checkout/cancel",

  yookassaShopId: process.env.YOOKASSA_SHOP_ID ?? "",
  yookassaSecretKey: process.env.YOOKASSA_SECRET_KEY ?? "",
  yookassaReturnUrl: process.env.YOOKASSA_RETURN_URL ?? "http://localhost:5173/checkout/success",

  company: {
    name: process.env.COMPANY_NAME ?? "Premium Cotton Wholesale Ltd.",
    address: process.env.COMPANY_ADDRESS ?? "",
    email: process.env.COMPANY_EMAIL ?? "",
    inn: process.env.COMPANY_INN ?? "",
  },
};
