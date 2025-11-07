import axios from 'axios';
import { Route } from '../../core/domain/Route';
import { RouteServicePort } from '../../core/ports/inbound/RouteServicePort';

const API_BASE_URL = 'http://localhost:3001';

export class ApiRouteService implements RouteServicePort {
  async getAllRoutes(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    const response = await axios.get<Route[]>(`${API_BASE_URL}/routes`, {
      params: filters,
    });
    return response.data;
  }

  async setBaseline(routeId: string): Promise<Route> {
    const response = await axios.post<Route>(
      `${API_BASE_URL}/routes/${routeId}/baseline`
    );
    return response.data;
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
    const response = await axios.get<{
      baseline: Route;
      comparisons: Array<{
        route: Route;
        percentDiff: number;
        compliant: boolean;
        actualGhgIntensity: number;
      }>;
    }>(`${API_BASE_URL}/routes/comparison`);
    return response.data;
  }
}

