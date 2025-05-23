import {
  ClassConstructor,
  classToPlain,
  plainToClass,
} from '@nestjs/class-transformer';

import {
  CreateAppointmentDTO,
  OtherResourceDTO,
  ReadAppointmentDTO,
  UpdateAppointmentDTO,
} from 'src/dtos/appointmentDTO';
import { Appointment } from 'src/models/appointment.model';

export class AppointmentMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(
    appointmentDTO: CreateAppointmentDTO | UpdateAppointmentDTO,
  ) {
    const plainObj = classToPlain(appointmentDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(Appointment, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
      excludeExtraneousValues: true,
    });
  }

  static OtherResourceDTOToEntity<T>(
    appointmentDTO: OtherResourceDTO,
    cls: ClassConstructor<T>,
  ) {
    const plainObj = classToPlain(appointmentDTO);
    delete plainObj.appointmentID;
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(cls, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
    });
  }

  static EntityToReadDTO(appointment: Appointment) {
    const plainObj = classToPlain(appointment, {
      groups: ['TO-DTO'],
    });
    // console.log('@Mapper: \n', plainToClass(ReadAppointmentDTO, plainObj));
    return plainToClass(ReadAppointmentDTO, plainObj);
  }
  static EntityToReadForDepositAgreementDTO(appointment: Appointment) {
    const plainObj = classToPlain(appointment, {
      groups: ['TO-DEPOSITAGREEMENT-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadAppointmentDTO, plainObj);
  }
}
