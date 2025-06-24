import { Type } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
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
        key != 'primaryImageName' &&
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

export class FindRoomQueryDTO {
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  roomID?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  provinceCode?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  districtCode?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  wardCode?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  houseID?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isHot?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isEmpty?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  ID_desc_cursor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  updateAt_desc_cursor?: Date;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  price_asc_cursor?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  order_type?: string;

  // Addition info fields
  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addition_moveInTime?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_roomType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_toilet?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_position?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_gateLock?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_dryingYard?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_activityHours?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addition_numberOfVehicles?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_parkingSpace?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  addition_area?: string;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addition_numberOfPeoples?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addition_deposit?: number;

  @ApiProperty({ required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  addition_depositReplenishmentTime?: number;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_kitchenShelf?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_bed?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_sharedOwner?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_airConditioner?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_sharedWashingMachine?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_window?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_tv?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_dishWasher?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_mattress?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_elevator?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_skylight?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_balcony?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_washingMachine?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_waterHeater?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_wardrobe?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_security?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_pet?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_electricBike?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_attic?: boolean;

  @ApiProperty({ required: false, type: Boolean })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  addition_fridge?: boolean;
}
