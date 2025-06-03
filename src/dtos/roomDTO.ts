import { Type } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BaseAdditionInfo, BaseUnitPrice, ReadHouseDTO } from './houseDTO';

export class ReadRoomDTO {
  @ApiProperty({}) roomID: number; // Khóa chính, tự động tăng
  @ApiProperty({}) name: string; // Tên phòng

  @ApiProperty({}) price: number; // Giá phòng

  @ApiProperty({}) depositPrice: number; // Tiền đặt cọc

  @ApiProperty({}) commissionPer: string; // Tiền hoa hồng khi bán được phòng này

  @ApiProperty({})
  agreementDuration: string; // Thời hạn hợp đồng

  @ApiProperty({}) note: string; // Ghi chú

  @ApiProperty({}) deletedAt: Date; // Xem phòng đã xóa chưa

  @ApiProperty({}) isHot: boolean; // Phòng hiện tại có đang hot sale không

  @ApiProperty({}) isEmpty: boolean; // Phòng hiện tại có trống không
  @ApiProperty({ type: BaseUnitPrice })
  unitPrice: BaseUnitPrice;
  @ApiProperty({ type: BaseAdditionInfo })
  additionInfo: BaseAdditionInfo;

  @ApiProperty({}) createAt: Date; // Thời điểm tạo phòng

  @ApiProperty({}) updateAt: Date; // Thời điểm cập nhật thông tin phòng

  @ApiProperty({}) primaryImageName: string;

  @ApiProperty({})
  house: ReadHouseDTO; // Mối quan hệ với House

  @ApiProperty({ type: [String] })
  imageNames: string[];

  @ApiProperty({})
  managerID: string;
}
export class CreateRoomDTO {
  @IsString() @ApiProperty({}) name: string; // Tên phòng

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) price?: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositPrice?: number; // Tiền đặt cọc

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  commissionPer?: string; // Tiền hoa hồng khi bán được phòng này

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  agreementDuration?: string; // Thời hạn hợp đồng

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú

  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  isHot?: boolean; // Phòng hiện tại có đang hot sale không

  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  isEmpty?: boolean; // Phòng hiện tại có trống không
  @ValidateNested()
  @IsOptional()
  @Type(() => BaseUnitPrice)
  @ApiProperty({ type: BaseUnitPrice, required: false })
  unitPrice?: BaseUnitPrice;
  @ValidateNested()
  @Type(() => BaseAdditionInfo)
  @ApiProperty({ type: BaseAdditionInfo })
  @IsOptional()
  additionInfo?: BaseAdditionInfo;

  @IsNumber() @ApiProperty({}) houseID: number; // Mối quan hệ với House
}

export class UpdateRoomDTO {
  @IsNumber() @ApiProperty({}) roomID: number; // Khóa chính, tự động tăng

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  name?: string; // Tên phòng

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) price?: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositPrice?: number; // Tiền đặt cọc

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  commissionPer?: string; // Tiền hoa hồng khi bán được phòng này

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  agreementDuration?: string; // Thời hạn hợp đồng

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú

  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  isHot?: boolean; // Phòng hiện tại có đang hot sale không

  @IsBoolean()
  @IsOptional()
  @ApiProperty({ required: false })
  isEmpty?: boolean; // Phòng hiện tại có trống không
  @ValidateNested()
  @IsOptional()
  @ApiProperty({ type: BaseUnitPrice, required: false })
  unitPrice?: BaseUnitPrice;
  @ValidateNested()
  @Type(() => BaseAdditionInfo)
  @ApiProperty({ type: BaseAdditionInfo })
  @IsOptional()
  additionInfo?: BaseAdditionInfo;

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) houseID?: number; // Mối quan hệ với House

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  primaryImageName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;

  areAllPropertiesUndefinedExcludeEmptyAndHot(): boolean {
    for (const key in this) {
      if (
        key != 'isEmpty' &&
        key != 'isHot' &&
        key != 'roomID' &&
        Object.prototype.hasOwnProperty.call(this, key) &&
        this[key] !== undefined
      ) {
        return false;
      }
    }
    return true;
  }
}

export class HardDeleteAndRecoverRoomDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  roomIDs: number[];
}

export class CreateResponseRoomDTO {
  @IsNumber()
  @ApiProperty()
  roomID: number;
}
export class MaxResponseRoomDTO {
  @IsNumber()
  @ApiProperty()
  roomID: number;
}

export class AutocompleteRoomDTO {
  @ApiProperty()
  @IsNumber()
  roomID: number;
  @ApiProperty()
  @IsString()
  name: string;
}

export class HouseProvinceDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  provinceCode: number;
}
export class HouseDistrictDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  districtCode: number;
}
export class HouseWardDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  wardCode: number;
}
export class HouseIDDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty()
  houseID: number;
}

export class RoomFilterDTO {
  @ValidateNested()
  @IsOptional()
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(HouseIDDTO) },
      {
        $ref: getSchemaPath(HouseWardDTO),
      },
      {
        $ref: getSchemaPath(HouseDistrictDTO),
      },
      {
        $ref: getSchemaPath(HouseProvinceDTO),
      },
    ],
    required: false,
  })
  house?: HouseIDDTO | HouseWardDTO | HouseDistrictDTO | HouseProvinceDTO;
  minPrice?: number;
  maxPrice?: number;
  hot?: boolean;
  sortBy?: string; //min-price, min-duration
}
