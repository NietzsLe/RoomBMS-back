import { Expose, Transform, Type } from '@nestjs/class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AdministrativeUnit } from 'src/models/administrativeUnit.model';

export class BaseUnitPrice {
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

export class BaseAdditionInfo {
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
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  sharedWashingMachine?: boolean;
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
  @IsBoolean()
  @ApiProperty({ required: false })
  electricBike?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) attic?: boolean;
  @IsOptional() @IsBoolean() @ApiProperty({ required: false }) fridge?: boolean;
}

export class ReadHouseDTO {
  @ApiProperty({})
  houseID: number; // Khóa chính, tự động tăng
  @ApiProperty({})
  name: string; // Tên chủ sở hữu
  @ApiProperty({})
  ownerName: string; // Tên chủ sở hữu
  @ApiProperty({})
  ownerPhone: string; // Số điện thoại của chủ sở hữu
  @ApiProperty({})
  note: string;
  @ApiProperty({}) mapLink: string; // Liên kết đến một địa điểm trên Google Maps
  @ApiProperty({}) zaloLink: string; // Liên kết đến một địa điểm trên Google Maps
  @ApiProperty({})
  deletedAt: Date; // Xem nhà đã xóa chưa
  @ApiProperty({})
  createAt: Date; // Thời điểm tạo nhà
  @ApiProperty({})
  updateAt: Date; // Thời điểm cập nhật thông tin nhà

  @ApiProperty({}) room_price: number; // Giá phòng

  @ApiProperty({}) room_depositPrice: number; // Tiền đặt cọc

  @ApiProperty({}) room_commissionPer: string; // Tiền hoa hồng khi bán được phòng này

  @ApiProperty({})
  room_agreementDuration: string; // Thời hạn hợp đồng

  @ApiProperty({ type: BaseUnitPrice })
  room_unitPrice: BaseUnitPrice;
  @ApiProperty({ type: BaseAdditionInfo })
  room_additionInfo: BaseAdditionInfo;

  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
  administrativeUnitID: number[]; // Mối quan hệ với administrativeUnit

  @ApiProperty({ type: [String], minItems: 3, maxItems: 3 })
  administrativeUnitName: string[];

  @ApiProperty({})
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
  @ApiProperty({})
  ownerPhone: string; // Số điện thoại của chủ sở hữu
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  mapLink?: string; // Liên kết đến một địa điểm trên Google Maps
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  zaloLink?: string; // Liên kết đến một địa điểm trên Google Maps

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  room_price?: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  room_depositPrice?: number; // Tiền đặt cọc

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  room_commissionPer?: string; // Tiền hoa hồng khi bán được phòng này

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  room_agreementDuration?: string; // Thời hạn hợp đồng

  @ValidateNested()
  @IsOptional()
  @Type(() => BaseUnitPrice)
  @ApiProperty({ type: BaseUnitPrice, required: false })
  room_unitPrice?: BaseUnitPrice;
  @ValidateNested()
  @IsOptional()
  @Type(() => BaseAdditionInfo)
  @ApiProperty({ type: BaseAdditionInfo, required: false })
  room_additionInfo?: BaseAdditionInfo;

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
}

export class UpdateHouseDTO {
  @IsNumber()
  @ApiProperty({})
  houseID: number; // Khóa chính, tự động tăng
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  name: string; // Tên chủ sở hữu
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  ownerName: string; // Tên chủ sở hữu
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  ownerPhone: string; // Số điện thoại của chủ sở hữu
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  @Expose()
  note?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  mapLink: string; // Liên kết đến một địa điểm trên Google Maps
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  zaloLink: string; // Liên kết đến một địa điểm trên Google Maps

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  room_price: number; // Giá phòng

  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  room_depositPrice: number; // Tiền đặt cọc

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  room_commissionPer: string; // Tiền hoa hồng khi bán được phòng này

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  room_agreementDuration: string; // Thời hạn hợp đồng

  @ValidateNested()
  @IsOptional()
  @Type(() => BaseUnitPrice)
  @ApiProperty({ type: BaseUnitPrice, required: false })
  room_unitPrice: BaseUnitPrice;

  @ValidateNested()
  @IsOptional()
  @Type(() => BaseAdditionInfo)
  @ApiProperty({ type: BaseAdditionInfo, required: false })
  room_additionInfo: BaseAdditionInfo;

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
export class HardDeleteAndRecoverHouseDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  houseIDs: number[];
}

export class CreateResponseHouseDTO {
  @IsNumber()
  @ApiProperty()
  houseID: number;
}

export class AutocompleteHouseDTO {
  @IsNumber()
  @ApiProperty()
  houseID: number;
  @IsString()
  @ApiProperty()
  name: string;
}

export class MaxResponseHouseDTO {
  @IsNumber()
  @ApiProperty()
  houseID: number;
}
