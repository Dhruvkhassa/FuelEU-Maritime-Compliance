-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "vesselType" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ghgIntensity" DOUBLE PRECISION NOT NULL,
    "fuelConsumption" DOUBLE PRECISION NOT NULL,
    "distance" DOUBLE PRECISION NOT NULL,
    "totalEmissions" DOUBLE PRECISION NOT NULL,
    "isBaseline" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipCompliance" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "cbGco2eq" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShipCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankEntry" (
    "id" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "amountGco2eq" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pool" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolMember" (
    "id" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "shipId" TEXT NOT NULL,
    "cbBefore" DOUBLE PRECISION NOT NULL,
    "cbAfter" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PoolMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Route_routeId_key" ON "Route"("routeId");

-- CreateIndex
CREATE INDEX "Route_year_idx" ON "Route"("year");

-- CreateIndex
CREATE INDEX "Route_vesselType_idx" ON "Route"("vesselType");

-- CreateIndex
CREATE INDEX "Route_fuelType_idx" ON "Route"("fuelType");

-- CreateIndex
CREATE INDEX "ShipCompliance_shipId_idx" ON "ShipCompliance"("shipId");

-- CreateIndex
CREATE INDEX "ShipCompliance_year_idx" ON "ShipCompliance"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ShipCompliance_shipId_year_key" ON "ShipCompliance"("shipId", "year");

-- CreateIndex
CREATE INDEX "BankEntry_shipId_idx" ON "BankEntry"("shipId");

-- CreateIndex
CREATE INDEX "BankEntry_year_idx" ON "BankEntry"("year");

-- CreateIndex
CREATE INDEX "PoolMember_poolId_idx" ON "PoolMember"("poolId");

-- CreateIndex
CREATE INDEX "PoolMember_shipId_idx" ON "PoolMember"("shipId");

-- AddForeignKey
ALTER TABLE "PoolMember" ADD CONSTRAINT "PoolMember_poolId_fkey" FOREIGN KEY ("poolId") REFERENCES "Pool"("id") ON DELETE CASCADE ON UPDATE CASCADE;
