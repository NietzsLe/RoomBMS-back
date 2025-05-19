import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateHouseDTO,
  MaxResponseHouseDTO,
  UpdateHouseDTO,
} from 'src/dtos/houseDTO';
import { HouseMapper } from 'src/mappers/house.mapper';
import { House } from 'src/models/house.model';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { AdministrativeUnitConstraint } from './constraints/administrativeUnit.helper';
import { RoomService } from './room.service';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';

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
    private authService: AuthService,
  ) {}

  async findAll(
    houseID: number,
    name: string,
    offsetID: number,
    requestorRoleIDs: string[],
  ) {
    const [houses, houseBlacklist] = await Promise.all([
      this.houseRepository.find({
        where: {
          ...(houseID || houseID == 0
            ? { houseID: houseID }
            : { houseID: MoreThan(offsetID) }),
          ...(name ? { name: name } : {}),
        },
        order: {
          houseID: 'ASC',
        },
        relations: { manager: true },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'houses',
        PermTypeEnum.READ,
      ),
    ]);
    //console.log('@Service: \n', houses);
    return houses.map((house) => {
      const dto = HouseMapper.EntityToReadDTO(house);
      removeByBlacklist(dto, houseBlacklist.blacklist);
      return dto;
    });
  }

  async getMaxHouse() {
    const query = this.houseRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.houseID)', 'houseID');

    const dto = (await query.getRawOne()) as MaxResponseHouseDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number) {
    console.log('@Service: autocomplete');
    const houses = await this.houseRepository.find({
      where: {
        houseID: MoreThan(offsetID),
      },
      order: {
        houseID: 'ASC',
      },
      select: { houseID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', houses);
    return houses.map((house) => HouseMapper.EntityToReadDTO(house));
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
    return houses.map((house) => HouseMapper.EntityToReadDTO(house));
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

    const insertResult = await this.houseRepository.insert(house);
    return {
      houseID: (insertResult.identifiers[0] as { houseID: number }).houseID,
    };
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateHouseDTO: UpdateHouseDTO,
  ) {
    const house = HouseMapper.DTOToEntity(updateHouseDTO);

    console.log('@Service: \n', updateHouseDTO);
    const result = await Promise.all([
      this.constraint.HouseIsAlive(updateHouseDTO.houseID),
      this.administrativeUnitConstraint.AdministrativeUnitIsAlive(
        updateHouseDTO.administrativeUnitID,
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
