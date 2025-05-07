import { Expose } from '@nestjs/class-transformer';
import {
  IsArray,
  IsBoolean,
  IsString,
  ValidateIf,
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

export class CreateResponseAccessRuleDTO {
  @IsString()
  @ApiProperty()
  resourceID: string;
  @IsString()
  @ApiProperty()
  roleID: string;
}

export class UpdateAccessRuleDTO {
  @IsString()
  @ApiProperty()
  resourceID: string;
  @IsString()
  @ApiProperty()
  roleID: string;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  @ApiProperty({ required: false })
  readPerm?: boolean;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  @ApiProperty({ required: false })
  updatePerm?: boolean;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  @ApiProperty({ required: false })
  createPerm?: boolean;
  @ValidateIf((_, value) => value !== undefined)
  @IsBoolean()
  @ApiProperty({ required: false })
  unlinkPerm?: boolean;
  @ValidateIf((_, value) => value !== undefined)
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  readAttrDTOBlackList?: string[];
  @ValidateIf((_, value) => value !== undefined)
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  createAttrDTOBlackList?: string[];
  @ValidateIf((_, value) => value !== undefined)
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsString({ each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [String] })
  updateAttrDTOBlackList?: string[];
}
