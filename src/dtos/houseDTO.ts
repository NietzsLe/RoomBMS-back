import { Exclude, Expose, Transform } from '@nestjs/class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdministrativeUnit } from 'src/models/administrativeUnit.model';
import { User } from 'src/models/user.model';

export class BaseHouseDTO {
  @IsNumber()
  @ApiProperty({})
  @Expose()
  houseID: number; // Khóa chính, tự động tăng
  @IsString()
  @ApiProperty({})
  @Expose()
  name: string; // Tên chủ sở hữu
  @IsString()
  @ApiProperty({})
  @Expose()
  ownerName: string; // Tên chủ sở hữu
  @IsString()
  @ApiProperty({})
  @Expose()
  ownerPhone: string; // Số điện thoại của chủ sở hữu
  @IsString()
  @ApiProperty({})
  @Expose()
  addressDetail: string; // Thông tin chi tiết về địa chỉ
  @IsDate()
  @ApiProperty({})
  @Expose()
  deletedAt: Date; // Xem nhà đã xóa chưa
  @IsDate()
  @ApiProperty({})
  @Expose()
  createAt: Date; // Thời điểm tạo nhà
  @IsDate()
  @ApiProperty({})
  @Expose()
  updateAt: Date; // Thời điểm cập nhật thông tin nhà

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
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

export class CreateHouseDTO {
  @IsString()
  @ApiProperty({})
  ownerName: string; // Tên chủ sở hữu
  @IsString()
  @ApiProperty({})
  name: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  ownerPhone?: string; // Số điện thoại của chủ sở hữu
  @IsString()
  @ApiProperty({})
  addressDetail: string; // Thông tin chi tiết về địa chỉ
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
  administrativeUnitID: number[]; // Mối quan hệ với administrativeUnit
}

export class UpdateHouseDTO {
  @IsNumber()
  @ApiProperty({})
  houseID: number; // Khóa chính, tự động tăng
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string; // Tên chủ sở hữu
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  ownerName?: string; // Tên chủ sở hữu
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  ownerPhone?: string; // Số điện thoại của chủ sở hữu
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
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
}
export class HardDeleteAndRecoverHouseDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  houseIDs: number[];
}
