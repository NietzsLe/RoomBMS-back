export class Commission {
  id: number; // Khóa chính
  amount: number; // Lượng hoa hồng nhận
  description: string;
  createdAt: Date; // Thời gian tạo
  updatedAt: Date; // Thời gian sửa
  deletedAt?: Date; // Thời gian xóa (nếu có)
  commissionPayoutID: number; // Liên kết đến CommissionPayout
  employeeID: string; // Liên kết đến User
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity Commission
  // ─────────────────────────────────────────────
  constructor(params?: Partial<Commission>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<Commission>): Commission {
    return new Commission(params);
  }

  update(params: Partial<Commission>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  delete(): void {
    // 💡 NOTE(GitHub Copilot): Xóa mềm entity, gán deletedAt
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
