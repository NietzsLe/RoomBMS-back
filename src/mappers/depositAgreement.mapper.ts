import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import {
  CreateDepositAgreementDTO,
  ReadDepositAgreementDTO,
  UpdateDepositAgreementDTO,
} from 'src/dtos/deposit-agreement.dto';
import { DepositAgreement } from 'src/models/deposit-agreement.model';

export class DepositAgreementMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(
    depositAgreementDTO: CreateDepositAgreementDTO | UpdateDepositAgreementDTO,
  ) {
    const plainObj = classToPlain(depositAgreementDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(DepositAgreement, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
      excludeExtraneousValues: true,
    });
  }

  static EntityToReadForAppointmentDTO(depositAgreement: DepositAgreement) {
    const plainObj = classToPlain(depositAgreement, {
      groups: ['TO-APPOINTMENT-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadDepositAgreementDTO, plainObj);
  }
  static EntityToReadDTO(depositAgreement: DepositAgreement) {
    const plainObj = classToPlain(depositAgreement, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadDepositAgreementDTO, plainObj);
  }
}
