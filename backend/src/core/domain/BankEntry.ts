export class BankEntry {
  constructor(
    public readonly id: string,
    public readonly shipId: string,
    public readonly year: number,
    public readonly amountGco2eq: number,
    public readonly createdAt: Date
  ) {}
}

