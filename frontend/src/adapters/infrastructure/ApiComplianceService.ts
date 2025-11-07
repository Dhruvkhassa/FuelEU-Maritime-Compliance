import axios from 'axios';
import { ComplianceBalance } from '../../core/domain/ComplianceBalance';
import { ComplianceServicePort } from '../../core/ports/inbound/ComplianceServicePort';

const API_BASE_URL = 'http://localhost:3001';

export class ApiComplianceService implements ComplianceServicePort {
  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const response = await axios.get<ComplianceBalance>(
      `${API_BASE_URL}/compliance/cb`,
      {
        params: { shipId, year },
      }
    );
    return response.data;
  }

  async getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const response = await axios.get<ComplianceBalance>(
      `${API_BASE_URL}/compliance/adjusted-cb`,
      {
        params: { shipId, year },
      }
    );
    return response.data;
  }
}

