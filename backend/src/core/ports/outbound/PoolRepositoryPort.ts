import { Pool } from '../../domain/Pool';

export interface PoolRepositoryPort {
  save(pool: Pool): Promise<Pool>;
}

