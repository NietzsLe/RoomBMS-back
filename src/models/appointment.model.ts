import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from './user.model';
import { Room } from './room.model';
import { DepositAgreement } from './depositAgreement.model';
import { Tenant } from './tenant.model';
import { Expose, Transform, Type } from '@nestjs/class-transformer';

@Entity('appointment') // Tên bảng trong cơ sở dữ liệu
export class Appointment {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ['TO-DTO'] })
  appointmentID: number; // Khóa chính, tự động tăng

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  consultingPrice: number; // Giá tư vấn

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  noPeople: number; // Số lượng người

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  noVehicles: number; // Số lượng phương tiện

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  pet: boolean; // Có mang theo thú cưng không

  @Column({ type: 'text', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  note: string; // Ghi chú

  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null;

  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date;

  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo cuộc hẹn

  @Column()
  @Expose({ groups: ['TO-DTO'] })
  appointmentTime: Date; // Thời gian cuộc hẹn

  @Column()
  @Expose({ groups: ['TO-DTO'] })
  address: string; // Thời gian cuộc hẹn

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  failReason: string;

  @Column({ default: 'not-yet-received' })
  @Expose({ groups: ['TO-DTO'] })
  status: string;

  @ManyToOne(() => User, (user) => user.takenOverAppointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'takenOverUsername' })
  @Expose({ name: 'takenOverUsername', groups: ['TO-DTO'] })
  takenOverUser: User;
  @ManyToOne(() => User, (user) => user.madeAppointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'madeUsername' })
  @Expose({ name: 'madeUsername', groups: ['TO-DTO'] })
  madeUser: User;

  @ManyToOne(() => Room, (room) => room.appointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => Room)
  @Transform(({ value }: { value: Room }) => value?.roomID, {
    toPlainOnly: true,
  })
  @Expose({ name: 'roomID', groups: ['TO-DTO'] })
  @JoinColumn({ name: 'roomID' })
  room: Room; // Mối quan hệ với Room

  @OneToOne(
    () => DepositAgreement,
    (depositAgreement) => depositAgreement.appointment,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @Type(() => DepositAgreement)
  @Transform(
    ({ value }: { value: DepositAgreement }) => value?.depositAgreementID,
    {
      toPlainOnly: true,
    },
  )
  @Expose({ name: 'depositAgreementID', groups: ['NOT-TO-DTO'] })
  @JoinColumn({ name: 'depositAgreementID' })
  depositAgreement: DepositAgreement; // Mối quan hệ với DepositAgreement

  @ManyToOne(() => Tenant, (tenant) => tenant.appointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => Tenant)
  @Transform(({ value }: { value: Tenant }) => value?.tenantID, {
    toPlainOnly: true,
  })
  @Expose({ name: 'tenantID', groups: ['TO-DTO'] })
  @JoinColumn({ name: 'tenantID' })
  tenant: Tenant; // Mối quan hệ với Tenant

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
  manager: User;
}
