import { PrismaClient } from '@prisma/client';
import { ComplianceBalance } from '../../../core/domain/ComplianceBalance';
import { ComplianceRepositoryPort } from '../../../core/ports/outbound/ComplianceRepositoryPort';

export class PrismaComplianceRepository implements ComplianceRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async save(cb: ComplianceBalance): Promise<ComplianceBalance> {
    const saved = await this.prisma.shipCompliance.upsert({
      where: {
        shipId_year: {
          shipId: cb.shipId,
          year: cb.year,
        },
      },
      create: {
        shipId: cb.shipId,
        year: cb.year,
        cbGco2eq: cb.cbGco2eq,
      },
      update: {
        cbGco2eq: cb.cbGco2eq,
      },
    });

    return new ComplianceBalance(saved.shipId, saved.year, saved.cbGco2eq);
  }

  async findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance | null> {
    const record = await this.prisma.shipCompliance.findUnique({
      where: {
        shipId_year: {
          shipId,
          year,
        },
      },
    });

    return record
      ? new ComplianceBalance(record.shipId, record.year, record.cbGco2eq)
      : null;
  }
}

