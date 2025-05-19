import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';

import { DepositAgreement } from './depositAgreement.model'; // Đảm bảo đường dẫn đúng đến file DepositAgreement

import { Expose, Transform, Type } from '@nestjs/class-transformer';
import { House } from './house.model';
import { Appointment } from './appointment.model';
import { Image } from './image.model';
import { User } from './user.model';
import { AdministrativeUnit } from './administrativeUnit.model';
import { HouseMapper } from 'src/mappers/house.mapper';

@Entity('room') // Tên bảng trong cơ sở dữ liệu
export class Room {
  @PrimaryGeneratedColumn()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  roomID: number; // Khóa chính, tự động tăng

  @Column()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  name: string; // Tên phòng

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  price: number; // Giá phòng

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  depositPrice: number; // Tiền đặt cọc

  @Column({ type: 'int', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  commissionPer: number; // Tiền hoa hồng khi bán được phòng này

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  agreementDuration: number; // Thời hạn hợp đồng

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  note: string; // Ghi chú

  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Xem phòng đã xóa chưa

  @Column({ default: false })
  @Expose({ groups: ['TO-DTO'] })
  isHot: boolean; // Phòng hiện tại có đang hot sale không

  @Column({ default: false })
  @Expose({ groups: ['TO-DTO'] })
  isEmpty: boolean; // Phòng hiện tại có trống không

  @Column({ type: 'json', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  unitPrice: {
    management?: number;
    managementUnit?: string;
    other?: number;
    otherUnit?: string;
    card?: number;
    cardUnit?: string;
    electricity?: number;
    electricityUnit?: string;
    water?: number;
    waterUnit?: string;
    internet?: number;
    internetUnit?: string;
    washingMachine?: number;
    washingMachineUnit?: string;
    parking?: number;
    parkingUnit?: string;
  }; // Thông tin về giá cả các dịch vụ

  @Column({ type: 'json', default: {} })
  @Expose({ groups: ['TO-DTO'] })
  additionInfo: {
    moveInTime?: number;
    roomType?: string;
    toilet?: string;
    position?: string;
    gateLock?: string;
    dryingYard?: string;
    activityHours?: string;
    numberOfVehicles?: number;
    parkingSpace?: string; // Có thể là số lượng hoặc mô tả
    area?: string; // Diện tích
    numberOfPeoples?: number;
    deposit?: number;
    depositReplenishmentTime?: number;
    kitchenShelf?: boolean;
    bed?: boolean;
    sharedOwner?: boolean;
    airConditioner?: boolean;
    window?: boolean;
    tv?: boolean;
    dishWasher?: boolean;
    mattress?: boolean;
    elevator?: boolean;
    skylight?: boolean;
    balcony?: boolean;
    washingMachine?: boolean;
    waterHeater?: boolean;
    wardrobe?: boolean;
    security?: boolean;
    pet?: boolean;
    electricBike?: boolean;
    attic?: boolean;
    fridge?: boolean;
  }; // Thông tin bổ sung 2

  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo phòng

  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thông tin phòng

  @OneToMany(() => Appointment, (appointment) => appointment.room)
  @Expose({ groups: ['NOT-TO-DTO'] })
  appointments: Appointment[]; // Mối quan hệ với Appointment

  @OneToMany(
    () => DepositAgreement,
    (depositAgreement) => depositAgreement.room,
  )
  @Expose({ groups: ['NOT-TO-DTO'] })
  depositAgreements: DepositAgreement[]; // Mối quan hệ với DepositAgreement

  @ManyToOne(() => House, (house) => house.rooms, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'houseID' })
  @Expose({
    name: 'house',
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  @Type(() => House)
  @Transform(
    ({ value }: { value: House }) => {
      // console.log('\n@Model: ', HouseMapper.EntityToReadForRoomDTO(value));
      return value ? HouseMapper.EntityToReadForRoomDTO(value) : undefined;
    },
    {
      toPlainOnly: true,
    },
  )
  house: House | null; // Mối quan hệ với House

  @OneToMany(() => Image, (image) => image.room, {})
  @Expose({ name: 'imageNames', groups: ['TO-DTO'] })
  @Type(() => Image)
  @Transform(
    ({ value }: { value: Image[] }) => value?.map((image) => image.imageName),
    {
      toPlainOnly: true,
    },
  )
  images: Image[];

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  primaryImageName: string;

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

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'creatorID' })
  @Type(() => User)
  @Expose({ name: 'creatorID', groups: ['TO-DTO'] })
  @Transform(({ value }: { value: User }) => value?.username, {
    toPlainOnly: true,
  })
  creator: User | null;

  @ManyToOne(() => AdministrativeUnit, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Expose({ groups: ['NOT-TO-DTO'] })
  @JoinColumn([
    { name: 'provinceCode', referencedColumnName: 'provinceCode' },
    { name: 'districtCode', referencedColumnName: 'districtCode' },
    { name: 'wardCode', referencedColumnName: 'wardCode' },
  ])
  administrativeUnit: AdministrativeUnit; // Mối quan hệ với AdministrativeUnit
}
