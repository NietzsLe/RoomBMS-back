import { Expose, Transform, Type } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from '@nestjs/class-validator';
import { Optional } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import * as bcrypt from 'bcrypt';
import { User } from 'src/models/user.model';

export class ReadUserDTO {
  @ApiProperty()
  username: string;
  @ApiProperty()
  name: string;
  @ApiProperty()
  teamID: string;
  @ApiProperty()
  phoneNumber: string;
  @ApiProperty()
  expiryTime: Date;
  @ApiProperty()
  isDisabled: boolean;
  @ApiProperty()
  createAt: Date;
  @ApiProperty()
  updateAt: Date;
  @ApiProperty()
  managerID: string;
  @ApiProperty()
  manager: ReadUserDTO;
  @ApiProperty({ type: [String] })
  roleIDs: string[];
}

export class CreateUserDTO {
  @ApiProperty()
  @IsString()
  username: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  phoneNumber: string;
  @ApiProperty()
  @IsString()
  @Expose({ name: 'hashedPassword' })
  @Transform(
    ({ value }: { value: string }) => {
      const saltOrRounds = 10;
      const hash = bcrypt.hashSync(value, saltOrRounds);
      return hash;
    },
    {
      toPlainOnly: true,
    },
  )
  password: string;
}
export class UpdateUserDTO {
  @ApiProperty()
  @IsString()
  username: string;
  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  name?: string;
  @ApiProperty({ required: false })
  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  phoneNumber?: string;
  @ApiProperty({ required: false })
  @IsString()
  @ValidateIf((_, value) => value !== undefined)
  @Expose({ name: 'hashedPassword' })
  @Transform(
    ({ value }: { value: string }) => {
      if (value) {
        const saltOrRounds = 10;
        const hash = bcrypt.hashSync(value, saltOrRounds);
        return hash;
      }
    },
    {
      toPlainOnly: true,
    },
  )
  password?: string;
  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiryTime?: Date;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  teamID?: string;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isDisabled?: boolean;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose({ name: 'manager' })
  @Transform(
    ({ value }: { value: string }) => {
      if (value) {
        const obj = new User();
        obj.username = value;
        return obj;
      } else if (value == null) return null;
    },
    { toPlainOnly: true },
  )
  managerID?: string;
  @ApiProperty({ type: [String], required: false })
  @Optional()
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  roleIDs?: string[];
}

export class HardDeleteAndRecoverUserDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @ArrayNotEmpty()
  usernames: string[];
}

export class AccessRuleWithoutRoleDTO {
  @IsString()
  @ApiProperty()
  @Expose()
  resourceID: string;
  @IsBoolean()
  @ApiProperty()
  @Expose()
  readPerm: boolean;
  @IsBoolean()
  @ApiProperty()
  @Expose()
  updatePerm: boolean;
  @IsBoolean()
  @ApiProperty()
  @Expose()
  createPerm: boolean;
  @IsBoolean()
  @ApiProperty()
  @Expose()
  unlinkPerm: boolean;
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @Expose()
  readAttrDTOBlackList: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @Expose()
  updateAttrDTOBlackList: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @Expose()
  createAttrDTOBlackList: string[];
}

export class ReadUserWithAccessRightDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  username: string;
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  @Expose()
  expiryTime: Date;
  @ApiProperty()
  @IsString()
  @Expose()
  managerID: string;
  @ApiProperty({ type: [String] })
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @Expose()
  roleIDs: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayNotEmpty() // Kiểm tra mảng không rỗng
  @ValidateNested()
  @Type(() => AccessRuleWithoutRoleDTO)
  @ApiProperty({ type: [AccessRuleWithoutRoleDTO] })
  @Expose()
  accessRights: AccessRuleWithoutRoleDTO[];
}

export class CreateResponseUserDTO {
  @IsString()
  @ApiProperty()
  username: string;
}

export class AutocompleteUserDTO {
  @ApiProperty()
  @IsString()
  username: string;
  @ApiProperty()
  @IsString()
  name: string;
}

export class MaxResponseUserDTO {
  @IsString()
  @ApiProperty()
  username: string;
}
export class AutocompleteTeamDTO {
  @ApiProperty()
  @IsString()
  teamID: string;
}

export class MaxResponseTeamDTO {
  @IsString()
  @ApiProperty()
  teamID: string;
}
