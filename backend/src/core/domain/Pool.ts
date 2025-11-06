export class Pool {
  constructor(
    public readonly id: string,
    public readonly year: number,
    public readonly members: PoolMember[]
  ) {}

  get totalCb(): number {
    return this.members.reduce((sum, member) => sum + member.cbAfter, 0);
  }

  get isValid(): boolean {
    return this.totalCb >= 0;
  }
}

export class PoolMember {
  constructor(
    public readonly id: string,
    public readonly poolId: string,
    public readonly shipId: string,
    public readonly cbBefore: number,
    public readonly cbAfter: number
  ) {}
}

