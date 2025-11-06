import { ComplianceBalance } from '../../domain/ComplianceBalance';

export interface ComplianceRepositoryPort {
  save(cb: ComplianceBalance): Promise<ComplianceBalance>;
  findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance | null>;
}

