import {
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

export class ReadTenantDTO {
  @IsNumber() tenantID: number; // Khóa chính, tự động tăng

  @IsString() name: string; // Tên người thuê

  @ApiProperty({})
  phoneNumber?: string; // Số điện thoại

  @IsDate() deletedAt: Date; // Xem người thuê đã xóa chưa

  @IsDate() createAt: Date; // Thời điểm tạo người thuê

  @IsDate() updateAt: Date; // Thời điểm cập nhật thông tin người thuê

  @ApiProperty({})
  managerID: string;
}

export class CreateTenantDTO {
  @IsString() @ApiProperty({}) name: string; // Tên người thuê

  @IsString() @IsPhoneNumber('VN') @ApiProperty({}) phoneNumber: string; // Số điện thoại
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
