import { PerformanceRecordObjectType } from '../finance.enum';
import { PerformancePeriod } from './performance-period.entity';

export class PerformanceRecord {
  id: number;
  periodCode: PerformancePeriod;
  revenue?: number;
  salerRevenue?: number;
  collaboratorRevenue?: number;
  madeBySalerAppointmentCount?: number;
  madeByCollaboratorAppointmentCount?: number;
  takenOverAppointmentCount?: number;
  depositAgreementCount?: number;
  activeDepositAgreementCount?: number;
  cancelledDepositAgreementCount?: number;
  objectType: PerformanceRecordObjectType;
  teamID?: string;
  salerID?: string;
  collaboratorID?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity PerformanceRecord
  // ─────────────────────────────────────────────
  constructor(params?: Partial<PerformanceRecord>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<PerformanceRecord>): PerformanceRecord {
    return new PerformanceRecord(params);
  }

  update(params: Partial<PerformanceRecord>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
