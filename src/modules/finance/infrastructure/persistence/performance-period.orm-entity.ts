import { Entity, PrimaryColumn, Column } from 'typeorm';
import { PerformancePeriodType } from '../../domain/finance.enum';

/*
┌────────────────────────────────────────────┐
│      ENTITY: PerformancePeriodOrmEntity             │
│      Bảng: performance-period              │
│      Mục đích: Đại diện kỳ đánh giá        │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'performance-period' })
export class PerformancePeriodOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  code: string; // Ví dụ: '12-2025', 'W14-2025'

  /**
   * Kiểu kỳ đánh giá: MONTH hoặc WEEK
   */
  @Column({
    type: 'enum',
    enum: PerformancePeriodType,
    default: PerformancePeriodType.MONTH,
  })
  type: PerformancePeriodType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;
}
