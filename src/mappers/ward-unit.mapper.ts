import { classToPlain } from '@nestjs/class-transformer';

import { WardUnit } from 'src/models/ward-unit.model';

export class WardUnitMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity

  static EntityToReadDTO(wardUnit: WardUnit) {
    const plainObj = classToPlain(wardUnit, {
      groups: ['TO-DTO'],
    });
    // console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
