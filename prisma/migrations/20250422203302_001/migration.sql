-- CreateTable
CREATE TABLE "FundToken" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FundToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FundToken_address_key" ON "FundToken"("address");

-- CreateIndex
CREATE INDEX "FundToken_chainId_idx" ON "FundToken"("chainId");
