import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProvinceUnit } from './provinceUnit.model';
import { DistrictUnit } from './districtUnit.model';
import { WardUnit } from './wardUnit.model';
import { Expose } from '@nestjs/class-transformer';

@Entity('administrative_unit') // Tên bảng trong cơ sở dữ liệu
export class AdministrativeUnit {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  wardCode: number; // Mã phường
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  provinceCode: number; // Mã tỉnh
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  districtCode: number; // Mã quận
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  wardName: string; // Tên phường
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  provinceName: string; // Tên tỉnh
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  districtName: string; // Tên quận
  @DeleteDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  deletedAt: Date | null; // Xem phường đã xóa chưa
  @CreateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date; // Thời điểm tạo phường
  @UpdateDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date; // Thời điểm cập nhật thông tin phường
  @ManyToOne(() => ProvinceUnit, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'provinceCode' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  province: ProvinceUnit;
  @ManyToOne(() => DistrictUnit, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'districtCode' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  district: DistrictUnit;
  @OneToOne(() => WardUnit, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wardCode' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  ward: WardUnit;
}
