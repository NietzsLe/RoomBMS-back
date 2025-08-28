import { AgreementReceiptStatus } from '../../finance.enum';

export class AgreementReceipt {
  id: number; // Khóa chính
  amount: number; // Lượng phải thu
  status: AgreementReceiptStatus; // Sử dụng AgreementReceiptStatus enum ở domain layer
  paidDate?: Date; // Ngày đã thu tiền
  createdAt: Date; // Thời gian thêm
  updatedAt: Date; // Thời gian sửa
  deletedAt?: Date; // Thời gian xóa (nếu có)
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity AgreementReceipt
  // ─────────────────────────────────────────────
  constructor(params?: Partial<AgreementReceipt>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<AgreementReceipt>): AgreementReceipt {
    return new AgreementReceipt(params);
  }

  update(params: Partial<AgreementReceipt>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
