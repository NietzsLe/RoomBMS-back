import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateHouseDTO, UpdateHouseDTO } from 'src/dtos/houseDTO';
import { HouseMapper } from 'src/mappers/house.mapper';
import { House } from 'src/models/house.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { AdministrativeUnitConstraint } from './constraints/administrativeUnit.helper';
import { RoomService } from './room.service';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private houseRepository: Repository<House>,
    private constraint: HouseConstraint,
    private userConstraint: UserConstraint,
    private administrativeUnitConstraint: AdministrativeUnitConstraint,
    private userProcess: UserProcess,
    private roomService: RoomService,
  ) {}

  async findAll(
    houseID: number,
    offsetID: number,
    selectAndRelationOption: {
      select: FindOptionsSelect<House>;
      relations: FindOptionsRelations<House>;
    },
  ) {
    const houses = await this.houseRepository.find({
      where: {
        ...(houseID || houseID == 0
          ? { houseID: houseID }
          : { houseID: MoreThan(offsetID) }),
      },
      order: {
        houseID: 'ASC',
      },
      select: { houseID: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', houses);
    return houses.map((house) => HouseMapper.EntityToBaseDTO(house));
  }
  async findInactiveAll(houseID: number, offsetID: number) {
    const houses = await this.houseRepository.find({
      where: {
        ...(houseID || houseID == 0
          ? { houseID: houseID }
          : { houseID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        houseID: 'ASC',
      },

      relations: { administrativeUnit: true, manager: true },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', houses);
    return houses.map((house) => HouseMapper.EntityToBaseDTO(house));
  }

  async create(requestorID: string, createHouseDTOs: CreateHouseDTO) {
    const house = HouseMapper.DTOToEntity(createHouseDTOs);
    //console.log('@Service: \n', house);
    const result = await Promise.all([
      this.administrativeUnitConstraint.AdministrativeUnitIsAlive(
        createHouseDTOs.administrativeUnitID,
      ),
    ]);
    if (result[0]) house.administrativeUnit = result[0];
    this.userProcess.CreatorIsDefaultManager(requestorID, house);
    await this.houseRepository.insert(house);
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateHouseDTO: UpdateHouseDTO,
  ) {
    const house = HouseMapper.DTOToEntity(updateHouseDTO);
    const result = await Promise.all([
      this.constraint.HouseIsAlive(house.houseID),
      this.administrativeUnitConstraint.AdministrativeUnitIsAlive(
        house.administrativeUnitID(),
      ),
      this.userConstraint.ManagerIsAlive(updateHouseDTO.managerID),
    ]);

    let IsAdmin = 0;
    if (result[0])
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result[0],
      );
    this.userConstraint.JustAdminCanUpdateManagerField(IsAdmin, updateHouseDTO);
    if (result[1]) house.administrativeUnit = result[1];
    if (result[2]) house.manager = result[2];
    //console.log('@Service: \n', house);
    await this.houseRepository.update(house.houseID, house);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    houseID: number,
  ) {
    const result = await this.constraint.HouseIsAlive(houseID);
    console.log('@Service: \n', result);
    if (result) {
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
      await this.roomService.trustSoftRemoveMany(result);
    }
    await this.houseRepository.softDelete(houseID);
  }

  async hardRemove(houseIDs: number[]) {
    const result = await this.constraint.HousesIsNotAlive(houseIDs);
    if (result) {
      await Promise.all(
        result.map((house) => this.roomService.trustRemoveMany(house)),
      );
    }
    await this.houseRepository.delete(houseIDs);
  }
  async recover(houseIDs: number[]) {
    await this.constraint.HousesIsNotAlive(houseIDs);
    await this.houseRepository.restore(houseIDs);
  }
}
