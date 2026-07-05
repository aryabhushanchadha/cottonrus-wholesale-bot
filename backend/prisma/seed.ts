import { PrismaClient, Color } from "@prisma/client";

const prisma = new PrismaClient();

const SIZES = [46, 48, 50, 52, 54, 56];
const COLORS: Color[] = ["BLACK", "WHITE"];

// Prices are wholesale, per unit, EXCLUDING VAT, in kopecks (RUB minor units).
const PRODUCTS = [
  {
    slug: "cotton-tee-180gsm",
    nameEn: "180 GSM Cotton T-Shirt",
    nameRu: "Футболка 180 GSM",
    descriptionEn:
      "100% combed cotton, 180 GSM mid-weight fabric that stays breathable and holds its shape wash " +
      "after wash. Reinforced seams and a consistent, true-to-size cut across the whole run mean fewer " +
      "size-related returns when reselling on marketplaces. Densely woven — no see-through, even in " +
      "white. Pre-shrunk. Wholesale lots only.",
    descriptionRu:
      "100% чесаный хлопок, плотность 180 г/м² — дышащая ткань средней плотности, сохраняет форму после " +
      "стирок. Усиленные швы и стабильная, точная посадка по размерной сетке во всей партии снижают " +
      "процент возвратов по размеру при продаже на маркетплейсах. Плотное плетение — ткань не " +
      "просвечивает даже в белом цвете. Предусадочная обработка. Продажа только оптовыми партиями.",
    gsm: 180,
    fitEn: "Regular Fit",
    fitRu: "Классический крой",
    priceMinor: 18000, // 180 RUB excl. VAT
    images: [] as string[],
  },
  {
    slug: "cotton-tee-200gsm-oversize",
    nameEn: "200 GSM Oversize Cotton T-Shirt",
    nameRu: "Футболка Oversize 200 GSM",
    descriptionEn:
      "Heavyweight 100% cotton, 200 GSM, cut in a relaxed oversized silhouette. Thick, durable fabric " +
      "that resists pilling and stretching, giving customers the premium hand-feel that reduces " +
      "marketplace returns. Reinforced double-stitched seams and a ribbed collar keep their shape wear " +
      "after wear. Wholesale lots only.",
    descriptionRu:
      "Плотный 100% хлопок, 200 г/м², свободный оверсайз-крой. Толстая, износостойкая ткань не " +
      "скатывается и не растягивается — премиальные тактильные качества снижают количество возвратов " +
      "на маркетплейсах. Усиленные двойные швы и трикотажный воротник долго держат форму. Продажа " +
      "только оптовыми партиями.",
    gsm: 200,
    fitEn: "Oversized Fit",
    fitRu: "Оверсайз крой",
    priceMinor: 25000, // 250 RUB excl. VAT
    images: [] as string[],
  },
];

async function main() {
  for (const spec of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: spec.slug },
      update: {
        nameEn: spec.nameEn,
        nameRu: spec.nameRu,
        descriptionEn: spec.descriptionEn,
        descriptionRu: spec.descriptionRu,
        gsm: spec.gsm,
        fitEn: spec.fitEn,
        fitRu: spec.fitRu,
        images: spec.images,
      },
      create: {
        slug: spec.slug,
        nameEn: spec.nameEn,
        nameRu: spec.nameRu,
        descriptionEn: spec.descriptionEn,
        descriptionRu: spec.descriptionRu,
        material: "100% Cotton",
        gsm: spec.gsm,
        fitEn: spec.fitEn,
        fitRu: spec.fitRu,
        images: spec.images,
        isActive: true,
      },
    });

    for (const size of SIZES) {
      for (const color of COLORS) {
        const sku = `${spec.gsm}-${size}-${color.slice(0, 2)}`;
        await prisma.productVariant.upsert({
          where: { productId_size_color: { productId: product.id, size, color } },
          update: { priceMinor: spec.priceMinor, currency: "RUB" },
          create: {
            productId: product.id,
            size,
            color,
            sku,
            priceMinor: spec.priceMinor,
            currency: "RUB",
            minOrderQty: 10,
            stockQty: 500,
          },
        });
      }
    }

    console.log(`Seeded "${product.nameEn}" with ${SIZES.length * COLORS.length} variants.`);
  }

  // Retire any older product lines (e.g. a previous catalog revision) rather
  // than deleting them, since past orders may still reference their variants.
  const currentSlugs = PRODUCTS.map((p) => p.slug);
  const retired = await prisma.product.updateMany({
    where: { slug: { notIn: currentSlugs } },
    data: { isActive: false },
  });
  if (retired.count > 0) {
    console.log(`Retired ${retired.count} older product line(s).`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
