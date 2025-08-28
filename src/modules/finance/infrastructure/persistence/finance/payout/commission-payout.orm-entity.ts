import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { CommissionPayoutStatus } from '../../../../domain/finance.enum';
import { CommissionPayoutPeriodOrmEntity } from '../period/commission-payout-period.orm-entity';
import { EmployeeOrmEntity } from '../../organization/employee.orm-entity';
import { PerformancePeriodOrmEntity } from '../period/performance-period.orm-entity';
import { PayoutEntryOrmEntity } from './payout-entry.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: CommissionOrmEntityPayout              │
│      Bảng: commission-payout               │
│      Mục đích: Đại diện chi trả hoa hồng   │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'commission-payout' })
export class CommissionPayoutOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Trạng thái đã thu, chưa thu, bị hủy
   */
  @Column({
    type: 'enum',
    enum: CommissionPayoutStatus,
    default: CommissionPayoutStatus.UNPAID,
  })
  status: CommissionPayoutStatus;

  /**
   * Quan hệ 1-n: Một employee có thể có nhiều commission-payout
   */
  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'employeeID' })
  employee: EmployeeOrmEntity;

  /**
   * Quan hệ: Một commission-payout thuộc về một performance period
   */
  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'performancePeriodID' })
  performancePeriod: PerformancePeriodOrmEntity;

  /**
   * Quan hệ n-1: Một commission-payout thuộc về một kỳ tính
   */
  @ManyToOne(() => CommissionPayoutPeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'periodCode' })
  commissionPayoutPeriod: CommissionPayoutPeriodOrmEntity;

  /**
   * Quan hệ 1-n: Một commission-payout có thể có nhiều payout entry
   */
  @OneToMany(() => PayoutEntryOrmEntity, (entry) => entry.commissionPayout)
  payoutEntries: PayoutEntryOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;
}
