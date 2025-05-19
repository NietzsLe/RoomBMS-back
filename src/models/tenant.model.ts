import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';

import { DepositAgreement } from './depositAgreement.model'; // Đảm bảo đường dẫn đúng đến file DepositAgreement

import { Expose, Transform, Type } from '@nestjs/class-transformer';
import { Appointment } from './appointment.model';
import { User } from './user.model';

@Entity('tenant') // Tên bảng trong cơ sở dữ liệu
export class Tenant {
  @PrimaryGeneratedColumn()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  tenantID: number; // Khóa chính, tự động tăng

  @Column()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  name: string; // Tên người thuê

  @Column()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  phoneNumber: string; // Số điện thoại

  @DeleteDateColumn({ nullable: true })
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Xem người thuê đã xóa chưa

  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo người thuê

  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thông tin người thuê

  @OneToMany(() => Appointment, (appointment) => appointment.tenant)
  @Expose({ groups: ['NOT-TO-DTO'] })
  appointments: Appointment[]; // Mối quan hệ với Appointment

  @OneToMany(
    () => DepositAgreement,
    (depositAgreement) => depositAgreement.tenant,
  )
  @Expose({ groups: ['NOT-TO-DTO'] })
  depositAgreements: DepositAgreement[]; // Mối quan hệ với DepositAgreement

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'managerID' })
  @Type(() => User)
  @Expose({ name: 'managerID', groups: ['TO-DTO'] })
  @Transform(({ value }: { value: User }) => value?.username, {
    toPlainOnly: true,
  })
  manager: User | null;
}
