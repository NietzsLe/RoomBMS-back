import { Violation } from './violation.entity';
import { CommissionPayoutPeriod } from './commission-payout-period.entity';
import { Commission } from './commission.entity';

export class CommissionPayout {
  id: number;
  status: string; // Sử dụng CommissionPayoutStatus enum ở domain layer
  userID: number;
  violations: Violation[];
  period: CommissionPayoutPeriod;
  commissions: Commission[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity CommissionPayout
  // ─────────────────────────────────────────────
  constructor(params?: Partial<CommissionPayout>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
      this.violations = params.violations ?? [];
      this.commissions = params.commissions ?? [];
    }
  }

  static create(params: Partial<CommissionPayout>): CommissionPayout {
    return new CommissionPayout(params);
  }

  update(params: Partial<CommissionPayout>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần

  // ─────────────────────────────────────────────
  // ▶ Method quản lý array: violations, commissions
  // ─────────────────────────────────────────────
  addViolation(violation: Violation): void {
    // 💡 NOTE(GitHub Copilot): Thêm violation vào danh sách
    this.violations.push(violation);
  }

  removeViolation(violationID: number): void {
    // 💡 NOTE(GitHub Copilot): Xóa violation theo id
    this.violations = this.violations.filter((v) => v.id !== violationID);
  }

  addCommission(commission: Commission): void {
    // 💡 NOTE(GitHub Copilot): Thêm commission vào danh sách
    this.commissions.push(commission);
  }

  removeCommission(commissionID: number): void {
    // 💡 NOTE(GitHub Copilot): Xóa commission theo id
    this.commissions = this.commissions.filter((c) => c.id !== commissionID);
  }
}
