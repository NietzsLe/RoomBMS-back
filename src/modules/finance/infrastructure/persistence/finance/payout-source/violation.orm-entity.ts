import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { EmployeeOrmEntity } from '../../organization/employee.orm-entity';
import { PerformancePeriodOrmEntity } from '../period/performance-period.orm-entity';
import { AccruedItemOrmEntity } from '../payout/accrued-item.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: ViolationOrmEntity                     │
│      Bảng: violation                       │
│      Mục đích: Đại diện hành vi vi phạm    │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'violation' })
export class ViolationOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number; // Lượng tiền bị phạt

  @Column({ type: 'varchar', length: 255 })
  description: string; // Mô tả hành vi vi phạm

  /**
   * Quan hệ 1-n: Một employee có thể có nhiều violation
   */
  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'employeeID' })
  employee: EmployeeOrmEntity;

  /**
   * Quan hệ: Một violation thuộc về một performance period
   */
  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'performancePeriodID' })
  performancePeriod: PerformancePeriodOrmEntity;

  /**
   * Liên kết đến accrued item (khoản chi/khấu trừ)
   */
  @ManyToOne(() => AccruedItemOrmEntity, { nullable: true })
  @JoinColumn({ name: 'accruedItemID' })
  accruedItem?: AccruedItemOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
