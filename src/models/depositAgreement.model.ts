import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  DeleteDateColumn,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.model'; // Đảm bảo đường dẫn đúng đến file Room
import { Tenant } from './tenant.model'; // Đảm bảo đường dẫn đúng đến file Tenant
import { User } from './user.model';
import { Appointment } from './appointment.model';
import { Expose, Transform, Type } from '@nestjs/class-transformer';
import { AppointmentMapper } from 'src/mappers/appointment.mapper';
import { TenantMapper } from 'src/mappers/tenant.mapper';
import { RoomMapper } from 'src/mappers/room.mapper';
import { DepositAgreementStatus } from './helper';

@Entity('deposit_agreement') // Tên bảng trong cơ sở dữ liệu
export class DepositAgreement {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ['TO-DTO', 'TO-APPOINTMENT-DTO'] })
  depositAgreementID: number; // Khóa chính, tự động tăng

  @Column({ default: '' })
  @Expose({ groups: ['TO-DTO', 'TO-APPOINTMENT-DTO'] })
  name: string; // Khóa chính, tự động tăng

  @Column({ type: 'int' })
  @Expose({ groups: ['TO-DTO'] })
  depositPrice: number; // Tiền đặt cọc

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  deliveredDeposit: number; // Tiền đặt cọc đã giao

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  cancelFee: number; // Tiền đặt cọc đã giao

  @Column({
    default: 'active',
    type: 'enum',
    enum: DepositAgreementStatus,
  })
  @Expose({ groups: ['TO-DTO', 'TO-APPOINTMENT-DTO'] })
  status: DepositAgreementStatus;

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  depositDeliverDate: Date; // Ngày giao tiền đặt cọc

  @Column()
  @Expose({ groups: ['TO-DTO'] })
  agreementDate: Date; // Ngày ký thỏa thuận

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  depositCompleteDate: Date; // Ngày hoàn tất tiền đặt cọc

  @Column({})
  @Expose({ groups: ['TO-DTO'] })
  commissionPer: number;

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  bonus: number;

  @Column()
  @Expose({ groups: ['TO-DTO'] })
  duration: number; // Thời gian thỏa thuận

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  note: string; // Ghi chú

  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Xem thỏa thuận đã xóa chưa

  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo thỏa thuận

  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thỏa thuận

  @Column({ type: 'int' })
  @Expose({ groups: ['TO-DTO'] })
  price: number; // Giá thỏa thuận

  @ManyToOne(() => Room, (room) => room.depositAgreements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Expose({ groups: ['TO-DTO'] })
  @Type(() => Room)
  @Transform(
    ({ value }: { value: Room }) =>
      value ? RoomMapper.EntityToReadForDepositAgreementDTO(value) : undefined,
    {
      toPlainOnly: true,
    },
  )
  @JoinColumn({ name: 'roomID' })
  room: Room | null; // Mối quan hệ với Room

  @OneToOne(() => Appointment, (appointment) => appointment.depositAgreement, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => Appointment)
  @Transform(
    ({ value }: { value: Appointment }) =>
      value
        ? AppointmentMapper.EntityToReadForDepositAgreementDTO(value)
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  @Expose({ groups: ['TO-DTO'] })
  appointment: Appointment; // Mối quan hệ với Appointment

  @ManyToOne(() => Tenant, (tenant) => tenant.depositAgreements, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Expose({ groups: ['TO-DTO'] })
  @Type(() => Tenant)
  @Transform(
    ({ value }: { value: Tenant }) =>
      value
        ? TenantMapper.EntityToReadForDepositAgreementDTO(value)
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  @JoinColumn({ name: 'tenantID' })
  tenant: Tenant | null; // Mối quan hệ với Tenant

  @ManyToOne(() => User, (user) => user.username, {
    nullable: true,
    onDelete: 'SET NULL',
  })
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
