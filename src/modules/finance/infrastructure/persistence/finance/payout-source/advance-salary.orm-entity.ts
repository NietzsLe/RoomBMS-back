import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeOrmEntity } from '../../organization/employee.orm-entity';
import { AdvanceSalaryStatus } from '../../../../domain/finance.enum';
import { AccruedItemOrmEntity } from '../payout/accrued-item.orm-entity';

@Entity('advance_salary')
export class AdvanceSalaryOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  employee: EmployeeOrmEntity;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: AdvanceSalaryStatus,
    default: AdvanceSalaryStatus.PENDING,
  })
  status: AdvanceSalaryStatus;

  /**
   * Liên kết đến accrued item đại diện cho khoản tạm ứng
   */
  @OneToOne(() => AccruedItemOrmEntity, { nullable: true })
  @JoinColumn({ name: 'accruedAdvanceItemID' })
  accruedAdvanceItem?: AccruedItemOrmEntity;

  /**
   * Liên kết đến accrued item đại diện cho khoản khấu trừ
   */
  @OneToOne(() => AccruedItemOrmEntity, { nullable: true })
  @JoinColumn({ name: 'accruedDeductionItemID' })
  accruedDeductionItem?: AccruedItemOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
