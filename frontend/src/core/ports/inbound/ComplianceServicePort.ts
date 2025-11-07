import { ComplianceBalance } from '../../domain/ComplianceBalance';

export interface ComplianceServicePort {
  getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance>;
  getAdjustedComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance>;
}

