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
import { EmployeeOrmEntity } from '../organization/employee.orm-entity';
import { AdvanceStatus } from '../../../domain/finance.enum';
import { PerformancePeriodOrmEntity } from '../performance-period.orm-entity';

/*
┌────────────────────────────────────────────┐
│  ENTITY: AdvanceOrmEntity                  │
│  Mục đích: Đại diện cho sự tạm ứng của nhân viên │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'advance' })
export class AdvanceOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'employeeID' })
  employee: EmployeeOrmEntity;

  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'performancePeriodID' })
  performancePeriod: PerformancePeriodOrmEntity;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: AdvanceStatus })
  status: AdvanceStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deductedAt?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
