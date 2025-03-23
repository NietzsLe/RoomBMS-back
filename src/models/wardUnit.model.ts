import {
  Entity,
  Column,
  PrimaryColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { DistrictUnit } from './districtUnit.model';
import { Expose } from '@nestjs/class-transformer';
import { AdministrativeUnit } from './administrativeUnit.model';

@Entity('ward_unit') // Tên bảng trong cơ sở dữ liệu
export class WardUnit {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  wardCode: number; // Mã tỉnh
  @Column()
  @Expose({ groups: ['NOT-TO-DTO'] })
  districtCode: number;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  wardName: string; // Tên tỉnh
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Thời điểm cập nhật thông tin phường
  @ManyToOne(() => DistrictUnit, (district) => district.wards, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'districtCode', referencedColumnName: 'districtCode' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  district: DistrictUnit;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @OneToMany(() => AdministrativeUnit, (unit) => unit.ward, {})
  administrativeUnit: AdministrativeUnit;
}
