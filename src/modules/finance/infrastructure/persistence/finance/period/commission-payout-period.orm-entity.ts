import { CommissionPayoutPeriodType } from 'src/modules/finance/domain/finance.enum';
import { Entity, PrimaryColumn, Column } from 'typeorm';

/*
┌────────────────────────────────────────────┐
│      ENTITY: CommissionOrmEntityPayoutPeriod        │
│      Bảng: commission-payout-period        │
│      Mục đích: Đại diện kỳ trả hoa hồng    │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'commission-payout-period' })
export class CommissionPayoutPeriodOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  code: string; // Ví dụ: '10-12-2025', '20-12-2025'

  /**
   * Loại kỳ trả hoa hồng/kỳ chi trả:
   * - PAYROLL: Trả lương cuối tháng
   * - SALE_COMMISSION: Trả hoa hồng sale
   * - COLLABORATOR_COMMISSION: Trả hoa hồng cộng tác viên
   */
  @Column({
    type: 'enum',
    enum: CommissionPayoutPeriodType,
    default: CommissionPayoutPeriodType.SALE_COMMISSION,
  })
  type: CommissionPayoutPeriodType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;
}
