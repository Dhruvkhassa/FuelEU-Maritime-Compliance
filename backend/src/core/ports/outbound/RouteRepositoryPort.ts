import { Route } from '../../domain/Route';

export interface RouteRepositoryPort {
  findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]>;
  findByRouteId(routeId: string): Promise<Route | null>;
  update(route: Route): Promise<Route>;
  save(route: Route): Promise<Route>;
}

