import { Language } from "@prisma/client";
import { prisma } from "../db/prisma";
import { generateCustomerCode } from "../utils/ids";

export async function findOrCreateCustomerByTelegramId(params: {
  telegramId: bigint;
  telegramUsername?: string;
  fullName?: string;
  language: Language;
}) {
  const existing = await prisma.customer.findUnique({
    where: { telegramId: params.telegramId },
  });
  if (existing) return existing;

  // Retry on the rare customerCode collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.customer.create({
        data: {
          telegramId: params.telegramId,
          telegramUsername: params.telegramUsername,
          fullName: params.fullName,
          language: params.language,
          customerCode: generateCustomerCode(),
        },
      });
    } catch (err: any) {
      if (err?.code === "P2002" && attempt < 4) continue;
      throw err;
    }
  }
  throw new Error("Failed to allocate a unique customer code");
}

export async function setCustomerLanguage(telegramId: bigint, language: Language) {
  return prisma.customer.update({
    where: { telegramId },
    data: { language },
  });
}

export async function updateCustomerProfile(
  customerId: string,
  data: { fullName?: string; companyName?: string; phone?: string; email?: string }
) {
  return prisma.customer.update({ where: { id: customerId }, data });
}
