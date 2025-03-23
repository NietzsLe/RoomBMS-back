import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import {
  CreateDepositAgreementDTO,
  UpdateDepositAgreementDTO,
} from 'src/dtos/depositAgreementDTO';
import { DepositAgreement } from 'src/models/depositAgreement.model';

export class DepositAgreementMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(
    depositAgreementDTO: CreateDepositAgreementDTO | UpdateDepositAgreementDTO,
  ) {
    const plainObj = classToPlain(depositAgreementDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(DepositAgreement, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
    });
  }

  static EntityToBaseDTO(depositAgreement: DepositAgreement) {
    const plainObj = classToPlain(depositAgreement, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
