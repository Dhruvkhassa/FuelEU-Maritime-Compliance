import axios from 'axios';
import { Pool } from '../../core/domain/Pool';
import { PoolingServicePort } from '../../core/ports/inbound/PoolingServicePort';

const API_BASE_URL = 'http://localhost:3001';

export class ApiPoolingService implements PoolingServicePort {
  async createPool(year: number, shipIds: string[]): Promise<Pool> {
    const response = await axios.post<Pool>(`${API_BASE_URL}/pools`, {
      year,
      shipIds,
    });
    return response.data;
  }
}

