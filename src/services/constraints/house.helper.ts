import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { House } from 'src/models/house.model';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class HouseConstraint {
  constructor(
    @InjectRepository(House)
    private houseRepository: Repository<House>,
  ) {}

  async HouseIsAlive(houseID: number | undefined | null) {
    if (houseID || houseID == 0) {
      const exist = await this.houseRepository.findOne({
        where: {
          houseID: houseID,
        },
        select: {
          houseID: true,
        },
        relations: {
          administrativeUnit: true,
          manager: true,
        },
      });

      if (!exist)
        throw new HttpException(
          `house:${houseID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }
  async HousesIsNotAlive(houseIDs: number[] | undefined | null) {
    if (houseIDs) {
      const exists = await this.houseRepository.find({
        where: {
          houseID: In(houseIDs),
          deletedAt: Not(IsNull()),
        },
        select: {
          houseID: true,
        },
        relations: {
          administrativeUnit: true,
          manager: true,
        },
        withDeleted: true,
      });

      if (houseIDs.length > exists.length)
        throw new HttpException(
          'There are some houseIDs that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async HouseIsPersisted(houseID: number | undefined | null) {
    if (houseID || houseID == 0) {
      const exist = await this.houseRepository.findOne({
        where: {
          houseID: houseID,
        },
        select: {
          houseID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `house:${houseID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async HouseIsNotPersisted(houseID: number) {
    if (houseID || houseID == 0) {
      const exist = await this.houseRepository.findOne({
        where: {
          houseID: houseID,
        },
        select: {
          houseID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `house:${houseID} does not exist`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }
}

@Injectable()
export class HouseProcess {}
