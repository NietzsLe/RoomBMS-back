import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import { CreateUserDTO, UpdateUserDTO } from 'src/dtos/userDTO';
import { User } from 'src/models/user.model';

export class UserMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(userDTO: CreateUserDTO | UpdateUserDTO) {
    const plainObj = classToPlain(userDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(User, plainObj, { groups: ['TO-DTO', 'NOT-TO-DTO'] });
  }

  static EntityToBaseDTO(user: User) {
    const plainObj = classToPlain(user, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
