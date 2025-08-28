import { CommissionPayoutPeriod } from '../period/commission-payout-period.entity';

export class Violation {
  id: number;
  amount: number;
  description: string;
  period: CommissionPayoutPeriod;
  commissionPayoutID: number; // Liên kết đến CommissionPayout
  employeeID: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity Violation
  // ─────────────────────────────────────────────
  constructor(params?: Partial<Violation>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<Violation>): Violation {
    return new Violation(params);
  }

  update(params: Partial<Violation>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
