import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import {
  CreateAccessRuleDTO,
  UpdateAccessRuleDTO,
} from 'src/dtos/accessRuleDTO';
import { AccessRule } from 'src/models/accessRule.model';

export class AccessRuleMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(accessRuleDTO: CreateAccessRuleDTO | UpdateAccessRuleDTO) {
    const plainObj = classToPlain(accessRuleDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(AccessRule, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
    });
  }

  static EntityToBaseDTO(accessRule: AccessRule) {
    const plainObj = classToPlain(accessRule, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
