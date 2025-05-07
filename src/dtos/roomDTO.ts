import { Expose, Transform, Type } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { House } from 'src/models/house.model';
import { Image } from 'src/models/image.model';
import { User } from 'src/models/user.model';

class BaseUnitPrice {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  management?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  managementUnit?: string;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) other?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  otherUnit?: string;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) card?: number;
  @IsOptional() @IsString() @ApiProperty({ required: false }) cardUnit?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  electricity?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  electricityUnit?: string;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) water?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  waterUnit?: string;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) internet?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  internetUnit?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  washingMachine?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  washingMachineUnit?: string;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) parking?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  parkingUnit?: string;
  // Thông tin về giá cả các dịch vụ
}

class BaseAdditionInfo {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  moveInTime?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  roomType?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  toilet?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  position?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  gateLock?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  dryingYard?: string;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  activityHours?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  numberOfVehicles?: number;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  parkingSpace?: string; // Có thể là số lượng hoặc mô tả
  @IsOptional() @IsString() @ApiProperty({ required: false }) area?: string; // Diện tích
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  numberOfPeoples?: number;
  @IsOptional() @IsNumber() @ApiProperty({ required: false }) deposit?: number;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  depositReplenishmentTime?: number;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  kitchenShelf?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) bed?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  sharedOwner?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  airConditioner?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) window?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) tv?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  dishWasher?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  mattress?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  elevator?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  skylight?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  balcony?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  washingMachine?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  waterHeater?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  wardrobe?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  security?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) pet?: boolean;
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  note?: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  electricBike?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) attic?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) fridge?: boolean;
}

export class BaseRoomDTO {
  @IsNumber() @ApiProperty({}) @Expose() roomID: number; // Khóa chính, tự động tăng
  @IsString() @ApiProperty({}) @Expose() name: string; // Tên phòng

  @IsString() @ApiProperty({}) @Expose() description: string; // Mô tả phòng (có thể null)

  @IsNumber() @ApiProperty({}) @Expose() price: number; // Giá phòng

  @IsNumber() @ApiProperty({}) @Expose() depositPrice: number; // Tiền đặt cọc

  @IsNumber() @ApiProperty({}) @Expose() commissionPer: number; // Tiền hoa hồng khi bán được phòng này

  @IsNumber()
  @ApiProperty({})
  @Expose()
  agreementDuration: number; // Thời hạn hợp đồng

  @IsString() @ApiProperty({}) @Expose() note: string; // Ghi chú

  @IsDateString() @Type(() => Date) @ApiProperty({}) @Expose() deletedAt: Date; // Xem phòng đã xóa chưa

  @IsBoolean() @ApiProperty({}) @Expose() isHot: boolean; // Phòng hiện tại có đang hot sale không

  @IsBoolean() @ApiProperty({}) @Expose() isEmpty: boolean; // Phòng hiện tại có trống không
  @ValidateNested()
  @Type(() => BaseUnitPrice)
  @ApiProperty({ type: BaseUnitPrice })
  @Expose()
  unitPrice: BaseUnitPrice;
  @ValidateNested()
  @Type(() => BaseAdditionInfo)
  @ApiProperty({ type: BaseAdditionInfo })
  @Expose()
  additionInfo: BaseAdditionInfo;

  @IsString() @ApiProperty({}) @Expose() mapLink: string; // Liên kết đến một địa điểm trên Google Maps

  @IsDateString() @Type(() => Date) @ApiProperty({}) @Expose() createAt: Date; // Thời điểm tạo phòng

  @IsDateString() @Type(() => Date) @ApiProperty({}) @Expose() updateAt: Date; // Thời điểm cập nhật thông tin phòng

  @IsString() @ApiProperty({}) @Expose() primaryImageName: string;
  @IsNumber()
  @ApiProperty({})
  @Expose({ name: 'house', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number }) => {
      const obj = new House();
      obj.houseID = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  houseID: number; // Mối quan hệ với House
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @Expose({ name: 'images', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new Image();
      obj.imageName = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  imageNames: string[];

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
export class CreateRoomDTO {
  @IsString() @ApiProperty({}) name: string; // Tên phòng

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string; // Mô tả phòng (có thể null)

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) price?: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositPrice?: number; // Tiền đặt cọc

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  commissionPer?: number; // Tiền hoa hồng khi bán được phòng này

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  agreementDuration?: number; // Thời hạn hợp đồng

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

  @IsString() @IsOptional() @ApiProperty({ required: false }) mapLink?: string; // Liên kết đến một địa điểm trên Google Maps

  @IsNumber() @ApiProperty({}) houseID: number; // Mối quan hệ với House
}

export class UpdateRoomDTO {
  @IsNumber() @ApiProperty({}) roomID: number; // Khóa chính, tự động tăng

  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  name?: string; // Tên phòng

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  description?: string; // Mô tả phòng (có thể null)

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) price?: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositPrice?: number; // Tiền đặt cọc

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  commissionPer?: number; // Tiền hoa hồng khi bán được phòng này

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  agreementDuration?: number; // Thời hạn hợp đồng

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

  @IsString() @IsOptional() @ApiProperty({ required: false }) mapLink?: string; // Liên kết đến một địa điểm trên Google Maps

  @IsNumber() @IsOptional() @ApiProperty({ required: false }) houseID?: number; // Mối quan hệ với House

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  primaryImageName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
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
