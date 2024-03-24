/*
  Warnings:

  - Added the required column `liquidity` to the `LiquidityEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LiquidityEvent" ADD COLUMN     "liquidity" TEXT NOT NULL;
