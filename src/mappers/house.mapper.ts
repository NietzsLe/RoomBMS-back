import { classToPlain, plainToClass } from '@nestjs/class-transformer';
import {
  CreateHouseDTO,
  ReadHouseDTO,
  UpdateHouseDTO,
} from 'src/dtos/houseDTO';
import { House } from 'src/models/house.model';

export class HouseMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(houseDTO: CreateHouseDTO | UpdateHouseDTO) {
    const plainObj = classToPlain(houseDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(House, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
      excludeExtraneousValues: true,
    });
  }

  static EntityToReadDTO(house: House) {
    const plainObj = classToPlain(house, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
  static EntityToReadForRoomDTO(house: House) {
    const plainObj = classToPlain(house, {
      groups: ['TO-ROOM-DTO'],
    });
    // console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadHouseDTO, plainObj);
  }
}
