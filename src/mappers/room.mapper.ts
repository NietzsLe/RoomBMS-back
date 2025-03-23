import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import { CreateRoomDTO, UpdateRoomDTO } from 'src/dtos/roomDTO';
import { Room } from 'src/models/room.model';

export class RoomMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(roomDTO: CreateRoomDTO | UpdateRoomDTO) {
    const plainObj = classToPlain(roomDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(Room, plainObj, { groups: ['TO-DTO', 'NOT-TO-DTO'] });
  }

  static EntityToBaseDTO(room: Room) {
    const plainObj = classToPlain(room, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
}
