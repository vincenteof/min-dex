/*
  Warnings:

  - Made the column `ethSold` on table `SwapEvent` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tokensSold` on table `SwapEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LiquidityEvent" ALTER COLUMN "tokenAmount" SET DATA TYPE TEXT,
ALTER COLUMN "ethAmount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SwapEvent" ALTER COLUMN "ethSold" SET NOT NULL,
ALTER COLUMN "ethSold" DROP DEFAULT,
ALTER COLUMN "ethSold" SET DATA TYPE TEXT,
ALTER COLUMN "tokensSold" SET NOT NULL,
ALTER COLUMN "tokensSold" DROP DEFAULT,
ALTER COLUMN "tokensSold" SET DATA TYPE TEXT,
ALTER COLUMN "tokensBought" SET DATA TYPE TEXT;
