import { Pool } from '../../domain/Pool';

export interface PoolingServicePort {
  createPool(year: number, shipIds: string[]): Promise<Pool>;
}

