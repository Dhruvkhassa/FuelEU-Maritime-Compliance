import { PrismaClient } from '@prisma/client';
import { Pool, PoolMember } from '../../../core/domain/Pool';
import { PoolRepositoryPort } from '../../../core/ports/outbound/PoolRepositoryPort';

export class PrismaPoolRepository implements PoolRepositoryPort {
  constructor(private prisma: PrismaClient) {}

  async save(pool: Pool): Promise<Pool> {
    const saved = await this.prisma.pool.create({
      data: {
        id: pool.id,
        year: pool.year,
        members: {
          create: pool.members.map((m) => ({
            id: m.id,
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })),
        },
      },
      include: { members: true },
    });

    const members = saved.members.map(
      (m) =>
        new PoolMember(m.id, m.poolId, m.shipId, m.cbBefore, m.cbAfter)
    );

    return new Pool(saved.id, saved.year, members);
  }
}

