import { Expose } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNumber,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BaseProvinceUnitDTO {
  @IsNumber()
  @ApiProperty()
  @Expose()
  provinceCode: number; // Mã tỉnh

  @IsString()
  @ApiProperty()
  @Expose()
  provinceName: string; // Tên tỉnh
}
export class BaseDistrictUnitDTO {
  @IsNumber()
  @ApiProperty()
  @Expose()
  districtCode: number; // Mã quận

  @IsString()
  @ApiProperty()
  @Expose()
  districtName: string; // Tên quận
}
export class BaseWardUnitDTO {
  @IsNumber()
  @ApiProperty()
  @Expose()
  wardCode: number; // Mã phường

  @IsString()
  @ApiProperty()
  @Expose()
  wardName: string; // Tên phường
}

export class DeleteAndRecoverProvinceUnitDTO {
  @IsNumber({}, { each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  provinceCodes: number[]; // Mã tỉnh

  @IsString({ each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  provinceNames: string[]; // Tên tỉnh
}
export class DeleteAndRecoverDistrictUnitDTO {
  @IsNumber({}, { each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  districtCodes: number[]; // Mã quận

  @IsString({ each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  districtNames: string[]; // Tên quận
}
export class DeleteAndRecoverWardUnitDTO {
  @IsNumber({}, { each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  wardCodes: number[]; // Mã phường

  @IsString({ each: true })
  @ApiProperty()
  @IsArray()
  @ArrayNotEmpty()
  wardNames: string[]; // Tên phường
}
