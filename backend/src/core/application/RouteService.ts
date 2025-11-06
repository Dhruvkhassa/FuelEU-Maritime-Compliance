import { Route } from '../domain/Route';
import { RouteServicePort } from '../ports/inbound/RouteServicePort';
import { RouteRepositoryPort } from '../ports/outbound/RouteRepositoryPort';
import { GhgIntensityCalculator } from './GhgIntensityCalculator';

export class RouteService implements RouteServicePort {
  constructor(private routeRepository: RouteRepositoryPort) {}

  async getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    return this.routeRepository.findAll(filters);
  }

  async setBaseline(routeId: string): Promise<Route> {
    const route = await this.routeRepository.findByRouteId(routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    // Clear all baselines first
    const allRoutes = await this.routeRepository.findAll({ year: route.year });
    for (const r of allRoutes) {
      if (r.isBaseline && r.routeId !== routeId) {
        const updated = new Route(
          r.id,
          r.routeId,
          r.vesselType,
          r.fuelType,
          r.year,
          r.ghgIntensity,
          r.fuelConsumption,
          r.distance,
          r.totalEmissions,
          false
        );
        await this.routeRepository.update(updated);
      }
    }

    // Set new baseline
    const updated = new Route(
      route.id,
      route.routeId,
      route.vesselType,
      route.fuelType,
      route.year,
      route.ghgIntensity,
      route.fuelConsumption,
      route.distance,
      route.totalEmissions,
      true
    );

    return this.routeRepository.update(updated);
  }

  /**
   * Calculate actual GHG intensity from fuel composition data
   * If fuel compositions are available, calculate from WtT and TtW
   * Otherwise, use stored ghgIntensity value
   */
  private calculateActualGhgIntensity(route: Route): number {
    // If fuel compositions are available, calculate from fuel data
    if (route.fuelCompositions && route.fuelCompositions.length > 0) {
      const routeFuelData = {
        fuelCompositions: route.fuelCompositions.map((fc) => ({
          fuelName: fc.fuelName,
          massTonnes: fc.massTonnes,
          wtTFactor: fc.wtTFactor,
          lcvMJPerKg: fc.lcvMJPerKg,
          ttWFactor: fc.ttWFactor,
          methaneSlipCoeff: fc.methaneSlipCoeff,
        })),
        electricityMJ: route.electricityMJ,
        windFactor: route.windFactor,
      };

      return GhgIntensityCalculator.calculateActualGhgIntensity(routeFuelData);
    }

    // Fallback to stored value if no fuel composition data
    return route.ghgIntensity;
  }

  async getComparison(): Promise<{
    baseline: Route;
    comparisons: Array<{
      route: Route;
      percentDiff: number;
      compliant: boolean;
      actualGhgIntensity: number;
    }>;
  }> {
    const routes = await this.routeRepository.findAll();
    const baseline = routes.find((r) => r.isBaseline);
    if (!baseline) {
      throw new Error('No baseline route found');
    }

    const TARGET_INTENSITY = 89.3368;
    
    // Calculate actual GHG intensity for baseline
    const baselineActualIntensity = this.calculateActualGhgIntensity(baseline);

    const comparisons = routes
      .filter((r) => !r.isBaseline)
      .map((route) => {
        // Calculate actual GHG intensity from fuel data
        const actualGhgIntensity = this.calculateActualGhgIntensity(route);
        
        // Calculate percent difference compared to baseline
        const percentDiff = ((actualGhgIntensity / baselineActualIntensity) - 1) * 100;
        
        // Check compliance: actual intensity must be <= target
        const compliant = actualGhgIntensity <= TARGET_INTENSITY;
        
        return { route, percentDiff, compliant, actualGhgIntensity };
      });

    return { baseline, comparisons };
  }
}

