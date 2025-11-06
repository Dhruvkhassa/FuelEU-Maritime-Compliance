import { BankEntry } from '../domain/BankEntry';
import { BankingServicePort } from '../ports/inbound/BankingServicePort';
import { ComplianceServicePort } from '../ports/inbound/ComplianceServicePort';
import { BankRepositoryPort } from '../ports/outbound/BankRepositoryPort';

export class BankingService implements BankingServicePort {
  constructor(
    private complianceService: ComplianceServicePort,
    private bankRepository: BankRepositoryPort
  ) {}

  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const cb = await this.complianceService.getComplianceBalance(shipId, year);

    if (cb.cbGco2eq <= 0) {
      throw new Error('Cannot bank: Compliance balance is not positive');
    }

    const entry = new BankEntry(
      crypto.randomUUID(),
      shipId,
      year,
      cb.cbGco2eq,
      new Date()
    );

    return this.bankRepository.save(entry);
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<{ applied: number; cbAfter: number }> {
    const available = await this.bankRepository.getTotalBanked(shipId, year);
    if (amount > available) {
      throw new Error(
        `Cannot apply ${amount}: only ${available} available in bank`
      );
    }

    const applied = await this.bankRepository.applyBanked(
      shipId,
      year,
      amount
    );

    const adjustedCb = await this.complianceService.getAdjustedComplianceBalance(
      shipId,
      year
    );

    return { applied, cbAfter: adjustedCb.cbGco2eq };
  }

  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    return this.bankRepository.findByShipAndYear(shipId, year);
  }
}

