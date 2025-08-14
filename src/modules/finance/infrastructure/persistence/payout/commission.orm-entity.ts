import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { DepositAgreementAccountingOrmEntity } from '../leasing/deposit-agreement-accounting.orm-entity';
import { EmployeeOrmEntity } from '../organization/employee.orm-entity';
import { CommissionPayoutOrmEntity } from './commission-payout.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: CommissionOrmEntity                    │
│      Bảng: commission                      │
│      Mục đích: Đại diện hoa hồng user      │
│      nhận trên hợp đồng cọc                │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'commission' })
export class CommissionOrmEntity {
  // ──────────────── PRIMARY KEY ────────────────
  @PrimaryGeneratedColumn()
  id: number; // Khóa chính

  // ──────────────── TIMESTAMPS ────────────────
  @CreateDateColumn()
  createdAt: Date; // Thời gian tạo

  @UpdateDateColumn()
  updatedAt: Date; // Thời gian sửa

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // Thời gian xóa (nếu có)

  // ──────────────── USER RELATION ────────────────
  /**
   * Quan hệ 1-n: Một employee có thể nhận nhiều commission
   */
  @ManyToOne(() => EmployeeOrmEntity, { nullable: false })
  @JoinColumn({ name: 'employeeID' })
  employee: EmployeeOrmEntity;

  // ──────────────── DEPOSIT AGREEMENT ACCOUNTING RELATION ────────────────
  /**
   * Quan hệ 1-1: Một commission liên kết với một DepositAgreementAccountingOrmEntity
   */
  @OneToOne(() => DepositAgreementAccountingOrmEntity, { nullable: false })
  @JoinColumn({ name: 'depositAgreementAccountingID' })
  depositAgreementAccounting: DepositAgreementAccountingOrmEntity;

  // ──────────────── DESCRIPTION ────────────────
  /**
   * Mô tả chi tiết về hoa hồng
   */
  description: string;

  /**
   * Quan hệ ngược: Một commission thuộc về một commissionPayout
   */
  @ManyToOne(
    () => CommissionPayoutOrmEntity,
    (commissionPayout) => commissionPayout.commissions,
    { nullable: false },
  )
  @JoinColumn({ name: 'commissionPayoutID' })
  commissionPayout: CommissionPayoutOrmEntity;
}

/*
──────────────────────────────────────────────
  SYMBOL DEPENDENCIES
──────────────────────────────────────────────
- User: Entity đại diện cho người dùng, có thuộc tính commissions (OneToMany).
- DepositAgreementAccountingOrmEntity: Entity đại diện cho bảng deposit-agreement-accounting, liên kết 1-1 với CommissionOrmEntity.
──────────────────────────────────────────────
*/
