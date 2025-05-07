import {
  ClassConstructor,
  classToPlain,
  plainToClass,
} from '@nestjs/class-transformer';

import {
  CreateAppointmentDTO,
  OtherResourceDTO,
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

  static EntityToBaseDTO(appointment: Appointment) {
    const plainObj = classToPlain(appointment, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
