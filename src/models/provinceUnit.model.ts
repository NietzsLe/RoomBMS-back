import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { DistrictUnit } from './districtUnit.model';
import { Expose } from '@nestjs/class-transformer';
import { AdministrativeUnit } from './administrativeUnit.model';

@Entity('province_unit') // Tên bảng trong cơ sở dữ liệu
export class ProvinceUnit {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  provinceCode: number; // Mã tỉnh
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  provinceName: string; // Tên tỉnh
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null; // Thời điểm cập nhật thông tin phường
  @Expose({ groups: ['NOT-TO-DTO'] })
  @OneToMany(() => DistrictUnit, (district) => district.province, {})
  districts: DistrictUnit[];
  @Expose({ groups: ['NOT-TO-DTO'] })
  @OneToMany(() => AdministrativeUnit, (unit) => unit.province, {})
  administrativeUnit: AdministrativeUnit;
}
