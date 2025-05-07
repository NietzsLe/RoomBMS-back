import { Expose, Transform } from '@nestjs/class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
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
import { AdministrativeUnit } from 'src/models/administrativeUnit.model';
import { AppointmentStatus } from 'src/models/appointment.model';
import {
  DepositAgreement,
  DepositAgreementStatus,
} from 'src/models/depositAgreement.model';
import { Room } from 'src/models/room.model';
import { Tenant } from 'src/models/tenant.model';
import { User } from 'src/models/user.model';

export class BaseAppointmentDTO {
  @IsNumber()
  @ApiProperty({})
  @Expose()
  appointmentID: number; // Khóa chính, tự động tăng
  @IsString()
  @ApiProperty({})
  @Expose()
  name: string;
  @IsNumber()
  @ApiProperty({})
  @Expose()
  consultingPrice: number; // Giá tư vấn
  @IsNumber()
  @ApiProperty({})
  @Expose()
  noPeople: number; // Số lượng người
  @IsNumber()
  @ApiProperty({})
  @Expose()
  noVehicles: number; // Số lượng phương tiện
  @IsBoolean()
  @ApiProperty({})
  @Expose()
  pet: boolean; // Có mang theo thú cưng không
  @IsString()
  @ApiProperty({})
  @Expose()
  note: string; // Ghi chú
  @IsDate()
  @ApiProperty({})
  @Expose()
  deletedAt: Date;
  @IsDate()
  @ApiProperty({})
  @Expose()
  updateAt: Date;
  @IsDate()
  @ApiProperty({})
  @Expose()
  createAt: Date; // Thời điểm tạo cuộc hẹn
  @IsDate()
  @ApiProperty({})
  @Expose()
  appointmentTime: Date; // Thời gian cuộc hẹn
  @IsString()
  @ApiProperty({})
  @Expose()
  address: string;
  @IsString()
  @ApiProperty({})
  @Expose()
  failReason: string;
  @IsEnum(AppointmentStatus)
  @ApiProperty({})
  @Expose()
  status: AppointmentStatus;
  @IsString()
  @ApiProperty({})
  @Expose({ name: 'takenOverUser', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  takenOverUsername: string;
  @IsString()
  @ApiProperty({})
  @Expose({ name: 'madeUser', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  madeUsername: string;
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
  @Expose({ name: 'depositAgreement', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number }) => {
      const obj = new DepositAgreement();
      obj.depositAgreementID = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  depositAgreementID: number; // Mối quan hệ với DepositAgreement
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
  @Expose({ name: 'manager', groups: ['relation'] })
  @Transform(
    ({ value }: { value: string }) => {
      const obj = new User();
      obj.username = value;
      return obj;
    },
    { toPlainOnly: true },
  )
  @IsString()
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
  @IsString()
  @ApiProperty({})
  address: string;
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
  @ApiProperty({})
  @ValidateIf((_, value) => value !== undefined)
  address?: string;
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
  status?: AppointmentStatus;
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

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  addressDetail?: string; // Thông tin chi tiết về địa chỉ

  @IsArray() // Kiểm tra xem đây có phải là một mảng không
  @ArrayMinSize(3)
  @ArrayMaxSize(3)
  @IsNumber({}, { each: true }) // Kiểm tra từng phần tử trong mảng phải là string
  @ApiProperty({ type: [Number], minItems: 3, maxItems: 3 })
  @IsOptional()
  @Expose({ name: 'administrativeUnit', groups: ['relation'] })
  @Transform(
    ({ value }: { value: number[] }) => {
      if (value) {
        const obj = new AdministrativeUnit();
        obj.provinceCode = value[0];
        obj.districtCode = value[1];
        obj.wardCode = value[2];
        return obj;
      }
      return null;
    },
    { toPlainOnly: true },
  )
  administrativeUnitID?: number[]; // Mối quan hệ với administrativeUnit
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
