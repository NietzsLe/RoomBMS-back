import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateIf,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DepositAgreementStatus } from 'src/models/depositAgreement.model';
import { ReadUserDTO } from './userDTO';
import { ReadRoomDTO } from './roomDTO';
import { ReadTenantDTO } from './tenantDTO';
import { AppointmentStatus } from 'src/models/helper';

class ReadDepositAgreementForAppointmentDTO {
  @ApiProperty({})
  depositAgreementID: number; // Khóa chính, tự động tăng
  @ApiProperty({})
  name: string;
  @ApiProperty({})
  status: DepositAgreementStatus;
}

export class ReadAppointmentDTO {
  @ApiProperty({})
  appointmentID: number; // Khóa chính, tự động tăng
  @ApiProperty({})
  name: string;
  @ApiProperty({})
  consultingPrice: number; // Giá tư vấn
  @ApiProperty({})
  noPeople: number; // Số lượng người
  @ApiProperty({})
  noVehicles: number; // Số lượng phương tiện
  @ApiProperty({})
  moveInTime: string; // Số lượng phương tiện
  @IsBoolean()
  @ApiProperty({})
  pet: boolean; // Có mang theo thú cưng không
  @ApiProperty({})
  note: string; // Ghi chú
  @ApiProperty({})
  deletedAt: Date;
  @ApiProperty({})
  updateAt: Date;
  @ApiProperty({})
  createAt: Date; // Thời điểm tạo cuộc hẹn
  @ApiProperty({})
  appointmentTime: Date; // Thời gian cuộc hẹn
  @ApiProperty({})
  failReason: string;
  @ApiProperty({})
  status: AppointmentStatus;
  @ApiProperty({})
  takenOverUser: ReadUserDTO;
  @ApiProperty({})
  madeUser: ReadUserDTO;
  @ApiProperty({})
  room: ReadRoomDTO; // Mối quan hệ với Room
  @ApiProperty({})
  depositAgreement: ReadDepositAgreementForAppointmentDTO; // Mối quan hệ với DepositAgreement
  @ApiProperty({})
  tenant: ReadTenantDTO; // Mối quan hệ với Tenant
  @ApiProperty({})
  managerID: string;
}

export class CreateAppointmentDTO {
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  consultingPrice?: number; // Giá tư vấn
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  noPeople?: number; // Số lượng người
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  noVehicles?: number; // Số lượng phương tiện
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  moveInTime: string; // Số lượng phương tiện
  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  pet?: boolean; // Có mang theo thú cưng không
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú
  @IsDate()
  @ApiProperty({})
  appointmentTime: Date; // Thời gian cuộc hẹn
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  roomID?: number; // Mối quan hệ với Room
  @IsNumber()
  @ApiProperty({})
  tenantID: number; // Mối quan hệ với Tenant
}

export class UpdateAppointmentDTO {
  @IsNumber()
  @ApiProperty({})
  appointmentID: number; // Khóa chính, tự động tăng
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  consultingPrice?: number; // Giá tư vấn
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  noPeople?: number; // Số lượng người
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  noVehicles?: number; // Số lượng phương tiện
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  moveInTime?: symbol; // Số lượng phương tiện
  @IsBoolean()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  pet?: boolean; // Có mang theo thú cưng không
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  note?: string; // Ghi chú
  @IsDate()
  @ValidateIf((_, value) => value !== undefined)
  @ApiProperty({ required: false })
  appointmentTime?: Date; // Thời gian cuộc hẹn
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  failReason?: string;
  @IsEnum(AppointmentStatus)
  @ApiProperty({ required: false, enum: AppointmentStatus })
  @ValidateIf((_, value) => value !== undefined)
  status?: AppointmentStatus;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  takenOverUsername?: string;
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  madeUsername?: string;
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  roomID?: number; // Mối quan hệ với Room
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositAgreementID?: number; // Mối quan hệ với DepositAgreement
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  tenantID?: number; // Mối quan hệ với Tenant
  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  managerID?: string;
}

export class TakenOverAppointmentDTO {
  @IsNumber()
  @ApiProperty({})
  appointmentID: number;
}

export class UpdateAppointmentForRelatedUserDTO {
  @IsNumber()
  @ApiProperty({})
  appointmentID: number; // Khóa chính, tự động tăng
  @IsString()
  @ApiProperty({ required: false })
  @IsOptional()
  failReason?: string;
  @IsEnum(AppointmentStatus)
  @ApiProperty({ required: false, enum: AppointmentStatus })
  @IsOptional()
  status: AppointmentStatus;
  @IsNumber()
  @IsOptional()
  @ApiProperty({ required: false })
  depositAgreementID?: number; // Mối quan hệ với DepositAgreement
}

export class OtherResourceDTO {
  @IsNumber()
  @ApiProperty({})
  appointmentID: number; // Khóa chính, tự động tăng
}

export class UpdateDepositAgreementForRelatedUserDTO extends OtherResourceDTO {
  @IsNumber()
  @ApiProperty({})
  depositAgreementID: number; // Khóa chính, tự động tăng
  @IsEnum(DepositAgreementStatus)
  @ApiProperty({ enum: DepositAgreementStatus })
  @IsOptional()
  status: DepositAgreementStatus;
}

export class UpdateTenantForRelatedUserDTO extends OtherResourceDTO {
  @IsNumber() @ApiProperty({}) tenantID: number; // Khóa chính, tự động tăng

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  name?: string; // Tên người thuê

  @IsString()
  @IsPhoneNumber('VN')
  @IsOptional()
  @ApiProperty({ required: false })
  phoneNumber?: string; // Số điện thoại
}

export class HardDeleteAndRecoverAppointmentDTO {
  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number] })
  @ArrayNotEmpty()
  appointmentIDs: number[];
}

export class CreateResponseAppointmentDTO {
  @IsNumber()
  @ApiProperty()
  appointmentID: number;
}

export class AutocompleteAppointmentDTO {
  @IsNumber()
  @ApiProperty()
  appointmentID: number;
  @IsString()
  @ApiProperty()
  name: string;
}

export class MaxResponseAppointmentDTO {
  @IsNumber()
  @ApiProperty()
  appointmentID: number;
}
