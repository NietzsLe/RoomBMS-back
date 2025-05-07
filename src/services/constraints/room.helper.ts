import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from 'src/models/room.model';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class RoomConstraint {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}
  async RoomIsAlive(roomID: number | undefined | null) {
    if (roomID || roomID == 0) {
      const exist = await this.roomRepository.findOne({
        where: {
          roomID: roomID,
        },
        select: {
          roomID: true,
        },
        relations: {
          house: true,
          manager: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `room:${roomID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async RoomsIsNotAlive(roomIDs: number[] | undefined | null) {
    if (roomIDs) {
      const exists = await this.roomRepository.find({
        where: {
          roomID: In(roomIDs),
          deletedAt: Not(IsNull()),
        },
        select: {
          roomID: true,
        },
        relations: {
          house: true,
          manager: true,
        },
        withDeleted: true,
      });
      if (roomIDs.length > exists.length)
        throw new HttpException(
          'There are some houseIDs that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async RoomIsPersisted(roomID: number | undefined | null) {
    if (roomID || roomID == 0) {
      const exist = await this.roomRepository.findOne({
        where: {
          roomID: roomID,
        },
        select: {
          roomID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `room:${roomID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  // async RoomIsNotPersisted(roomID: number) {
  //   const exist = await this.roomRepository.findOne({
  //     where: {
  //       roomID: roomID,
  //     },
  //     select: {
  //       roomID: true,
  //     },
  //     withDeleted: true,
  //   });
  //   if (!exist)
  //     throw new HttpException(`${roomID} already exists`, HttpStatus.NOT_FOUND);
  //   return exist;
  // }
}

@Injectable()
export class RoomProcess {}
