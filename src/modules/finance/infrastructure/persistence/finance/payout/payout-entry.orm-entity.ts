import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { CommissionPayoutOrmEntity } from './commission-payout.orm-entity';
import { AccruedItemOrmEntity } from './accrued-item.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: PayoutEntryOrmEntity          │
│      Bảng: payout_entry                    │
│      Mục đích: Phân bổ amount của accrued item vào payout cụ thể │
└────────────────────────────────────────────┘
*/

@Entity({ name: 'payout_entry' })
export class PayoutEntryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Quan hệ: thuộc về một commission payout
   */
  @ManyToOne(() => CommissionPayoutOrmEntity, { nullable: false })
  @JoinColumn({ name: 'commissionPayoutID' })
  commissionPayout: CommissionPayoutOrmEntity;

  /**
   * Quan hệ: từ một accrued item cụ thể
   */
  @ManyToOne(() => AccruedItemOrmEntity, { nullable: false })
  @JoinColumn({ name: 'accruedItemID' })
  accruedItem: AccruedItemOrmEntity;

  /**
   * Số tiền phân bổ từ accrued item vào payout này
   */
  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;
}
