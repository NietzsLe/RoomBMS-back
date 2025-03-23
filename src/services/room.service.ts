import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoomDTO, UpdateRoomDTO } from 'src/dtos/roomDTO';
import { RoomMapper } from 'src/mappers/room.mapper';
import { Room } from 'src/models/room.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { RoomConstraint } from './constraints/room.helper';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { House } from 'src/models/house.model';
import { RoomImageService } from './roomImage.service';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    private constraint: RoomConstraint,
    private userConstraint: UserConstraint,
    private houseConstraint: HouseConstraint,
    private userProcess: UserProcess,
    private roomImageService: RoomImageService,
  ) {}

  async findAll(
    roomID: number,
    offsetID: number,
    selectAndRelationOption: {
      select: FindOptionsSelect<Room>;
      relations: FindOptionsRelations<Room>;
    },
  ) {
    const rooms = await this.roomRepository.find({
      where: {
        ...(roomID || roomID == 0
          ? { roomID: roomID }
          : { roomID: MoreThan(offsetID) }),
      },
      order: {
        roomID: 'ASC',
      },
      select: { roomID: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', rooms);
    return rooms.map((room) => RoomMapper.EntityToBaseDTO(room));
  }
  async findInactiveAll(roomID: number, offsetID: number) {
    const rooms = await this.roomRepository.find({
      where: {
        ...(roomID || roomID == 0
          ? { roomID: roomID }
          : { roomID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        roomID: 'ASC',
      },
      relations: { house: true, manager: true },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', rooms);
    return rooms.map((room) => RoomMapper.EntityToBaseDTO(room));
  }

  async create(requestorID: string, createRoomDTOs: CreateRoomDTO) {
    const room = RoomMapper.DTOToEntity(createRoomDTOs);
    //console.log('@Service: \n', room);
    const result = await Promise.all([
      this.houseConstraint.HouseIsAlive(createRoomDTOs.houseID),
    ]);
    if (result[0]) room.house = result[0];
    this.userProcess.CreatorIsDefaultManager(requestorID, room);
    await this.roomRepository.insert(room);
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateRoomDTO: UpdateRoomDTO,
  ) {
    const room = RoomMapper.DTOToEntity(updateRoomDTO);
    const result = await Promise.all([
      this.constraint.RoomIsAlive(room.roomID),
      this.houseConstraint.HouseIsAlive(room.house.houseID),
      this.userConstraint.ManagerIsAlive(updateRoomDTO.managerID),
    ]);

    let IsAdmin = 0;
    if (result[0])
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result[0],
      );

    this.userConstraint.JustAdminCanUpdateManagerField(IsAdmin, updateRoomDTO);
    if (result[1]) room.house = result[1];
    if (result[2]) room.manager = result[2];
    //console.log('@Service: \n', room);
    await this.roomRepository.save(room);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    roomID: number,
  ) {
    const result = await this.constraint.RoomIsAlive(roomID);
    if (result) {
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
      await this.roomImageService.trustSoftDeleteMany(result);
      await this.roomRepository.softDelete(roomID);
    }
  }

  async trustSoftRemoveMany(house: House) {
    const result = await this.roomRepository.find({
      where: {
        house: { houseID: house.houseID },
      },
      select: { roomID: true },
      relations: {
        images: true,
      },
    });
    await Promise.all(
      result.map((room) => this.roomImageService.trustSoftDeleteMany(room)),
    );
    await this.roomRepository.softRemove(result);
  }

  async trustRemoveMany(house: House) {
    const result = await this.roomRepository.find({
      where: {
        house: { houseID: house.houseID },
      },
      select: { roomID: true },
      relations: {
        images: true,
      },
      withDeleted: true,
    });

    await Promise.all(
      result.map((room) => this.roomImageService.trustDeleteMany(room)),
    );
    await this.roomRepository.remove(result);
  }

  async hardRemove(roomIDs: number[]) {
    const result = await this.constraint.RoomsIsNotAlive(roomIDs);
    if (result)
      await Promise.all(
        result.map((room) => this.roomImageService.trustDeleteMany(room)),
      );
    await this.roomRepository.delete(roomIDs);
  }
  async recover(roomIDs: number[]) {
    await this.constraint.RoomsIsNotAlive(roomIDs);
    await this.roomRepository.restore(roomIDs);
  }
}
