import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import {
  AccruedItemCategory,
  AccruedItemStatus,
  AccruedItemSourceType,
} from '../../../../domain/finance.enum';
import { AdvanceSalaryOrmEntity } from '../payout-source/advance-salary.orm-entity';
import { PayoutEntryOrmEntity } from './payout-entry.orm-entity';
import { ViolationOrmEntity } from '../payout-source/violation.orm-entity';
import { CommissionOrmEntity } from '../payout-source/commission.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: AccruedItemOrmEntity          │
│      Bảng: accrued_item                    │
│      Mục đích: Đại diện khoản chi/khấu trừ │
│      Nguồn: commission, violation, advance salary │
└────────────────────────────────────────────┘
*/

@Entity({ name: 'accrued_item' })
export class AccruedItemOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Phân loại: chi (EXPENSE) hoặc khấu trừ (DEDUCTION)
   */
  @Column({
    type: 'enum',
    enum: AccruedItemCategory,
  })
  category: AccruedItemCategory;
  /**
   * Trạng thái: PENDING (chờ phân bổ), ALLOCATED (đã phân bổ đủ), SETTLED (đã quyết toán đủ)
   */
  @Column({
    type: 'enum',
    enum: AccruedItemStatus,
    default: AccruedItemStatus.PENDING,
  })
  status: AccruedItemStatus;

  /**
   * Nguồn gốc: commission, violation, advance salary
   */
  @Column({
    type: 'enum',
    enum: AccruedItemSourceType,
  })
  sourceType: AccruedItemSourceType;

  /**
   * Số tiền cần chi hoặc khấu trừ
   */
  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  /**
   * Tham chiếu nguồn gốc: 1 trong 3 loại (nullable)
   */
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'commissionId' })
  commission?: CommissionOrmEntity;

  @OneToOne(() => ViolationOrmEntity, { nullable: true })
  @JoinColumn({ name: 'violationId' })
  violation?: ViolationOrmEntity;

  @OneToOne(() => AdvanceSalaryOrmEntity, { nullable: true })
  @JoinColumn({ name: 'advanceSalaryId' })
  advanceSalary?: AdvanceSalaryOrmEntity;

  /**
   * Quan hệ 1-n: Một accrued item có thể có nhiều payout entry
   */
  @OneToMany(() => PayoutEntryOrmEntity, (entry) => entry.accruedItem)
  payoutEntries: PayoutEntryOrmEntity[];
}
