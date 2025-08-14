import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  DeleteAndRecoverDistrictUnitDTO,
  DeleteAndRecoverProvinceUnitDTO,
  DeleteAndRecoverWardUnitDTO,
} from 'src/dtos/administrative-unit.dto';
import { HardDeleteAndRecoverAppointmentDTO } from 'src/dtos/appointment.dto';
import { HardDeleteAndRecoverDepositAgreementDTO } from 'src/dtos/deposit-agreement.dto';
import { HardDeleteAndRecoverHouseDTO } from 'src/dtos/house.dto';
import { HardDeleteAndRecoverRoomDTO } from 'src/dtos/room.dto';
import { DeleteImagesDTO } from 'src/dtos/room-images.dto';
import { HardDeleteAndRecoverTenantDTO } from 'src/dtos/tenant.dto';
import { HardDeleteAndRecoverUserDTO, UpdateUserDTO } from 'src/dtos/user.dto';

@Injectable()
export class RoleIDsCheckPipe implements PipeTransform {
  transform(value: UpdateUserDTO) {
    if (value.roleIDs) {
      const roleIDSet = new Set<string>();
      value.roleIDs.forEach((roleID) => {
        if (roleIDSet.has(roleID))
          throw new HttpException(
            'There are some roleIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        roleIDSet.add(roleID);
      });
    }
    return value;
  }
}

export class ImageNamesCheckPipe implements PipeTransform {
  transform(dto: DeleteImagesDTO) {
    if (dto.imageNames) {
      const imageNameSet = new Set<string>();
      dto.imageNames.forEach((imageName) => {
        if (imageNameSet.has(imageName))
          throw new HttpException(
            'There are some imageNames that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        imageNameSet.add(imageName);
      });
    }
    return dto;
  }
}

@Injectable()
export class UsernamesCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverUserDTO) {
    if (value.usernames) {
      const usernameSet = new Set<string>();
      value.usernames.forEach((username) => {
        if (usernameSet.has(username))
          throw new HttpException(
            'There are some usernames that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        usernameSet.add(username);
      });
    }
    return value;
  }
}
@Injectable()
export class RoomIDsCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverRoomDTO) {
    if (value.roomIDs) {
      const roomIDSet = new Set<number>();
      value.roomIDs.forEach((roomID) => {
        if (roomIDSet.has(roomID))
          throw new HttpException(
            'There are some roomIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        roomIDSet.add(roomID);
      });
    }
    return value;
  }
}
@Injectable()
export class HouseIDsCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverHouseDTO) {
    if (value.houseIDs) {
      const houseIDSet = new Set<number>();
      value.houseIDs.forEach((houseID) => {
        if (houseIDSet.has(houseID))
          throw new HttpException(
            'There are some houseIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        houseIDSet.add(houseID);
      });
    }
    return value;
  }
}
@Injectable()
export class TenantIDsCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverTenantDTO) {
    if (value.tenantIDs) {
      const tenantIDSet = new Set<number>();
      value.tenantIDs.forEach((tenantID) => {
        if (tenantIDSet.has(tenantID))
          throw new HttpException(
            'There are some tenantIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        tenantIDSet.add(tenantID);
      });
    }
    return value;
  }
}
@Injectable()
export class DepositAgreementIDsCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverDepositAgreementDTO) {
    if (value.depositAgreementIDs) {
      const depositAgreementIDSet = new Set<number>();
      value.depositAgreementIDs.forEach((depositAgreementID) => {
        if (depositAgreementIDSet.has(depositAgreementID))
          throw new HttpException(
            'There are some depositAgreementIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        depositAgreementIDSet.add(depositAgreementID);
      });
    }
    return value;
  }
}
@Injectable()
export class AppointmentIDsCheckPipe implements PipeTransform {
  transform(value: HardDeleteAndRecoverAppointmentDTO) {
    if (value.appointmentIDs) {
      const appointmentIDSet = new Set<number>();
      value.appointmentIDs.forEach((appointmentID) => {
        if (appointmentIDSet.has(appointmentID))
          throw new HttpException(
            'There are some appointmentIDs that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        appointmentIDSet.add(appointmentID);
      });
    }
    return value;
  }
}

@Injectable()
export class ProvinceCodesCheckPipe implements PipeTransform {
  transform(value: DeleteAndRecoverProvinceUnitDTO) {
    if (value.provinceCodes) {
      const provinceCodesSet = new Set<number>();
      value.provinceCodes.forEach((provinceCode) => {
        if (provinceCodesSet.has(provinceCode))
          throw new HttpException(
            'There are some provinceCodes that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        provinceCodesSet.add(provinceCode);
      });
    }
    return value;
  }
}
@Injectable()
export class DistrictCodesCheckPipe implements PipeTransform {
  transform(value: DeleteAndRecoverDistrictUnitDTO) {
    if (value.districtCodes) {
      const districtCodeSet = new Set<number>();
      value.districtCodes.forEach((districtCode) => {
        if (districtCodeSet.has(districtCode))
          throw new HttpException(
            'There are some districtCodes that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        districtCodeSet.add(districtCode);
      });
    }
    return value;
  }
}
@Injectable()
export class WardCodesCheckPipe implements PipeTransform {
  transform(value: DeleteAndRecoverWardUnitDTO) {
    if (value.wardCodes) {
      const wardCodeSet = new Set<number>();
      value.wardCodes.forEach((wardCode) => {
        if (wardCodeSet.has(wardCode))
          throw new HttpException(
            'There are some wardCodes that are repeated',
            HttpStatus.BAD_REQUEST,
          );
        wardCodeSet.add(wardCode);
      });
    }
    return value;
  }
}
