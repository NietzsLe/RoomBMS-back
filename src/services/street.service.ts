import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, MoreThan } from 'typeorm';
import { Street } from '../models/street.model';
import { StreetMapper } from '../mappers/street.mapper';
import {
  CreateStreetDTO,
  MaxResponseStreetDTO,
  UpdateStreetDTO,
} from '../dtos/street.dto';
import { StreetConstraint } from './constraints/street.helper';
import { UserConstraint, UserProcess } from './constraints/user.helper';

@Injectable()
export class StreetService {
  constructor(
    @InjectRepository(Street)
    private streetRepository: Repository<Street>,
    private constraint: StreetConstraint,
    private userConstraint: UserConstraint,
    private userProcess: UserProcess,
  ) {}

  async getMaxStreetID(streetID?: number) {
    const query = this.streetRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.streetID)', 'streetID');
    if (streetID) {
      query.where('entity.streetID = :streetID', { streetID });
    }
    const dto = (await query.getRawOne()) as MaxResponseStreetDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number) {
    const streets = await this.streetRepository.find({
      where: {
        streetID: MoreThan(offsetID),
      },
      order: { streetID: 'ASC' },
      select: { streetID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    // Trả về dạng DTO
    return streets.map((street) => StreetMapper.EntityToReadDTO(street));
  }

  async findAll() {
    const streets = await this.streetRepository.find({
      order: { name: 'ASC' },
    });
    // Nếu có truyền requestorRoleIDs thì lọc blacklist tương tự room.service
    return streets.map((street) => StreetMapper.EntityToReadDTO(street));
  }

  async findInactiveAll() {
    const streets = await this.streetRepository.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { name: 'ASC' },
    });
    return streets;
  }

  async findById(streetID: number) {
    return this.streetRepository.findOne({ where: { streetID } });
  }

  async create(requestorID: string, createStreetDTO: CreateStreetDTO) {
    await this.constraint.ensureStreetNameUnique(createStreetDTO.name);
    const street = this.streetRepository.create(createStreetDTO);
    this.userProcess.CreatorIsDefaultManager(requestorID, street);
    const saved = await this.streetRepository.save(street);
    return { streetID: saved.streetID };
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateStreetDTO: UpdateStreetDTO,
  ) {
    const [street] = await Promise.all([
      this.constraint.ensureStreetExists(updateStreetDTO.streetID),
      this.constraint.ensureStreetNotDeleted(updateStreetDTO.streetID),
    ]);
    if (typeof updateStreetDTO.name !== 'string') {
      throw new Error('Street name is required');
    }
    await this.constraint.ensureStreetNameUnique(
      updateStreetDTO.name,
      updateStreetDTO.streetID,
    );
    // Permission check: only admin/manager can update
    let IsAdmin = 0;
    if (street)
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        street,
      );
    this.userConstraint.JustAdminCanUpdateManagerField(
      IsAdmin,
      updateStreetDTO,
    );
    Object.assign(street, updateStreetDTO);
    await this.streetRepository.save(street);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    streetID: number,
  ) {
    const [street] = await Promise.all([
      this.constraint.ensureStreetExists(streetID),
      this.constraint.ensureStreetNotDeleted(streetID),
    ]);
    // Permission check: only admin/manager can soft remove
    this.userConstraint.RequestorManageNonUserResource(
      requestorRoleIDs,
      requestorID,
      street,
    );
    await this.streetRepository.softRemove(street);
  }

  async hardRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    streetIDs: number[],
  ) {
    const streets = await this.constraint.StreetsIsNotAlive(streetIDs);
    if (streets) {
      streets.forEach((street) => {
        this.userConstraint.RequestorManageNonUserResource(
          requestorRoleIDs,
          requestorID,
          street,
        );
      });
    }
    await this.streetRepository.delete(streetIDs);
  }

  async recover(
    requestorRoleIDs: string[],
    requestorID: string,
    streetIDs: number[],
  ) {
    const streets = await this.constraint.StreetsIsNotAlive(streetIDs);
    if (streets) {
      streets.forEach((street) => {
        this.userConstraint.RequestorManageNonUserResource(
          requestorRoleIDs,
          requestorID,
          street,
        );
      });
    }
    await this.streetRepository.restore(streetIDs);
  }
}
