import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import { Street } from '../models/street.model';
import { CreateStreetDTO, UpdateStreetDTO } from '../dtos/streetDTO';

export class StreetMapper {
  static DTOToEntity(streetDTO: CreateStreetDTO | UpdateStreetDTO) {
    const plainObj = classToPlain(streetDTO);
    return plainToClass(Street, plainObj, { groups: ['TO-DTO', 'NOT-TO-DTO'] });
  }
  static EntityToReadDTO(street: Street) {
    const plainObj = classToPlain(street, {
      groups: ['TO-DTO'],
      excludeExtraneousValues: true,
    });
    return plainObj;
  }
  static EntityToReadForHouseDTO(street: Street) {
    const plainObj = classToPlain(street, {
      groups: ['TO-HOUSE-DTO'],
      excludeExtraneousValues: true,
    });
    return plainObj;
  }
}
