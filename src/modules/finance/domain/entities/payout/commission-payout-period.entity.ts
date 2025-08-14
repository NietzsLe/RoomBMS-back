export class CommissionPayoutPeriod {
  code: string; // Mã kỳ trả hoa hồng
  startDate: Date;
  endDate: Date;

  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity CommissionPayoutPeriod
  // ─────────────────────────────────────────────
  constructor(params?: Partial<CommissionPayoutPeriod>) {
    if (params) {
      Object.assign(this, params);
      this.startDate = params.startDate ?? new Date();
      this.endDate = params.endDate ?? new Date();
    }
  }

  static create(
    params: Partial<CommissionPayoutPeriod>,
  ): CommissionPayoutPeriod {
    return new CommissionPayoutPeriod(params);
  }

  update(params: Partial<CommissionPayoutPeriod>): void {
    Object.assign(this, params);
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần

  // ─────────────────────────────────────────────
  // ▶ Static method: Tính code từ Date theo định dạng dd-MM-yyyy
  // ─────────────────────────────────────────────
  static generateCodeFromDate(date: Date): string {
    // 💡 NOTE(GitHub Copilot): Format ngày tháng theo giờ Việt Nam (Asia/Ho_Chi_Minh)
    const vnString = date.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // vnString dạng "10/07/2025"
    const [day, month, year] = vnString.split('/');
    return `${day}-${month}-${year}`;
  }
}
