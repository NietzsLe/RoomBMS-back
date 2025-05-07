import { Exclude, Expose, Transform } from '@nestjs/class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdministrativeUnit } from 'src/models/administrativeUnit.model';
import { User } from 'src/models/user.model';

export class BaseTenantDTO {
  @IsNumber() @ApiProperty({}) @Expose() tenantID: number; // Khóa chính, tự động tăng

  @IsString() @ApiProperty({}) @Expose() name: string; // Tên người thuê

  @IsString()
  @IsPhoneNumber('VN')
  @ApiProperty({})
  @Expose()
  phoneNumber: string; // Số điện thoại

  @IsString() @ApiProperty({}) @Expose() addressDetail: string; // Thông tin chi tiết về địa chỉ

  @IsDate() @ApiProperty({}) @Expose() deletedAt: Date; // Xem người thuê đã xóa chưa

  @IsDate() @ApiProperty({}) @Expose() createAt: Date; // Thời điểm tạo người thuê

  @IsDate() @ApiProperty({}) @Expose() updateAt: Date; // Thời điểm cập nhật thông tin người thuê

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
  @Expose({ name: 'administrativeUnit', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number[] }) => {
      const obj = new AdministrativeUnit();
      obj.provinceCode = value[0];
      obj.districtCode = value[1];
      obj.wardCode = value[2];
      return obj;
    },
    { toPlainOnly: true },
  )
  administrativeUnitID: number[]; // Mối quan hệ với administrativeUnit

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String], minItems: 3, maxItems: 3 })
  @Exclude({ toPlainOnly: true })
  administrativeUnitName: string[];

  @IsString()
  @ApiProperty({})
  @Expose({ name: 'manager', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  managerID: string;
}

export class CreateTenantDTO {
  @IsString() @ApiProperty({}) name: string; // Tên người thuê

  @IsString() @IsPhoneNumber('VN') @ApiProperty({}) phoneNumber: string; // Số điện thoại

  @IsString() @ApiProperty({}) @IsOptional() addressDetail?: string; // Thông tin chi tiết về địa chỉ

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
  @IsOptional()
  @Expose({ name: 'administrativeUnit', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number[] }) => {
      if (value) {
        const obj = new AdministrativeUnit();
        obj.provinceCode = value[0];
        obj.districtCode = value[1];
        obj.wardCode = value[2];
        return obj;
      }
      return null;
    },
    { toPlainOnly: true },
  )
  administrativeUnitID?: number[]; // Mối quan hệ với administrativeUnit
}

export class UpdateTenantDTO {
  @IsNumber() @ApiProperty({}) tenantID: number; // Khóa chính, tự động tăng

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  name?: string; // Tên người thuê

  @IsString()
  @IsPhoneNumber('VN')
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  phoneNumber?: string; // Số điện thoại

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  addressDetail?: string; // Thông tin chi tiết về địa chỉ

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
  @IsOptional()
  @Expose({ name: 'administrativeUnit', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number[] }) => {
      if (value) {
        const obj = new AdministrativeUnit();
        obj.provinceCode = value[2];
        obj.districtCode = value[1];
        obj.wardCode = value[0];
        return obj;
      }
      return null;
    },
    { toPlainOnly: true },
  )
  administrativeUnitID?: number[]; // Mối quan hệ với administrativeUnit

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
}

export class HardDeleteAndRecoverTenantDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  tenantIDs: number[];
}

export class CreateResponseTenantDTO {
  @IsNumber()
  @ApiProperty()
  tenantID: number;
}

export class AutocompleteTenantDTO {
  @ApiProperty()
  @IsNumber()
  tenantID: number;
  @ApiProperty()
  @IsString()
  name: string;
}

export class MaxResponseTenantDTO {
  @IsNumber()
  @ApiProperty()
  tenantID: number;
}
