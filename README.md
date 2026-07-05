# Premium Cotton Wholesale — Telegram Mini App

A Telegram Mini App for wholesale ordering of premium 100% cotton t-shirts
(sizes 46–56, Black & White only). Bilingual (English/Russian), with customer
IDs, invoice generation, order-status tracking, and Stripe + YooKassa payment
integration.

## Architecture

- **backend/** — Node.js + TypeScript + Express + Prisma + PostgreSQL
  - Telegram bot (grammY): `/start`, `/orders`, `/id`, `/language`, opens the Mini App
  - REST API consumed by the Mini App
  - PDF invoice generation (pdfkit)
  - Stripe Checkout + YooKassa payment integration, with webhooks
  - Admin endpoint to advance order status (processing/shipped/delivered) or
    confirm manual payments (e.g. bank transfer)
- **frontend/** — React + TypeScript + Vite, rendered inside Telegram as a Mini App
  - Catalog with size/color/quantity picker, cart, checkout
  - Order history, order tracking timeline, invoice download
  - Full English/Russian UI toggle

## Data model

- `Customer` — one per Telegram user, with a generated **Customer ID** (e.g. `WC-482913`)
- `Product` / `ProductVariant` — the t-shirt line × 6 sizes (46–56) × 2 colors (Black/White)
- `Order` / `OrderItem` / `OrderStatusEvent` — orders and their status history
  (`NEW → PAID → PROCESSING → SHIPPED → DELIVERED`, or `CANCELLED`)
- `Payment` — one row per payment attempt (Stripe or YooKassa)
- `Invoice` — generated PDF, issued once an order is paid

## Setup

### 1. Database

Use the provided `docker-compose.yml`:

```bash
docker compose up -d
```

This starts Postgres on `localhost:5432` with user/password `tshirts`/`tshirts`
and database `tshirts_wholesale`.

> If you don't have Docker, any local or hosted Postgres instance works —
> just point `DATABASE_URL` at it.

### 2. Backend

```bash
cd backend
cp .env.example .env
# edit .env: DATABASE_URL, TELEGRAM_BOT_TOKEN, STRIPE_*, YOOKASSA_*, COMPANY_*
npm install
npm run prisma:migrate   # creates tables
npm run prisma:seed      # seeds the t-shirt catalog (46-56, Black/White)
npm run dev              # starts the API (port 8080) and the Telegram bot
```

**Getting a bot token:** talk to [@BotFather](https://t.me/BotFather) on
Telegram, run `/newbot`, and paste the token into `TELEGRAM_BOT_TOKEN`.

**Exposing the Mini App to Telegram:** Telegram requires an HTTPS URL for the
Mini App button. For local development, run the frontend (`npm run dev` in
`frontend/`) and tunnel it, e.g.:

```bash
ngrok http 5173
```

Then set `MINI_APP_URL` in `backend/.env` to the ngrok HTTPS URL, and register
that same URL as the bot's Mini App URL via BotFather (`/newapp` or
`/setmenubutton`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL should point at the backend
npm install
npm run dev
```

Opened directly in a regular browser (outside Telegram), the app falls back
to a fixed demo identity so you can exercise the full flow without a real
Telegram session — see `src/telegram.ts` / `x-debug-telegram-id` in
`backend/src/middleware/telegramAuth.ts`. This fallback is for local
development only: in production, `requireTelegramAuth` verifies Telegram's
signed `initData` using your bot token.

### 4. Payments

- **Stripe**: set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` (from the
  Stripe Dashboard / `stripe listen --forward-to localhost:8080/api/payments/stripe/webhook`).
- **YooKassa**: set `YOOKASSA_SHOP_ID` and `YOOKASSA_SECRET_KEY` from your
  YooKassa merchant account. Register `https://<your-domain>/api/payments/yookassa/webhook`
  as the notification URL in the YooKassa dashboard.

Without real keys, checkout still creates an order and shows a clear "not
configured" error on the payment buttons — the rest of the app (catalog,
cart, customer ID, order tracking) works fully.

### 5. Seller-side order management

The admin endpoint lets you (or an internal ops tool) advance orders or
confirm manual payments:

```bash
curl -X PATCH https://<api>/api/admin/orders/<orderId>/status \
  -H "x-admin-key: $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"status":"SHIPPED","note":"Handed to courier"}'
```

Set `ADMIN_API_KEY` in `backend/.env` before using this in anything but local
testing.

## Product spec

- Material: 100% combed cotton, 220 GSM (premium heavyweight)
- Construction: reinforced double-stitched seams, ribbed crew neck, pre-shrunk
- Sizes: 46, 48, 50, 52, 54, 56
- Colors: Black, White
- Sold in wholesale lots only (`minOrderQty` per SKU, configurable in the seed script)

## Notes on this build

- Local demo runs against a real Postgres instance started via the
  `embedded-postgres` dev dependency (`npm run demo:db` in `backend/`) so the
  app could be verified end-to-end without Docker/Homebrew in this
  environment. For your own deployment, use `docker-compose.yml` (or any
  managed Postgres) as described above — `embedded-postgres` is not a
  production dependency.
- Order pricing/currency is kept simple (no tax/shipping line items) since
  none were specified; extend `orderService.ts` if you need them.
