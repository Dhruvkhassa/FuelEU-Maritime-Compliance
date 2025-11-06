import { Pool, PoolMember } from '../domain/Pool';
import { PoolingServicePort } from '../ports/inbound/PoolingServicePort';
import { ComplianceServicePort } from '../ports/inbound/ComplianceServicePort';
import { PoolRepositoryPort } from '../ports/outbound/PoolRepositoryPort';

export class PoolingService implements PoolingServicePort {
  constructor(
    private complianceService: ComplianceServicePort,
    private poolRepository: PoolRepositoryPort
  ) {}

  async createPool(year: number, shipIds: string[]): Promise<Pool> {
    if (shipIds.length === 0) {
      throw new Error('Pool must have at least one member');
    }

    // Get adjusted CB for all ships
    const membersData = await Promise.all(
      shipIds.map(async (shipId) => {
        const cb = await this.complianceService.getAdjustedComplianceBalance(
          shipId,
          year
        );
        return { shipId, cbBefore: cb.cbGco2eq };
      })
    );

    // Validate: Sum must be >= 0
    const totalCb = membersData.reduce((sum, m) => sum + m.cbBefore, 0);
    if (totalCb < 0) {
      throw new Error(
        `Pool invalid: total CB ${totalCb} is negative. Sum must be >= 0`
      );
    }

    // Greedy allocation: sort by CB (descending)
    const sorted = [...membersData].sort((a, b) => b.cbBefore - a.cbBefore);
    const deficits = sorted.filter((m) => m.cbBefore < 0);
    const surpluses = sorted.filter((m) => m.cbBefore > 0);

    // Allocate surpluses to deficits
    const allocations = new Map<string, number>();
    membersData.forEach((m) => allocations.set(m.shipId, m.cbBefore));

    for (const deficit of deficits) {
      let remainingDeficit = -deficit.cbBefore;

      for (const surplus of surpluses) {
        if (remainingDeficit <= 0) break;

        const availableSurplus = allocations.get(surplus.shipId) || 0;
        if (availableSurplus <= 0) continue;

        const transfer = Math.min(remainingDeficit, availableSurplus);
        allocations.set(
          deficit.shipId,
          (allocations.get(deficit.shipId) || 0) + transfer
        );
        allocations.set(
          surplus.shipId,
          (allocations.get(surplus.shipId) || 0) - transfer
        );
        remainingDeficit -= transfer;
      }
    }

    // Validate exit conditions
    for (const member of membersData) {
      const cbAfter = allocations.get(member.shipId) || 0;

      if (member.cbBefore < 0 && cbAfter < member.cbBefore) {
        throw new Error(
          `Deficit ship ${member.shipId} cannot exit worse (${cbAfter} < ${member.cbBefore})`
        );
      }

      if (member.cbBefore > 0 && cbAfter < 0) {
        throw new Error(
          `Surplus ship ${member.shipId} cannot exit negative (${cbAfter} < 0)`
        );
      }
    }

    // Create pool members
    const poolId = crypto.randomUUID();
    const members = membersData.map(
      (m) =>
        new PoolMember(
          crypto.randomUUID(),
          poolId,
          m.shipId,
          m.cbBefore,
          allocations.get(m.shipId) || 0
        )
    );

    const pool = new Pool(poolId, year, members);
    return this.poolRepository.save(pool);
  }
}

