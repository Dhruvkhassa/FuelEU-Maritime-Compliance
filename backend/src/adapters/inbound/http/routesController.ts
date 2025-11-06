import { Request, Response } from 'express';
import { RouteServicePort } from '../../../core/ports/inbound/RouteServicePort';

export class RoutesController {
  constructor(private routeService: RouteServicePort) {}

  async getAllRoutes(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        vesselType: req.query.vesselType as string | undefined,
        fuelType: req.query.fuelType as string | undefined,
        year: req.query.year ? parseInt(req.query.year as string) : undefined,
      };

      const routes = await this.routeService.getAllRoutes(filters);
      res.json(routes);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const route = await this.routeService.setBaseline(id);
      res.json(route);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getComparison(req: Request, res: Response): Promise<void> {
    try {
      const comparison = await this.routeService.getComparison();
      res.json(comparison);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

