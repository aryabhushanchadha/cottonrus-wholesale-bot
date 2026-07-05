import "dotenv/config";

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Render injects the service's own public URL at runtime, so a single
// combined deployment (backend serving the built Mini App) can self-configure
// without needing to know its own hostname ahead of time.
const platformUrl = process.env.RENDER_EXTERNAL_URL;

export const env = {
  port: Number(process.env.PORT ?? 8080),
  publicApiUrl: process.env.PUBLIC_API_URL ?? platformUrl ?? "http://localhost:8080",
  miniAppUrl: process.env.MINI_APP_URL ?? platformUrl ?? "http://localhost:5183",

  databaseUrl: required("DATABASE_URL"),

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeSuccessUrl:
    process.env.STRIPE_SUCCESS_URL ??
    (platformUrl ? `${platformUrl}/checkout/success` : "http://localhost:5183/checkout/success"),
  stripeCancelUrl:
    process.env.STRIPE_CANCEL_URL ??
    (platformUrl ? `${platformUrl}/checkout/cancel` : "http://localhost:5183/checkout/cancel"),

  yookassaShopId: process.env.YOOKASSA_SHOP_ID ?? "",
  yookassaSecretKey: process.env.YOOKASSA_SECRET_KEY ?? "",
  yookassaReturnUrl:
    process.env.YOOKASSA_RETURN_URL ??
    (platformUrl ? `${platformUrl}/checkout/success` : "http://localhost:5183/checkout/success"),

  company: {
    name: process.env.COMPANY_NAME ?? "Premium Cotton Wholesale Ltd.",
    address: process.env.COMPANY_ADDRESS ?? "",
    email: process.env.COMPANY_EMAIL ?? "",
    inn: process.env.COMPANY_INN ?? "",
  },
};
