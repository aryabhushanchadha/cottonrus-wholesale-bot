import { PrismaClient, Color } from "@prisma/client";

const prisma = new PrismaClient();

const SIZES = [46, 48, 50, 52, 54, 56];
const COLORS: Color[] = ["BLACK", "WHITE"];

// Wholesale price per unit (USD), decreasing slightly is not modeled here —
// flat premium price per unit in minor units (cents).
const PRICE_MINOR = 1490; // $14.90 per unit, wholesale

async function main() {
  const product = await prisma.product.upsert({
    where: { slug: "premium-cotton-tee" },
    update: {},
    create: {
      slug: "premium-cotton-tee",
      nameEn: "Premium Cotton Wholesale T-Shirt",
      nameRu: "Премиальная хлопковая футболка (опт)",
      descriptionEn:
        "220 GSM heavyweight 100% combed cotton t-shirt. Reinforced double-stitched seams, " +
        "ribbed crew neck, pre-shrunk fabric. Available in Black and White, sizes 46-56. " +
        "Sold in wholesale lots only.",
      descriptionRu:
        "Плотная футболка 220 г/м² из 100% чесаного хлопка. Усиленные двойные швы, " +
        "трикотажный воротник, предусадочная ткань. Цвета: чёрный и белый, размеры 46-56. " +
        "Продажа только оптовыми партиями.",
      material: "100% Cotton",
      gsm: 220,
      fitEn: "Regular / Classic Fit",
      fitRu: "Классический крой",
      isActive: true,
    },
  });

  for (const size of SIZES) {
    for (const color of COLORS) {
      const sku = `PCT-${size}-${color.slice(0, 2)}`;
      await prisma.productVariant.upsert({
        where: { productId_size_color: { productId: product.id, size, color } },
        update: {},
        create: {
          productId: product.id,
          size,
          color,
          sku,
          priceMinor: PRICE_MINOR,
          currency: "USD",
          minOrderQty: 10,
          stockQty: 500,
        },
      });
    }
  }

  console.log(`Seeded product "${product.nameEn}" with ${SIZES.length * COLORS.length} variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
