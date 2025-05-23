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
import { House } from './house.model';
import { UserMapper } from 'src/mappers/user.mapper';
import { RoomMapper } from 'src/mappers/room.mapper';
import { TenantMapper } from 'src/mappers/tenant.mapper';
import { DepositAgreementMapper } from 'src/mappers/depositAgreement.mapper';
import { AppointmentStatus } from './helper';

@Entity('appointment') // Tên bảng trong cơ sở dữ liệu
export class Appointment {
  @PrimaryGeneratedColumn()
  @Expose({ groups: ['TO-DTO', 'TO-DEPOSITAGREEMENT-DTO'] })
  appointmentID: number; // Khóa chính, tự động tăng

  @Column({ default: '' })
  @Expose({ groups: ['TO-DTO', 'TO-DEPOSITAGREEMENT-DTO'] })
  name: string; // Khóa chính, tự động tăng

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  consultingPrice: number; // Giá tư vấn

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  noPeople: number; // Số lượng người

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  noVehicles: number; // Số lượng phương tiện

  @Column({ type: 'text', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  moveInTime: string; // Số lượng phương tiện

  @Column({ default: false })
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

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  failReason: string;

  @Column({
    default: 'not-yet-received',
    type: 'enum',
    enum: AppointmentStatus,
  })
  @Expose({ groups: ['TO-DTO'] })
  status: AppointmentStatus;

  @ManyToOne(() => User, (user) => user.takenOverAppointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'takenOverUsername' })
  @Expose({
    name: 'takenOverUser',
    groups: ['TO-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  @Type(() => User)
  @Transform(
    ({ value }: { value: User }) => {
      // console.log(
      //   '\n@Model: ',
      //   value ? UserMapper.EntityToReadForAppointmentDTO(value) : undefined,
      // );
      return value
        ? UserMapper.EntityToReadForAppointmentDTO(value)
        : undefined;
    },
    {
      toPlainOnly: true,
    },
  )
  takenOverUser: User | null;
  @ManyToOne(() => User, (user) => user.madeAppointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'madeUsername' })
  @Expose({ name: 'madeUser', groups: ['TO-DTO', 'TO-DEPOSITAGREEMENT-DTO'] })
  @Type(() => User)
  @Transform(
    ({ value }: { value: User }) =>
      value ? UserMapper.EntityToReadForAppointmentDTO(value) : undefined,
    {
      toPlainOnly: true,
    },
  )
  madeUser: User | null;

  @ManyToOne(() => Room, (room) => room.appointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => Room)
  @Transform(
    ({ value }: { value: Room }) =>
      value ? RoomMapper.EntityToReadForAppointmentDTO(value) : undefined,
    {
      toPlainOnly: true,
      groups: ['TO-DTO-APPOINTMENT'],
    },
  )
  @Expose({ name: 'room', groups: ['TO-DTO'] })
  @JoinColumn({ name: 'roomID' })
  room: Room | null; // Mối quan hệ với Room

  @ManyToOne(() => House, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => House)
  @Transform(({ value }: { value: House }) => value?.houseID, {
    toPlainOnly: true,
  })
  @Expose({ name: 'houseID', groups: ['NOT-TO-DTO'] })
  @JoinColumn({ name: 'houseID' })
  house: House; // Mối quan hệ với Room

  @OneToOne(
    () => DepositAgreement,
    (depositAgreement) => depositAgreement.appointment,
    { nullable: true, onDelete: 'SET NULL' },
  )
  @Type(() => DepositAgreement)
  @Transform(
    ({ value }: { value: DepositAgreement }) =>
      value
        ? DepositAgreementMapper.EntityToReadForAppointmentDTO(value)
        : undefined,
    {
      toPlainOnly: true,
    },
  )
  @Expose({ name: 'depositAgreement', groups: ['TO-DTO'] })
  @JoinColumn({ name: 'depositAgreementID' })
  depositAgreement: DepositAgreement | null; // Mối quan hệ với DepositAgreement

  @ManyToOne(() => Tenant, (tenant) => tenant.appointments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Type(() => Tenant)
  @Transform(
    ({ value }: { value: Tenant }) =>
      value ? TenantMapper.EntityToReadForAppointmentDTO(value) : undefined,
    {
      toPlainOnly: true,
    },
  )
  @Expose({ name: 'tenant', groups: ['TO-DTO'] })
  @JoinColumn({ name: 'tenantID' })
  tenant: Tenant | null; // Mối quan hệ với Tenant

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
