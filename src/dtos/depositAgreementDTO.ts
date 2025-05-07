import { Expose, Transform } from '@nestjs/class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepositAgreementStatus } from 'src/models/depositAgreement.model';
import { Room } from 'src/models/room.model';
import { Tenant } from 'src/models/tenant.model';
import { User } from 'src/models/user.model';

export class BaseDepositAgreementDTO {
  @IsNumber()
  @ApiProperty({})
  @Expose()
  depositAgreementID: number; // Khóa chính, tự động tăng
  @IsString()
  @ApiProperty({})
  @Expose()
  name: string;
  @IsNumber()
  @ApiProperty({})
  @Expose()
  depositPrice: number; // Tiền đặt cọc
  @IsNumber()
  @ApiProperty({})
  @Expose()
  deliveredDeposit: number; // Tiền đặt cọc đã giao
  @IsDate()
  @ApiProperty({})
  @Expose()
  depositDeliverDate: Date; // Ngày giao tiền đặt cọc
  @IsDate()
  @ApiProperty({})
  @Expose()
  agreementDate: Date; // Ngày ký thỏa thuận
  @IsDate()
  @ApiProperty({})
  @Expose()
  depositCompleteDate: Date; // Ngày hoàn tất tiền đặt cọc
  @IsNumber()
  @Expose()
  @ApiProperty({})
  commissionPer: number;
  @IsNumber()
  @Expose()
  @ApiProperty({})
  bonus: number;
  @IsNumber()
  @ApiProperty({})
  @Expose()
  duration: number; // Thời gian thỏa thuận
  @IsEnum(DepositAgreementStatus)
  @ApiProperty({})
  @Expose()
  status: DepositAgreementStatus;
  @IsString()
  @ApiProperty({})
  @Expose()
  note: string; // Ghi chú
  @IsDate()
  @ApiProperty({})
  @Expose()
  deletedAt: Date; // Xem thỏa thuận đã xóa chưa
  @IsDate()
  @ApiProperty({})
  @Expose()
  createAt: Date; // Thời điểm tạo thỏa thuận
  @IsDate()
  @ApiProperty({})
  @Expose()
  updateAt: Date; // Thời điểm cập nhật thỏa thuận
  @IsNumber()
  @ApiProperty({})
  @Expose()
  price: number; // Giá thỏa thuận
  @IsNumber()
  @ApiProperty({})
  @Expose({ name: 'room', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number }) => {
      const obj = new Room();
      obj.roomID = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  roomID: number; // Mối quan hệ với Room
  @IsNumber()
  @ApiProperty({})
  @Expose({ name: 'tenant', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number }) => {
      const obj = new Tenant();
      obj.tenantID = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  tenantID: number; // Mối quan hệ với Tenant
  @IsString()
  @ApiProperty({})
  @Expose({ name: 'negotiator', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  negotiatorUsername: string;
  @IsString()
  @ApiProperty({})
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
}

export class CreateDepositAgreementDTO {
  @IsNumber()
  @ApiProperty({})
  depositPrice: number; // Tiền đặt cọc
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  deliveredDeposit?: number; // Tiền đặt cọc đã giao
  @IsDate()
  @IsOptional()
  @ApiProperty({ required: false })
  depositDeliverDate?: Date; // Ngày giao tiền đặt cọc
  @IsDate()
  @ApiProperty({})
  agreementDate: Date; // Ngày ký thỏa thuận
  @IsDate()
  @IsOptional()
  @ApiProperty({ required: false })
  depositCompleteDate?: Date; // Ngày hoàn tất tiền đặt cọc
  @IsNumber()
  @ApiProperty({})
  commissionPer: number;
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  bonus?: number;
  @IsNumber()
  @ApiProperty({})
  duration: number; // Thời gian thỏa thuận
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú
  @IsNumber()
  @ApiProperty({})
  price: number; // Giá thỏa thuận
  @IsNumber()
  @ApiProperty({})
  roomID: number; // Mối quan hệ với Room
  @IsNumber()
  @ApiProperty({})
  tenantID: number; // Mối quan hệ với Tenant
  @IsString()
  @ApiProperty({})
  negotiatorUsername: string;
}

export class UpdateDepositAgreementDTO {
  @IsNumber()
  @ApiProperty({})
  depositAgreementID: number; // Khóa chính, tự động tăng
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  depositPrice?: number; // Tiền đặt cọc
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  deliveredDeposit?: number; // Tiền đặt cọc đã giao
  @IsDate()
  @IsOptional()
  @ApiProperty({ required: false })
  depositDeliverDate?: Date; // Ngày giao tiền đặt cọc
  @IsDate()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  agreementDate?: Date; // Ngày ký thỏa thuận
  @IsDate()
  @IsOptional()
  @ApiProperty({ required: false })
  depositCompleteDate?: Date; // Ngày hoàn tất tiền đặt cọc
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  commissionPer?: number;
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  bonus?: number;
  @IsEnum(DepositAgreementStatus)
  @ApiProperty({ required: false, enum: DepositAgreementStatus })
  @ValidateIf((_, value) => value !== undefined)
  status?: DepositAgreementStatus;
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  duration?: number; // Thời gian thỏa thuận
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  price?: number; // Giá thỏa thuận
  @IsNumber()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  roomID?: number; // Mối quan hệ với Room
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  tenantID?: number; // Mối quan hệ với Tenant
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  negotiatorUsername?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
}

export class HardDeleteAndRecoverDepositAgreementDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  depositAgreementIDs: number[];
}

export class CreateResponseDepositAgreementDTO {
  @IsNumber()
  @ApiProperty()
  depositAgreementID: number;
}

export class AutocompleteDepositAgreementDTO {
  @IsNumber()
  @ApiProperty()
  depositAgreementID: number;
  @IsString()
  @ApiProperty()
  name: string;
}

export class MaxResponseDepositAgreementDTO {
  @IsNumber()
  @ApiProperty()
  depositAgreementID: number;
}
