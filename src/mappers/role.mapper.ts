import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { CreateRoleDTO } from 'src/dtos/role.dto';
import { Role } from 'src/models/role.model';

export class RoleMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(roleDTO: CreateRoleDTO) {
    const plainObj = classToPlain(roleDTO, {});
    // console.log('@Mapper: \n', plainObj);
    return plainToClass(Role, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
    });
  }

  static EntityToReadDTO(role: Role) {
    const plainObj = classToPlain(role, {
      groups: ['TO-DTO'],
    });
    // console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
