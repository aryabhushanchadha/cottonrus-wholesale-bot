-- AlterTable
ALTER TABLE "Product" DROP COLUMN "images";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
