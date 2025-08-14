import { IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReadRoleDTO {
  @ApiProperty()
  roleID: string;
}
export class CreateRoleDTO {
  @ApiProperty()
  @IsString()
  roleID: string;
}
export class CreateResponseRoleDTO {
  @ApiProperty()
  @IsString()
  roleID: string;
}

export class AutocompleteRoleDTO {
  @ApiProperty()
  @IsString()
  roleID: string;
}

export class MaxResponseRoleDTO {
  @ApiProperty()
  @IsString()
  roleID: string;
}
