import { PerformancePeriodType } from '../finance.enum';

export class PerformancePeriod {
  code: string; // Mã kỳ đánh giá
  type: PerformancePeriodType; // Sử dụng PerformancePeriodType enum ở domain layer
  startDate: Date;
  endDate: Date;

  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity PerformancePeriod
  // ─────────────────────────────────────────────
  constructor(params?: Partial<PerformancePeriod>) {
    if (params) {
      Object.assign(this, params);
      this.startDate = params.startDate ?? new Date();
      this.endDate = params.endDate ?? new Date();
    }
  }

  static create(params: Partial<PerformancePeriod>): PerformancePeriod {
    return new PerformancePeriod(params);
  }

  update(params: Partial<PerformancePeriod>): void {
    Object.assign(this, params);
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần

  // ─────────────────────────────────────────────
  // ▶ Static method: Sinh code theo type và format theo múi giờ Việt Nam
  // ─────────────────────────────────────────────
  static generateCodeByType(type: PerformancePeriodType, date: Date): string {
    // 💡 NOTE(GitHub Copilot): Format code theo type và timezone Asia/Ho_Chi_Minh
    const vnDate = new Date(
      date.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    );
    const year = vnDate.getFullYear();
    if (type === PerformancePeriodType.MONTH) {
      const month = String(vnDate.getMonth() + 1).padStart(2, '0');
      return `${month}-${year}`;
    }
    if (type === PerformancePeriodType.WEEK) {
      // Tính số tuần trong năm theo ISO week, lấy theo giờ Việt Nam
      // Tuần bắt đầu từ thứ 2
      const getWeekNumber = (d: Date): number => {
        // Copy date để không ảnh hưởng đến gốc
        const date = new Date(
          Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()),
        );
        // Đặt về thứ 2
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil(
          ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
        );
      };
      const week = getWeekNumber(vnDate);
      return `W${week}-${year}`;
    }
    // 🐞 FIXME(user): Type không hỗ trợ
    return '';
  }
}
