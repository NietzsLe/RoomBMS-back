import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ReadStreetDTO {
  @ApiProperty()
  streetID: number;

  @ApiProperty({}) createAt: Date; // Thời điểm tạo phòng

  @ApiProperty({}) updateAt: Date; // Thời điểm cập nhật thông tin phòng

  @ApiProperty({}) deletedAt: Date; // Xem phòng đã xóa chưa

  @ApiProperty()
  name: string;

  @ApiProperty({})
  managerID: string;
}

export class CreateStreetDTO {
  @IsString()
  @ApiProperty()
  name: string;
}

export class UpdateStreetDTO {
  @IsNumber()
  @ApiProperty()
  streetID: number;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
}

export class MaxResponseStreetDTO {
  @IsNumber()
  @ApiProperty()
  streetID: number;
}

export class AutocompleteStreetDTO {
  @ApiProperty()
  @IsNumber()
  streetID: number;

  @ApiProperty()
  @IsString()
  name: string;
}
