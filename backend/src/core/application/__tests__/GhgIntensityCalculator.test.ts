import { GhgIntensityCalculator, FuelComposition } from '../GhgIntensityCalculator';

describe('GhgIntensityCalculator', () => {
  test('calculates WtT, TtW and actual intensity for simple fuel mix', () => {
    const fuels: FuelComposition[] = [
      {
        fuelName: 'HFO',
        massTonnes: 10, // 10 t
        wtTFactor: 15, // gCO2e/MJ
        lcvMJPerKg: 40, // MJ/kg
        ttWFactor: 70,
      },
      {
        fuelName: 'MGO',
        massTonnes: 5, // 5 t
        wtTFactor: 12,
        lcvMJPerKg: 42,
        ttWFactor: 68,
      },
    ];

    const electricityMJ = 0;
    const wtT = GhgIntensityCalculator.calculateWtT(fuels, electricityMJ);
    const ttW = GhgIntensityCalculator.calculateTtW(fuels, electricityMJ);
    const energy = GhgIntensityCalculator.calculateEnergyInScope(fuels, electricityMJ);
    const actual = GhgIntensityCalculator.calculateActualGhgIntensity({ fuelCompositions: fuels, electricityMJ, windFactor: 1.0 });

    // Basic sanity checks
    expect(energy).toBeGreaterThan(0);
    expect(wtT).toBeGreaterThan(0);
    expect(ttW).toBeGreaterThan(0);
    expect(actual).toBeCloseTo(wtT + ttW, 6);
  });

  test('applies methane slip correctly to TtW', () => {
    const fuels: FuelComposition[] = [
      {
        fuelName: 'LNG',
        massTonnes: 2,
        wtTFactor: 10,
        lcvMJPerKg: 50,
        ttWFactor: 20,
        methaneSlipCoeff: 0.05, // 5% slip
      },
    ];

    const ttWNoSlip = GhgIntensityCalculator.calculateTtW([
      { ...fuels[0], methaneSlipCoeff: undefined }
    ], 0);
    const ttWWithSlip = GhgIntensityCalculator.calculateTtW(fuels, 0);

    expect(ttWWithSlip).toBeGreaterThan(ttWNoSlip);
  });
});
