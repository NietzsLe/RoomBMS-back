import { Expose } from '@nestjs/class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BaseAccessRuleDTO {
  @IsString()
  @ApiProperty()
  @Expose()
  resourceID: string;
  @IsString()
  @ApiProperty()
  @Expose()
  roleID: string;
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
  createAttrDTOBlackList: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  @Expose()
  updateAttrDTOBlackList: string[];
}
export class CreateAccessRuleDTO {
  @IsString()
  @ApiProperty()
  resourceID: string;
  @IsString()
  @ApiProperty()
  roleID: string;
  @IsBoolean()
  @ApiProperty()
  readPerm: boolean;
  @IsBoolean()
  @ApiProperty()
  updatePerm: boolean;
  @IsBoolean()
  @ApiProperty()
  createPerm: boolean;
  @IsBoolean()
  @ApiProperty()
  unlinkPerm: boolean;
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  readAttrDTOBlackList: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  createAttrDTOBlackList: string[];
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  updateAttrDTOBlackList: string[];
}
export class UpdateAccessRuleDTO {
  @IsString()
  @ApiProperty()
  resourceID: string;
  @IsString()
  @ApiProperty()
  roleID: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  readPerm?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  updatePerm?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  createPerm?: boolean;
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  unlinkPerm?: boolean;
  @IsOptional()
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  readAttrDTOBlackList?: string[];
  @IsOptional()
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  createAttrDTOBlackList?: string[];
  @IsOptional()
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  updateAttrDTOBlackList?: string[];
}
