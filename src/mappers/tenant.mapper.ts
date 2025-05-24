import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import {
  CreateTenantDTO,
  ReadTenantDTO,
  UpdateTenantDTO,
} from 'src/dtos/tenantDTO';
import { Tenant } from 'src/models/tenant.model';

export class TenantMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(tenantDTO: CreateTenantDTO | UpdateTenantDTO) {
    const plainObj = classToPlain(tenantDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(Tenant, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
      excludeExtraneousValues: true,
    });
  }

  static EntityToReadForAppointmentDTO(tenant: Tenant) {
    const plainObj = classToPlain(tenant, {
      groups: ['TO-APPOINTMENT-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadTenantDTO, plainObj);
  }
  static EntityToReadForDepositAgreementDTO(tenant: Tenant) {
    const plainObj = classToPlain(tenant, {
      groups: ['TO-DEPOSITAGREEMENT-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadTenantDTO, plainObj);
  }
  static EntityToReadDTO(tenant: Tenant) {
    const plainObj = classToPlain(tenant, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
