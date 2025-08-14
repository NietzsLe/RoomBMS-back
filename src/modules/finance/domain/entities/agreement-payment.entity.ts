import { AgreementPaymentStatus } from '../finance.enum';

export class AgreementPayment {
  id: number; // Khóa chính
  amount: number; // Lượng phải thu
  status: AgreementPaymentStatus; // Sử dụng AgreementPaymentStatus enum ở domain layer
  paidDate?: Date; // Ngày đã thu tiền
  createdAt: Date; // Thời gian thêm
  updatedAt: Date; // Thời gian sửa
  deletedAt?: Date; // Thời gian xóa (nếu có)
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity AgreementPayment
  // ─────────────────────────────────────────────
  constructor(params?: Partial<AgreementPayment>) {
    if (params) {
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(params: Partial<AgreementPayment>): AgreementPayment {
    return new AgreementPayment(params);
  }

  update(params: Partial<AgreementPayment>): void {
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
