import { Expose, Transform, Type } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

import * as bcrypt from 'bcrypt';
import { Role } from 'src/models/role.model';
import { User } from 'src/models/user.model';

export class BaseUserDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  username: string;
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;
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
  @ApiProperty()
  @Expose()
  password: string;
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  @Expose()
  expiryTime: Date;
  @IsBoolean()
  @ApiProperty()
  @Expose()
  isDisabled: boolean;
  @IsDate()
  @ApiProperty()
  @Expose()
  deletedAt: Date;
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  @Expose()
  createAt: Date;
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  @Expose()
  updateAt: Date;
  @ApiProperty()
  @IsString()
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
  @ApiProperty({ type: [String] })
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayNotEmpty() // Kiểm tra mảng không rỗng
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @Expose({ name: 'roles', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string[] }) => {
      return value.map((item) => {
        const obj = new Role();
        obj.roleID = item;
        return obj;
      });
    },
    { toPlainOnly: true },
  )
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
  @IsOptional()
  @IsString()
  name?: string;
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
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
  password?: string;
  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  expiryTime?: Date;
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
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  managerID?: string;
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
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

export class BaseUserWithAccessRightDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  username: string;
  @ApiProperty()
  @IsString()
  @Expose()
  name: string;
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
  @ApiProperty()
  @Expose()
  password: string;
  @IsDate()
  @Type(() => Date)
  @ApiProperty()
  @Expose()
  expiryTime: Date;
  @ApiProperty()
  @IsString()
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
  @ApiProperty({ type: [String] })
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayNotEmpty() // Kiểm tra mảng không rỗng
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @Expose({ name: 'roles', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string[] }) => {
      return value.map((item) => {
        const obj = new Role();
        obj.roleID = item;
        return obj;
      });
    },
    { toPlainOnly: true },
  )
  roleIDs: string[];

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayNotEmpty() // Kiểm tra mảng không rỗng
  @ValidateNested()
  @Type(() => AccessRuleWithoutRoleDTO)
  @ApiProperty({ type: [AccessRuleWithoutRoleDTO] })
  @Expose()
  accessRights: AccessRuleWithoutRoleDTO[];
}
