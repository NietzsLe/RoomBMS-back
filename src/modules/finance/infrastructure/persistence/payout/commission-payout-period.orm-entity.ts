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

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;
}
