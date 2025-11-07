export interface FuelCompositionData {
  fuelName: string;
  massTonnes: number;
  wtTFactor: number;
  lcvMJPerKg: number;
  ttWFactor: number;
  methaneSlipCoeff?: number;
}

export interface Route {
  id: string;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
  windFactor?: number;
  electricityMJ?: number;
  fuelCompositions?: FuelCompositionData[];
}

