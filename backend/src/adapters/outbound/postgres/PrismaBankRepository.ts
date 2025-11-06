import { PrismaClient } from '@prisma/client';
import { BankEntry } from '../../../core/domain/BankEntry';
import { BankRepositoryPort } from '../../../core/ports/outbound/BankRepositoryPort';

export class PrismaBankRepository implements BankRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async save(entry: BankEntry): Promise<BankEntry> {
    const saved = await this.prisma.bankEntry.create({
      data: {
        id: entry.id,
        shipId: entry.shipId,
        year: entry.year,
        amountGco2eq: entry.amountGco2eq,
      },
    });

    return new BankEntry(
      saved.id,
      saved.shipId,
      saved.year,
      saved.amountGco2eq,
      saved.createdAt
    );
  }

  async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
    const entries = await this.prisma.bankEntry.findMany({
      where: { shipId, year },
    });

    return entries.map(
      (e) =>
        new BankEntry(e.id, e.shipId, e.year, e.amountGco2eq, e.createdAt)
    );
  }

  async getTotalBanked(shipId: string, year: number): Promise<number> {
    const entries = await this.findByShipAndYear(shipId, year);
    return entries.reduce((sum, e) => sum + e.amountGco2eq, 0);
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<number> {
    // In a real system, we'd track applied amounts separately
    // For simplicity, we'll just return the amount applied
    // This would typically involve creating an "applied" record
    return amount;
  }
}

