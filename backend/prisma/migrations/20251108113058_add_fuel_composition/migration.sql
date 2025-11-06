-- AlterTable
ALTER TABLE "Route" ADD COLUMN     "electricityMJ" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "windFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- CreateTable
CREATE TABLE "FuelComposition" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "fuelName" TEXT NOT NULL,
    "massTonnes" DOUBLE PRECISION NOT NULL,
    "wtTFactor" DOUBLE PRECISION NOT NULL,
    "lcvMJPerKg" DOUBLE PRECISION NOT NULL,
    "ttWFactor" DOUBLE PRECISION NOT NULL,
    "methaneSlipCoeff" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FuelComposition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FuelComposition_routeId_idx" ON "FuelComposition"("routeId");

-- AddForeignKey
ALTER TABLE "FuelComposition" ADD CONSTRAINT "FuelComposition_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;
