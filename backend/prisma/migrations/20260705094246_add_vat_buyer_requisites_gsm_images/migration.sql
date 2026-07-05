-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "address" TEXT,
ADD COLUMN     "inn" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "vatMinor" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vatRateBps" INTEGER NOT NULL DEFAULT 2000,
ALTER COLUMN "currency" SET DEFAULT 'RUB';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ProductVariant" ALTER COLUMN "currency" SET DEFAULT 'RUB';
