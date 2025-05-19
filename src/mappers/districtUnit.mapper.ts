import { classToPlain } from '@nestjs/class-transformer';

import { DistrictUnit } from 'src/models/districtUnit.model';

export class DistrictUnitMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity

  static EntityToReadDTO(districtUnit: DistrictUnit) {
    const plainObj = classToPlain(districtUnit, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
