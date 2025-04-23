-- CreateTable
CREATE TABLE "FundToken" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "investor" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fund" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "amount" DECIMAL(78,18) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentEvent" (
    "id" TEXT NOT NULL,
    "investor" TEXT NOT NULL,
    "usdAmount" TEXT NOT NULL,
    "sharesIssued" TEXT NOT NULL,
    "sharePrice" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "fundAddress" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestmentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedemptionEvent" (
    "id" TEXT NOT NULL,
    "investor" TEXT NOT NULL,
    "shares" TEXT NOT NULL,
    "usdAmount" TEXT NOT NULL,
    "sharePrice" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "fundAddress" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RedemptionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricsUpdatedEvent" (
    "id" TEXT NOT NULL,
    "totalAssetValue" TEXT NOT NULL,
    "sharesSupply" TEXT NOT NULL,
    "sharePrice" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "fundAddress" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetricsUpdatedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundToken_address_key" ON "FundToken"("address");

-- CreateIndex
CREATE INDEX "FundToken_chainId_idx" ON "FundToken"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentEvent_txHash_key" ON "InvestmentEvent"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "RedemptionEvent_txHash_key" ON "RedemptionEvent"("txHash");

-- CreateIndex
CREATE UNIQUE INDEX "MetricsUpdatedEvent_txHash_key" ON "MetricsUpdatedEvent"("txHash");
