import { BankEntry } from '../../domain/BankEntry';

export interface BankRepositoryPort {
  save(entry: BankEntry): Promise<BankEntry>;
  findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
  getTotalBanked(shipId: string, year: number): Promise<number>;
  applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<number>;
}

