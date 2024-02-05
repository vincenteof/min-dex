-- CreateTable
CREATE TABLE "Token" (
    "tokenId" SERIAL NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "tokenName" TEXT,
    "tokenSymbol" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("tokenId")
);

-- CreateTable
CREATE TABLE "Exchange" (
    "exchangeId" SERIAL NOT NULL,
    "exchangeAddress" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("exchangeId")
);

-- CreateTable
CREATE TABLE "LiquidityEvent" (
    "eventId" SERIAL NOT NULL,
    "exchangeId" INTEGER NOT NULL,
    "providerAddress" TEXT NOT NULL,
    "tokenAmount" DOUBLE PRECISION NOT NULL,
    "ethAmount" DOUBLE PRECISION NOT NULL,
    "eventType" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiquidityEvent_pkey" PRIMARY KEY ("eventId")
);

-- CreateTable
CREATE TABLE "SwapEvent" (
    "swapId" SERIAL NOT NULL,
    "exchangeId" INTEGER NOT NULL,
    "userAddress" TEXT NOT NULL,
    "ethSold" DOUBLE PRECISION DEFAULT 0,
    "tokensSold" DOUBLE PRECISION DEFAULT 0,
    "tokensBought" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SwapEvent_pkey" PRIMARY KEY ("swapId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Token_tokenAddress_key" ON "Token"("tokenAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Exchange_exchangeAddress_key" ON "Exchange"("exchangeAddress");

-- AddForeignKey
ALTER TABLE "Exchange" ADD CONSTRAINT "Exchange_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("tokenId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiquidityEvent" ADD CONSTRAINT "LiquidityEvent_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("exchangeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SwapEvent" ADD CONSTRAINT "SwapEvent_exchangeId_fkey" FOREIGN KEY ("exchangeId") REFERENCES "Exchange"("exchangeId") ON DELETE RESTRICT ON UPDATE CASCADE;
