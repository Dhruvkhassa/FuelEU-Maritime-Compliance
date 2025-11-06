import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.fuelComposition.deleteMany();
  await prisma.route.deleteMany();

  // Seed routes with fuel composition data
  // Typical values:
  // HFO: WtT ~15 gCO2e/MJ, TtW ~75 gCO2e/MJ, LCV ~40 MJ/kg
  // LNG: WtT ~20 gCO2e/MJ, TtW ~55 gCO2e/MJ, LCV ~48 MJ/kg, methane slip ~0.02-0.05
  // MGO: WtT ~12 gCO2e/MJ, TtW ~78 gCO2e/MJ, LCV ~42.5 MJ/kg

  const routes = [
    {
      routeId: 'R001',
      vesselType: 'Container',
      fuelType: 'HFO',
      year: 2024,
      ghgIntensity: 91.05,
      fuelConsumption: 12000,
      distance: 4500,
      totalEmissions: 4500,
      isBaseline: true,
      windFactor: 1.0,
      electricityMJ: 0.0,
      fuelCompositions: {
        create: [
          {
            fuelName: 'HFO',
            massTonnes: 12000,
            wtTFactor: 15.0, // gCO2e/MJ
            lcvMJPerKg: 40.0, // MJ/kg
            ttWFactor: 75.0, // gCO2e/MJ
            methaneSlipCoeff: null,
          },
        ],
      },
    },
    {
      routeId: 'R002',
      vesselType: 'BulkCarrier',
      fuelType: 'LNG',
      year: 2024,
      ghgIntensity: 88.04,
      fuelConsumption: 8000,
      distance: 11500,
      totalEmissions: 4200,
      isBaseline: false,
      windFactor: 1.0,
      electricityMJ: 0.0,
      fuelCompositions: {
        create: [
          {
            fuelName: 'LNG',
            massTonnes: 8000,
            wtTFactor: 20.0, // gCO2e/MJ
            lcvMJPerKg: 48.0, // MJ/kg
            ttWFactor: 55.0, // gCO2e/MJ
            methaneSlipCoeff: 0.03, // 3% methane slip for LNG
          },
        ],
      },
    },
    {
      routeId: 'R003',
      vesselType: 'Tanker',
      fuelType: 'MGO',
      year: 2024,
      ghgIntensity: 93.55,
      fuelConsumption: 5100,
      distance: 12500,
      totalEmissions: 4700,
      isBaseline: false,
      windFactor: 1.0,
      electricityMJ: 0.0,
      fuelCompositions: {
        create: [
          {
            fuelName: 'MGO',
            massTonnes: 5100,
            wtTFactor: 12.0, // gCO2e/MJ
            lcvMJPerKg: 42.5, // MJ/kg
            ttWFactor: 78.0, // gCO2e/MJ
            methaneSlipCoeff: null,
          },
        ],
      },
    },
    {
      routeId: 'R004',
      vesselType: 'RoRo',
      fuelType: 'HFO',
      year: 2025,
      ghgIntensity: 89.24,
      fuelConsumption: 9000,
      distance: 11800,
      totalEmissions: 4300,
      isBaseline: false,
      windFactor: 0.95, // 5% wind assistance
      electricityMJ: 500000, // 500 GJ from onshore power supply
      fuelCompositions: {
        create: [
          {
            fuelName: 'HFO',
            massTonnes: 9000,
            wtTFactor: 15.0, // gCO2e/MJ
            lcvMJPerKg: 40.0, // MJ/kg
            ttWFactor: 75.0, // gCO2e/MJ
            methaneSlipCoeff: null,
          },
        ],
      },
    },
    {
      routeId: 'R005',
      vesselType: 'Container',
      fuelType: 'LNG',
      year: 2025,
      ghgIntensity: 90.54,
      fuelConsumption: 9500,
      distance: 11900,
      totalEmissions: 4400,
      isBaseline: false,
      windFactor: 1.0,
      electricityMJ: 0.0,
      fuelCompositions: {
        create: [
          {
            fuelName: 'LNG',
            massTonnes: 9500,
            wtTFactor: 20.0, // gCO2e/MJ
            lcvMJPerKg: 48.0, // MJ/kg
            ttWFactor: 55.0, // gCO2e/MJ
            methaneSlipCoeff: 0.04, // 4% methane slip for LNG
          },
        ],
      },
    },
  ];

  for (const route of routes) {
    await prisma.route.create({ data: route });
  }

  console.log('Seeded routes:', routes.length);
  console.log('Seeded fuel compositions for all routes');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

