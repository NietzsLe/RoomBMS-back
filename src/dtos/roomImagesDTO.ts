import { Expose } from '@nestjs/class-transformer';
import { ArrayNotEmpty, IsArray, IsString } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteImagesDTO {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ type: [String] })
  @Expose()
  @ArrayNotEmpty()
  imageNames: string[];
}
