import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import { CreateRoomDTO, ReadRoomDTO, UpdateRoomDTO } from 'src/dtos/room.dto';
import { Room } from 'src/models/room.model';

export class RoomMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(roomDTO: CreateRoomDTO | UpdateRoomDTO) {
    const plainObj = classToPlain(roomDTO);
    //console.log('@Mapper: \n', plainObj);
    return plainToClass(Room, plainObj, { groups: ['TO-DTO', 'NOT-TO-DTO'] });
  }

  static EntityToReadDTO(room: Room) {
    const plainObj = classToPlain(room, {
      groups: ['TO-DTO'],
      excludeExtraneousValues: true,
    });

    //console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadRoomDTO, plainObj);
  }

  static EntityToReadForAppointmentDTO(room: Room) {
    const plainObj = classToPlain(room, {
      groups: ['TO-APPOINTMENT-DTO'],
    });

    return plainToClass(ReadRoomDTO, plainObj);
  }
  static EntityToReadForDepositAgreementDTO(room: Room) {
    const plainObj = classToPlain(room, {
      groups: ['TO-DEPOSITAGREEMENT-DTO'],
    });

    return plainToClass(ReadRoomDTO, plainObj);
  }
}
