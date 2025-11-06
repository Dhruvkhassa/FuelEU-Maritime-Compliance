import { Route } from '../../domain/Route';

export interface RouteServicePort {
  getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
  setBaseline(routeId: string): Promise<Route>;
  getComparison(): Promise<{
    baseline: Route;
    comparisons: Array<{
      route: Route;
      percentDiff: number;
      compliant: boolean;
      actualGhgIntensity: number;
    }>;
  }>;
}

