import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ManyToOne, JoinColumn } from 'typeorm';
import { BankTypeOrmEntity } from '../bank-type.orm-entity';

@Entity({ name: 'employee-accounting' })
export class EmployeeOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  id: string; // Khóa chính

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên nhân viên

  @Column({ type: 'varchar', length: 64, nullable: true })
  bankAccountNumber?: string; // Số tài khoản ngân hàng

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankAccountName?: string; // Tên tài khoản ngân hàng

  @ManyToOne(() => BankTypeOrmEntity, { nullable: true })
  @JoinColumn({ name: 'bankTypeCode' })
  bankType?: BankTypeOrmEntity; // Loại ngân hàng liên kết (có thể có hoặc không)
}
