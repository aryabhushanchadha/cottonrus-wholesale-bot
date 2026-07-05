// Must match backend VAT_RATE_BPS (src/config/env.ts). Used here only for a
// live estimate before the order is created; the server is authoritative.
export const VAT_RATE = 0.22;

// Public company details, must match backend COMPANY_* defaults (src/config/env.ts).
export const COMPANY = {
  inn: "7751389400",
  email: "Blue.crown@mail.ru",
  telegram: "@bluecrownllc",
};
