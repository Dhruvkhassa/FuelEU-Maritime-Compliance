import axios from 'axios';
import { BankEntry } from '../../core/domain/BankEntry';
import { BankingServicePort } from '../../core/ports/inbound/BankingServicePort';

const API_BASE_URL = 'http://localhost:3001';

export class ApiBankingService implements BankingServicePort {
  async bankSurplus(shipId: string, year: number): Promise<BankEntry> {
    const response = await axios.post<BankEntry>(
      `${API_BASE_URL}/banking/bank`,
      { shipId, year }
    );
    return response.data;
  }

  async applyBanked(
    shipId: string,
    year: number,
    amount: number
  ): Promise<{ applied: number; cbAfter: number }> {
    const response = await axios.post<{ applied: number; cbAfter: number }>(
      `${API_BASE_URL}/banking/apply`,
      { shipId, year, amount }
    );
    return response.data;
  }

  async getBankRecords(shipId: string, year: number): Promise<BankEntry[]> {
    const response = await axios.get<BankEntry[]>(
      `${API_BASE_URL}/banking/records`,
      {
        params: { shipId, year },
      }
    );
    return response.data;
  }
}

