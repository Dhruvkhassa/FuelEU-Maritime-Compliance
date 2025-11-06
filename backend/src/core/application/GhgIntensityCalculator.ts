/**
 * GHG Intensity Calculator
 * Implements FuelEU Maritime Regulation calculations for:
 * - Well-to-Tank (WtT) emissions
 * - Tank-to-Wake (TtW) emissions
 * - Actual GHG Intensity (GHGIE_actual)
 */

export interface FuelComposition {
  fuelName: string;
  massTonnes: number; // Mi: Mass of fuel in tonnes
  wtTFactor: number; // CO2eq_WtT,i: Well-to-Tank GHG emission factor (gCO2e/MJ)
  lcvMJPerKg: number; // LCVi: Lower Calorific Value (MJ/kg)
  ttWFactor: number; // TtW CO2 equivalent emissions factor (gCO2e/MJ)
  methaneSlipCoeff?: number; // C_slip,j: Non-combusted fuel coefficient (for LNG, etc.)
}

export interface RouteFuelData {
  fuelCompositions: FuelComposition[];
  electricityMJ: number; // Ek: electricity from Onshore Power Supply (MJ)
  windFactor: number; // f_wind: wind-assisted propulsion reward factor
}

export class GhgIntensityCalculator {
  /**
   * Calculate Well-to-Tank (WtT) emissions
   * Formula: WtT = Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy
   * 
   * @param fuelCompositions Array of fuel compositions
   * @param electricityMJ Electricity from Onshore Power Supply (MJ)
   * @returns WtT emissions in gCO2e/MJ
   */
  static calculateWtT(
    fuelCompositions: FuelComposition[],
    electricityMJ: number
  ): number {
    let numerator = 0; // Σ(Mi × CO2eq_WtT,i × LCVi)
    let totalEnergy = electricityMJ; // Start with electricity

    for (const fuel of fuelCompositions) {
      // Convert mass from tonnes to kg
      const massKg = fuel.massTonnes * 1000;
      // Energy from this fuel = mass (kg) × LCV (MJ/kg)
      const fuelEnergy = massKg * fuel.lcvMJPerKg;
      // WtT contribution = mass (kg) × WtT factor × LCV (MJ/kg)
      numerator += massKg * fuel.wtTFactor * fuel.lcvMJPerKg;
      totalEnergy += fuelEnergy;
    }

    if (totalEnergy === 0) {
      return 0;
    }

    // WtT = Σ(Mi × CO2eq_WtT,i × LCVi) / Total Energy
    return numerator / totalEnergy;
  }

  /**
   * Calculate Tank-to-Wake (TtW) emissions
   * Formula: TtW accounts for combustion emissions including methane slip
   * TtW = Σ(Mi × TtW_factor_i × LCVi) / Total Energy
   * 
   * @param fuelCompositions Array of fuel compositions
   * @param electricityMJ Electricity from Onshore Power Supply (MJ)
   * @returns TtW emissions in gCO2e/MJ
   */
  static calculateTtW(
    fuelCompositions: FuelComposition[],
    electricityMJ: number
  ): number {
    let numerator = 0; // Σ(Mi × TtW_factor_i × LCVi)
    let totalEnergy = electricityMJ; // Start with electricity

    for (const fuel of fuelCompositions) {
      // Convert mass from tonnes to kg
      const massKg = fuel.massTonnes * 1000;
      // Energy from this fuel = mass (kg) × LCV (MJ/kg)
      const fuelEnergy = massKg * fuel.lcvMJPerKg;
      
      // TtW factor may include methane slip adjustment
      // For fuels with methane slip, the TtW factor should already account for it
      // or we can apply: TtW_effective = TtW_factor × (1 + C_slip)
      let effectiveTtWFactor = fuel.ttWFactor;
      if (fuel.methaneSlipCoeff !== undefined && fuel.methaneSlipCoeff !== null) {
        // Apply methane slip coefficient if provided
        effectiveTtWFactor = fuel.ttWFactor * (1 + fuel.methaneSlipCoeff);
      }
      
      // TtW contribution = mass (kg) × TtW factor × LCV (MJ/kg)
      numerator += massKg * effectiveTtWFactor * fuel.lcvMJPerKg;
      totalEnergy += fuelEnergy;
    }

    if (totalEnergy === 0) {
      return 0;
    }

    // TtW = Σ(Mi × TtW_factor_i × LCVi) / Total Energy
    return numerator / totalEnergy;
  }

  /**
   * Calculate Actual GHG Intensity (GHGIE_actual)
   * Formula: GHGIE_actual = f_wind × (WtT + TtW)
   * 
   * @param routeFuelData Route fuel data including compositions, electricity, and wind factor
   * @returns Actual GHG Intensity in gCO2e/MJ
   */
  static calculateActualGhgIntensity(routeFuelData: RouteFuelData): number {
    const { fuelCompositions, electricityMJ, windFactor } = routeFuelData;

    const wtT = this.calculateWtT(fuelCompositions, electricityMJ);
    const ttW = this.calculateTtW(fuelCompositions, electricityMJ);

    // GHGIE_actual = f_wind × (WtT + TtW)
    return windFactor * (wtT + ttW);
  }

  /**
   * Calculate total energy in scope (MJ)
   * Formula: Energy in scope = Σ(Mi × LCVi) + Ek
   * Approximation: Energy in scope ≈ fuelConsumption × 41,000 MJ/t
   * 
   * @param fuelCompositions Array of fuel compositions
   * @param electricityMJ Electricity from Onshore Power Supply (MJ)
   * @returns Total energy in scope (MJ)
   */
  static calculateEnergyInScope(
    fuelCompositions: FuelComposition[],
    electricityMJ: number
  ): number {
    let totalEnergy = electricityMJ;

    for (const fuel of fuelCompositions) {
      // Convert mass from tonnes to kg
      const massKg = fuel.massTonnes * 1000;
      // Energy from this fuel = mass (kg) × LCV (MJ/kg)
      totalEnergy += massKg * fuel.lcvMJPerKg;
    }

    return totalEnergy;
  }
}

