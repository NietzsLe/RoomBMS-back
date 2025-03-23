import { Expose } from '@nestjs/class-transformer';
import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BaseRoleDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  roleID: string;
}
export class CreateRoleDTO {
  @ApiProperty()
  @IsString()
  roleID: string;
}
