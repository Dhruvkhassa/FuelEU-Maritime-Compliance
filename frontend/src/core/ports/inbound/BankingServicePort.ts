import { BankEntry } from '../../domain/BankEntry';

export interface BankingServicePort {
  bankSurplus(shipId: string, year: number): Promise<BankEntry>;
  applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<{ applied: number; cbAfter: number }>;
  getBankRecords(shipId: string, year: number): Promise<BankEntry[]>;
}

