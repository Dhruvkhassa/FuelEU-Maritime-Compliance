import { ComplianceBalance } from '../domain/ComplianceBalance';
import { ComplianceServicePort } from '../ports/inbound/ComplianceServicePort';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';
import { ComplianceRepositoryPort } from '../ports/outbound/ComplianceRepositoryPort';
import { BankRepositoryPort } from '../ports/outbound/BankRepositoryPort';
import { GhgIntensityCalculator } from './GhgIntensityCalculator';

export class ComplianceService implements ComplianceServicePort {
  private readonly TARGET_INTENSITY = 89.3368; // gCO₂e/MJ

  constructor(
    private routeRepository: RouteRepositoryPort,
    private complianceRepository: ComplianceRepositoryPort,
    private bankRepository: BankRepositoryPort
  ) {}

  /**
   * Calculate actual GHG intensity from fuel composition data
   * If fuel compositions are available, calculate from WtT and TtW
   * Otherwise, use stored ghgIntensity value
   */
  private calculateActualGhgIntensity(route: any): number {
    // If fuel compositions are available, calculate from fuel data
    if (route.fuelCompositions && route.fuelCompositions.length > 0) {
      const routeFuelData = {
        fuelCompositions: route.fuelCompositions.map((fc: any) => ({
          fuelName: fc.fuelName,
          massTonnes: fc.massTonnes,
          wtTFactor: fc.wtTFactor,
          lcvMJPerKg: fc.lcvMJPerKg,
          ttWFactor: fc.ttWFactor,
          methaneSlipCoeff: fc.methaneSlipCoeff,
        })),
        electricityMJ: route.electricityMJ || 0.0,
        windFactor: route.windFactor || 1.0,
      };

      return GhgIntensityCalculator.calculateActualGhgIntensity(routeFuelData);
    }

    // Fallback to stored value if no fuel composition data
    return route.ghgIntensity;
  }

  /**
   * Calculate energy in scope from fuel composition data
   * If fuel compositions are available, calculate from fuel data
   * Otherwise, use approximation: fuelConsumption × 41,000 MJ/t
   */
  private calculateEnergyInScope(route: any): number {
    // If fuel compositions are available, calculate from fuel data
    if (route.fuelCompositions && route.fuelCompositions.length > 0) {
      const fuelCompositions = route.fuelCompositions.map((fc: any) => ({
        fuelName: fc.fuelName,
        massTonnes: fc.massTonnes,
        wtTFactor: fc.wtTFactor,
        lcvMJPerKg: fc.lcvMJPerKg,
        ttWFactor: fc.ttWFactor,
        methaneSlipCoeff: fc.methaneSlipCoeff,
      }));

      return GhgIntensityCalculator.calculateEnergyInScope(
        fuelCompositions,
        route.electricityMJ || 0.0
      );
    }

    // Fallback to approximation: fuelConsumption × 41,000 MJ/t
    const ENERGY_PER_TONNE = 41000; // MJ/t
    return route.fuelConsumption * ENERGY_PER_TONNE;
  }

  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    // Check if already computed
    const existing = await this.complianceRepository.findByShipAndYear(
      shipId,
      year
    );
    if (existing) {
      return existing;
    }

    // Find route for this ship
    const route = await this.routeRepository.findByRouteId(shipId);
    if (!route) {
      throw new Error(`Route ${shipId} not found`);
    }

    // Calculate actual GHG intensity from fuel data
    const actualGhgIntensity = this.calculateActualGhgIntensity(route);
    
    // Calculate energy in scope
    const energyInScope = this.calculateEnergyInScope(route);

    // Calculate CB: (Target - Actual) × Energy in scope
    const cbGco2eq = (this.TARGET_INTENSITY - actualGhgIntensity) * energyInScope;

    const cb = new ComplianceBalance(shipId, year, cbGco2eq);
    return this.complianceRepository.save(cb);
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const baseCb = await this.getComplianceBalance(shipId, year);
    
    // Apply banked surplus from previous years (Year N-1, N-2, etc.)
    // Banking allows using surpluses from previous periods to offset current deficits
    const previousYear = year - 1;
    const appliedBanked = previousYear > 0 
      ? await this.bankRepository.getTotalBanked(shipId, previousYear)
      : 0;

    // Adjusted CB = Initial CB + Banked Surplus from previous periods
    return new ComplianceBalance(
      shipId,
      year,
      baseCb.cbGco2eq + appliedBanked
    );
  }
}

