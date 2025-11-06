export class ComplianceBalance {
  constructor(
    public readonly shipId: string,
    public readonly year: number,
    public readonly cbGco2eq: number
  ) {}

  static calculate(
    targetIntensity: number,
    actualIntensity: number,
    fuelConsumption: number
  ): number {
    const ENERGY_PER_TONNE = 41000; // MJ/t
    const energyInScope = fuelConsumption * ENERGY_PER_TONNE;
    return (targetIntensity - actualIntensity) * energyInScope;
  }

  get isSurplus(): boolean {
    return this.cbGco2eq > 0;
  }

  get isDeficit(): boolean {
    return this.cbGco2eq < 0;
  }
}

