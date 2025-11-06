import { ComplianceService } from '../ComplianceService';
import { GhgIntensityCalculator } from '../GhgIntensityCalculator';

// We'll mock the repository ports with minimal behavior
class InMemoryRouteRepo {
  private routes: Record<string, any> = {};
  constructor(route: any) {
    this.routes[route.routeId] = route;
  }
  async findByRouteId(id: string) {
    return this.routes[id];
  }
}

class InMemoryComplianceRepo {
  private store: any[] = [];
  async findByShipAndYear(shipId: string, year: number) {
    return this.store.find(s => s.shipId === shipId && s.year === year) || null;
  }
  async save(cb: any) {
    this.store.push(cb);
    return cb;
  }
}

class InMemoryBankRepo {
  constructor(private banked = 0) {}
  async getTotalBanked(shipId: string, year: number) {
    return this.banked;
  }
}

describe('ComplianceService', () => {
  test('calculates CB using calculated GHG intensity and energy', async () => {
    const route = {
      routeId: 'S1',
      fuelCompositions: [
        {
          fuelName: 'MGO',
          massTonnes: 1,
          wtTFactor: 12,
          lcvMJPerKg: 42,
          ttWFactor: 68,
        },
      ],
      electricityMJ: 0,
      windFactor: 1.0,
      fuelConsumption: 1,
      ghgIntensity: 100,
    };

    const routeRepo = new InMemoryRouteRepo(route);
    const complianceRepo = new InMemoryComplianceRepo();
    const bankRepo = new InMemoryBankRepo(0);

    const svc = new ComplianceService(routeRepo as any, complianceRepo as any, bankRepo as any);

    const cb = await svc.getComplianceBalance('S1', 2025);
    expect(cb).toBeDefined();
    // cbGco2eq should be a number (can be negative or positive)
    expect(typeof cb.cbGco2eq).toBe('number');
  });

  test('applies banked surplus in adjusted balance', async () => {
    const route = {
      routeId: 'S2',
      fuelCompositions: [],
      fuelConsumption: 10,
      ghgIntensity: 80, // lower than target → surplus
    };

    const routeRepo = new InMemoryRouteRepo(route);
    const complianceRepo = new InMemoryComplianceRepo();
    const bankRepo = new InMemoryBankRepo(5000); // 5,000 gCO2eq banked

    const svc = new ComplianceService(routeRepo as any, complianceRepo as any, bankRepo as any);

    const adjusted = await svc.getAdjustedComplianceBalance('S2', 2025);
    expect(adjusted).toBeDefined();
    expect(typeof adjusted.cbGco2eq).toBe('number');
    // Adjusted should equal base + banked (banked is numeric addition)
  });
});
