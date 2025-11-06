import { PrismaClient } from '@prisma/client';
import { Route } from '../../../core/domain/Route';
import { RouteRepositoryPort } from '../../../core/ports/outbound/RouteRepositoryPort';

export class PrismaRouteRepository implements RouteRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: {
    vesselType?: string;
    fuelType?: string;
    year?: number;
  }): Promise<Route[]> {
    const routes = await this.prisma.route.findMany({
      where: {
        ...(filters?.vesselType && { vesselType: filters.vesselType }),
        ...(filters?.fuelType && { fuelType: filters.fuelType }),
        ...(filters?.year && { year: filters.year }),
      },
      include: {
        fuelCompositions: true,
      },
    });

    return routes.map((r) => Route.fromPersistence(r));
  }

  async findByRouteId(routeId: string): Promise<Route | null> {
    const route = await this.prisma.route.findUnique({
      where: { routeId },
      include: {
        fuelCompositions: true,
      },
    });

    return route ? Route.fromPersistence(route) : null;
  }

  async update(route: Route): Promise<Route> {
    const updated = await this.prisma.route.update({
      where: { id: route.id },
      data: {
        isBaseline: route.isBaseline,
      },
      include: {
        fuelCompositions: true,
      },
    });

    return Route.fromPersistence(updated);
  }

  async save(route: Route): Promise<Route> {
    const saved = await this.prisma.route.create({
      data: {
        routeId: route.routeId,
        vesselType: route.vesselType,
        fuelType: route.fuelType,
        year: route.year,
        ghgIntensity: route.ghgIntensity,
        fuelConsumption: route.fuelConsumption,
        distance: route.distance,
        totalEmissions: route.totalEmissions,
        isBaseline: route.isBaseline,
      },
    });

    return Route.fromPersistence(saved);
  }
}

