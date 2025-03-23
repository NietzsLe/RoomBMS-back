import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProvinceUnit } from './provinceUnit.model';
import { WardUnit } from './wardUnit.model';
import { Expose } from '@nestjs/class-transformer';
import { AdministrativeUnit } from './administrativeUnit.model';

@Entity('district_unit') // Tên bảng trong cơ sở dữ liệu
export class DistrictUnit {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  districtCode: number; // Mã tỉnh
  @Column()
  @Expose({ groups: ['NOT-TO-DTO'] })
  provinceCode: number;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  districtName: string; // Tên tỉnh
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Thời điểm cập nhật thông tin phường
  @OneToMany(() => WardUnit, (ward) => ward.district, {})
  @Expose({ groups: ['NOT-TO-DTO'] })
  wards: WardUnit[];
  @ManyToOne(() => ProvinceUnit, (province) => province.districts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provinceCode', referencedColumnName: 'provinceCode' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  province: ProvinceUnit;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @OneToMany(() => AdministrativeUnit, (unit) => unit.district, {})
  administrativeUnit: AdministrativeUnit;
}
