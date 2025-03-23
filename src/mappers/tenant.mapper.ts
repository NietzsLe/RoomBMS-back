import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import { CreateTenantDTO, UpdateTenantDTO } from 'src/dtos/tenantDTO';
import { Tenant } from 'src/models/tenant.model';

export class TenantMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(tenantDTO: CreateTenantDTO | UpdateTenantDTO) {
    const plainObj = classToPlain(tenantDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(Tenant, plainObj, { groups: ['TO-DTO', 'NOT-TO-DTO'] });
  }

  static EntityToBaseDTO(tenant: Tenant) {
    const plainObj = classToPlain(tenant, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
