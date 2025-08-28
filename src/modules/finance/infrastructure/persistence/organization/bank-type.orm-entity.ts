import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'bank-type' })
export class BankTypeOrmEntity {
  @PrimaryColumn({ type: 'varchar', length: 32 })
  code: string; // Mã ngân hàng

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên ngân hàng
}
