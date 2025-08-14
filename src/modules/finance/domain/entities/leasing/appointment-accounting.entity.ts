import { PerformancePeriod } from '../performance-period.entity';

export class AppointmentAccounting {
  id: number; // Khóa chính, liên kết đến Appointment
  period: PerformancePeriod; // Liên kết đến kỳ tính hiệu suất
  madeSalerID?: string; // Người tạo (Saler)
  madeCollaboratorID?: string; // Người tạo (Collaborator)
  takenOverSalerID?: string; // Người tiếp nhận (Saler)
  madeTeamID?: string; // Team tạo
  takenOverTeamID?: string; // Team tiếp nhận
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity AppointmentAccounting
  // ─────────────────────────────────────────────
  constructor(params?: Partial<AppointmentAccounting>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<AppointmentAccounting>): AppointmentAccounting {
    return new AppointmentAccounting(params);
  }

  update(params: Partial<AppointmentAccounting>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
