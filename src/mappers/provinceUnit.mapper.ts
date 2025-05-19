import { classToPlain } from '@nestjs/class-transformer';
import { ProvinceUnit } from 'src/models/provinceUnit.model';

export class ProvinceUnitMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity

  static EntityToReadDTO(provinceUnit: ProvinceUnit) {
    const plainObj = classToPlain(provinceUnit, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
