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

  vatRateBps: Number(process.env.VAT_RATE_BPS ?? 2000), // 2000 = 20% (standard Russian VAT)

  company: {
    name: process.env.COMPANY_NAME ?? 'ООО "БЛЮ КРАУН"',
    inn: process.env.COMPANY_INN ?? "7751389400",
    email: process.env.COMPANY_EMAIL ?? "Blue.crown@mail.ru",
    telegram: process.env.COMPANY_TELEGRAM ?? "@bluecrownllc",
    bankAccount: process.env.COMPANY_BANK_ACCOUNT ?? "40702810581240000410",
    bik: process.env.COMPANY_BIK ?? "044525593",
    bankName: process.env.COMPANY_BANK_NAME ?? 'АО "АЛЬФА-БАНК"',
    correspondentAccount: process.env.COMPANY_CORR_ACCOUNT ?? "30101810200000000593",
  },
};
