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
import { CommissionPayoutStatus } from '../../../domain/finance.enum';
import { CommissionPayoutPeriodOrmEntity } from './commission-payout-period.orm-entity';
import { CommissionOrmEntity } from './commission.orm-entity';
import { ViolationOrmEntity } from './violation.orm-entity';
import { EmployeeOrmEntity } from '../organization/employee.orm-entity';
import { PerformancePeriodOrmEntity } from '../performance-period.orm-entity';

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
   * Quan hệ 1-n: Một commission-payout có thể có nhiều violation
   */
  @OneToMany(
    () => ViolationOrmEntity,
    (violation) => violation.commissionPayout,
  )
  violations: ViolationOrmEntity[];

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
   * Quan hệ 1-n: Một commission-payout có thể có nhiều commission
   */
  @OneToMany(
    () => CommissionOrmEntity,
    (commission) => commission.commissionPayout,
  )
  commissions: CommissionOrmEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paidAt?: Date;
}
