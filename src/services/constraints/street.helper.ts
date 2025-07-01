import { In, IsNull, Not } from 'typeorm';
import {
  HttpException,
  HttpStatus,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Street } from '../../models/street.model';

@Injectable()
export class StreetConstraint {
  constructor(
    @InjectRepository(Street)
    private streetRepository: Repository<Street>,
  ) {}

  async StreetIsAlive(streetID: number | undefined | null) {
    if (streetID || streetID === 0) {
      const exist = await this.streetRepository.findOne({
        where: { streetID },
        select: { streetID: true },
        relations: { manager: true },
      });
      if (!exist)
        throw new HttpException(
          `street:${streetID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async StreetsIsNotAlive(streetIDs: number[] | undefined | null) {
    if (streetIDs) {
      const exists = await this.streetRepository.find({
        where: {
          streetID: In(streetIDs),
          deletedAt: Not(IsNull()),
        },
        select: { streetID: true, manager: true },
        relations: { manager: true },
        withDeleted: true,
      });
      if (streetIDs.length > exists.length)
        throw new HttpException(
          'There are some streetIDs that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async StreetIsPersisted(streetID: number | undefined | null) {
    if (streetID || streetID === 0) {
      const exist = await this.streetRepository.findOne({
        where: { streetID },
        select: { streetID: true },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `street:${streetID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async StreetIsNotPersisted(streetID: number) {
    if (streetID || streetID === 0) {
      const exist = await this.streetRepository.findOne({
        where: { streetID },
        select: { streetID: true },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `street:${streetID} does not exist`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async ensureStreetExists(streetID: number) {
    const street = await this.streetRepository.findOne({ where: { streetID } });
    if (!street) {
      throw new BadRequestException(
        `Street with ID ${streetID} does not exist.`,
      );
    }
    return street;
  }

  async ensureStreetNotDeleted(streetID: number) {
    const street = await this.streetRepository.findOne({
      where: { streetID, deletedAt: IsNull() },
    });
    if (!street) {
      throw new BadRequestException(
        `Street with ID ${streetID} is deleted or does not exist.`,
      );
    }
    return street;
  }

  async ensureStreetNameUnique(name: string, excludeID?: number) {
    let where: { name: string; streetID?: any } = { name };
    if (excludeID !== undefined) {
      where = { name, streetID: Not(excludeID) };
    }
    const exists = await this.streetRepository.findOne({ where });
    if (exists) {
      throw new BadRequestException(`Street name '${name}' already exists.`);
    }
  }
}

@Injectable()
export class StreetProcess {}
