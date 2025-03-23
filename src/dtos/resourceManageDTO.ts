import { Expose } from '@nestjs/class-transformer';
import { IsDate, IsOptional } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResourceManageDTO {
  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Expose()
  startTime?: Date;
  @ApiProperty()
  @IsDate()
  @IsOptional()
  @Expose()
  endTime?: Date;
}
