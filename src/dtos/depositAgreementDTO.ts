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
import { ReadRoomDTO } from './roomDTO';
import { ReadTenantDTO } from './tenantDTO';
import { ReadAppointmentDTO } from './appointmentDTO';
import { DepositAgreementStatus } from 'src/models/helper';

export class ReadDepositAgreementDTO {
  @ApiProperty({})
  depositAgreementID: number; // Khóa chính, tự động tăng
  @ApiProperty({})
  name: string;
  @ApiProperty({})
  depositPrice: number; // Tiền đặt cọc
  @ApiProperty({})
  deliveredDeposit: number; // Tiền đặt cọc đã giao
  @ApiProperty({})
  depositDeliverDate: Date; // Ngày giao tiền đặt cọc
  @ApiProperty({})
  agreementDate: Date; // Ngày ký thỏa thuận
  @ApiProperty({})
  depositCompleteDate: Date; // Ngày hoàn tất tiền đặt cọc
  @ApiProperty({})
  commissionPer: number;
  @ApiProperty({})
  cancelFee: number;
  @ApiProperty({})
  bonus: number;
  @ApiProperty({})
  duration: number; // Thời gian thỏa thuận
  @ApiProperty({})
  status: DepositAgreementStatus;
  @ApiProperty({})
  note: string; // Ghi chú
  @ApiProperty({})
  deletedAt: Date; // Xem thỏa thuận đã xóa chưa
  @ApiProperty({})
  createAt: Date; // Thời điểm tạo thỏa thuận
  @ApiProperty({})
  updateAt: Date; // Thời điểm cập nhật thỏa thuận
  @ApiProperty({})
  price: number; // Giá thỏa thuận
  @ApiProperty({})
  room: ReadRoomDTO; // Mối quan hệ với Room
  @ApiProperty({})
  tenant: ReadTenantDTO; // Mối quan hệ với Tenant
  @ApiProperty({})
  appointment: ReadAppointmentDTO; // Mối quan hệ với Tenant
  @ApiProperty({})
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
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  cancelFee?: number; // Tiền đặt cọc đã giao
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
