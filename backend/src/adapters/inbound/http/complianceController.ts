import { Request, Response } from 'express';
import { ComplianceServicePort } from '../../../core/ports/inbound/ComplianceServicePort';

export class ComplianceController {
  constructor(private complianceService: ComplianceServicePort) {}

  async getComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string);

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const cb = await this.complianceService.getComplianceBalance(shipId, year);
      res.json(cb);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getAdjustedComplianceBalance(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const shipId = req.query.shipId as string;
      const year = parseInt(req.query.year as string);

      if (!shipId || !year) {
        res.status(400).json({ error: 'shipId and year are required' });
        return;
      }

      const cb = await this.complianceService.getAdjustedComplianceBalance(
        shipId,
        year
      );
      res.json(cb);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

