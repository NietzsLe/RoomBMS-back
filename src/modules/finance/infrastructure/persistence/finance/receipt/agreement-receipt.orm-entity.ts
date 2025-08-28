import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { AgreementReceiptStatus } from '../../../../domain/finance.enum';
import { DepositAgreementAccountingOrmEntity } from '../../leasing/deposit-agreement-accounting.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: AgreementReceipt              │
│      Bảng: agreement-payment               │
│      Mục đích: Đại diện tiền phải thu về   │
│      công ty trên hợp đồng                 │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'agreement-receipt' })
export class AgreementReceiptOrmEntity {
  // ──────────────── PRIMARY KEY ────────────────
  @PrimaryGeneratedColumn()
  id: number; // Khóa chính

  // ──────────────── AMOUNT ────────────────
  @Column('decimal', { precision: 15, scale: 2 })
  amount: number; // Lượng phải thu

  // ──────────────── STATUS ENUM ────────────────
  @Column({
    type: 'enum',
    enum: AgreementReceiptStatus,
    default: AgreementReceiptStatus.NOT_COLLECTED,
  })
  status: AgreementReceiptStatus;

  // ──────────────── COLLECTED AT ────────────────
  @Column({ type: 'timestamp', nullable: true })
  collectedAt?: Date; // Ngày đã thu tiền

  // ──────────────── TIMESTAMPS ────────────────
  @CreateDateColumn()
  createdAt: Date; // Thời gian thêm

  @UpdateDateColumn()
  updatedAt: Date; // Thời gian sửa

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // Thời gian xóa (nếu có)

  // ──────────────── DEPOSIT AGREEMENT ACCOUNTING RELATION ────────────────
  /**
   * Quan hệ 1-1: Một AgreementReceipt liên kết với một DepositAgreementAccountingOrmEntity
   */
  @OneToOne(() => DepositAgreementAccountingOrmEntity, { nullable: false })
  @JoinColumn({ name: 'depositAgreementAccountingID' })
  depositAgreementAccounting: DepositAgreementAccountingOrmEntity;
}

/*
──────────────────────────────────────────────
  SYMBOL DEPENDENCIES
──────────────────────────────────────────────
- DepositAgreementAccountingOrmEntity: Entity đại diện cho bảng deposit-agreement-accounting, liên kết 1-1 với AgreementReceipt.
- AgreementReceiptStatus: Enum trạng thái đã thu, chưa thu, bị hủy (domain/finance.enum).
──────────────────────────────────────────────
*/
