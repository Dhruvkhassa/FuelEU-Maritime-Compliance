export interface FuelCompositionData {
  fuelName: string;
  massTonnes: number;
  wtTFactor: number;
  lcvMJPerKg: number;
  ttWFactor: number;
  methaneSlipCoeff?: number;
}

export class Route {
  constructor(
    public readonly id: string,
    public readonly routeId: string,
    public readonly vesselType: string,
    public readonly fuelType: string,
    public readonly year: number,
    public readonly ghgIntensity: number,
    public readonly fuelConsumption: number,
    public readonly distance: number,
    public readonly totalEmissions: number,
    public readonly isBaseline: boolean,
    public readonly windFactor: number = 1.0,
    public readonly electricityMJ: number = 0.0,
    public readonly fuelCompositions: FuelCompositionData[] = []
  ) {}

  static fromPersistence(data: any): Route {
    return new Route(
      data.id,
      data.routeId,
      data.vesselType,
      data.fuelType,
      data.year,
      data.ghgIntensity,
      data.fuelConsumption,
      data.distance,
      data.totalEmissions,
      data.isBaseline,
      data.windFactor ?? 1.0,
      data.electricityMJ ?? 0.0,
      data.fuelCompositions?.map((fc: any) => ({
        fuelName: fc.fuelName,
        massTonnes: fc.massTonnes,
        wtTFactor: fc.wtTFactor,
        lcvMJPerKg: fc.lcvMJPerKg,
        ttWFactor: fc.ttWFactor,
        methaneSlipCoeff: fc.methaneSlipCoeff,
      })) ?? []
    );
  }
}

