import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './room.model'; // Đảm bảo đường dẫn đúng đến file Room

import { Expose, Transform, Type } from '@nestjs/class-transformer';
import { AdministrativeUnit } from './administrativeUnit.model';
import { User } from './user.model';

@Entity('house') // Tên bảng trong cơ sở dữ liệu
export class House {
  @PrimaryGeneratedColumn()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  houseID: number; // Khóa chính, tự động tăng

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  room_price: number;

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  room_depositPrice: string;

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  room_commissionPer: string;

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  room_agreementDuration: string;

  @Column({ type: 'json', nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  room_unitPrice: {
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
  room_additionInfo: {
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
    note?: string;
    electricBike?: boolean;
    attic?: boolean;
    fridge?: boolean;
  }; // Thông tin bổ sung 2

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO', 'TO-ROOM-DTO', 'TO-APPOINTMENT-DTO'] })
  mapLink: string;
  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO', 'TO-ROOM-DTO', 'TO-APPOINTMENT-DTO'] })
  zaloLink: string;

  @Column()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  name: string; // Tên chủ sở hữu

  @Column()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  ownerName: string; // Tên chủ sở hữu

  @Column()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  ownerPhone: string; // Số điện thoại của chủ sở hữu

  @Column()
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  addressDetail: string; // Thông tin chi tiết về địa chỉ

  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO', 'TO-ROOM-DTO', 'TO-APPOINTMENT-DTO'] })
  note: string; // Thông tin chi tiết về địa chỉ

  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Xem nhà đã xóa chưa

  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo nhà

  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thông tin nhà

  @OneToMany(() => Room, (room) => room.house)
  @Expose({ groups: ['TO-DTO'] })
  rooms: Room[]; // Mối quan hệ với Room

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
  administrativeUnit: AdministrativeUnit | null; // Mối quan hệ với AdministrativeUnit

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

  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  administrativeUnitID() {
    if (this.administrativeUnit)
      return [
        this.administrativeUnit.provinceCode,
        this.administrativeUnit.districtCode,
        this.administrativeUnit.wardCode,
      ];
    return undefined;
  }
  @Expose({
    groups: [
      'TO-DTO',
      'TO-ROOM-DTO',
      'TO-APPOINTMENT-DTO',
      'TO-DEPOSITAGREEMENT-DTO',
    ],
  })
  administrativeUnitName() {
    if (this.administrativeUnit)
      return [
        this.administrativeUnit.provinceName,
        this.administrativeUnit.districtName,
        this.administrativeUnit.wardName,
      ];
    return undefined;
  }
}
