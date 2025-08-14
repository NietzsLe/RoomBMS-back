import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import {
  CreateAccessRuleDTO,
  UpdateAccessRuleDTO,
} from 'src/dtos/access-rule.dto';
import { AccessRule } from 'src/models/access-rule.model';

export class AccessRuleMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(accessRuleDTO: CreateAccessRuleDTO | UpdateAccessRuleDTO) {
    const plainObj = classToPlain(accessRuleDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(AccessRule, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
    });
  }

  static EntityToReadDTO(accessRule: AccessRule) {
    const plainObj = classToPlain(accessRule, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
