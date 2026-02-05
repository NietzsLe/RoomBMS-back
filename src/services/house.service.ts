import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateHouseDTO,
  MaxResponseHouseDTO,
  UpdateHouseDTO,
} from 'src/dtos/house.dto';
import { HouseMapper } from 'src/mappers/house.mapper';
import { House } from 'src/models/house.model';
import {
  And,
  Equal,
  FindOperator,
  FindOptionsWhere,
  IsNull,
  LessThan,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { AdministrativeUnitConstraint } from './constraints/administrative-unit.helper';
import { RoomService } from './room.service';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';
import { StreetConstraint } from './constraints/street.helper';

@Injectable()
export class HouseService {
  constructor(
    @InjectRepository(House)
    private houseRepository: Repository<House>,
    private constraint: HouseConstraint,
    private userConstraint: UserConstraint,
    private administrativeUnitConstraint: AdministrativeUnitConstraint,
    private streetConstraint: StreetConstraint,
    private userProcess: UserProcess,
    private roomService: RoomService,
    private authService: AuthService,
  ) {}

  async findAll(
    houseID: number,
    name: string,
    provinceCode: number,
    districtCode: number,
    wardCode: number,
    ID_desc_cursor: number,
    updateAt_desc_cursor: Date,
    order_type: string,
    requestorRoleIDs: string[],
  ) {
    const basicWhere: FindOptionsWhere<House> = {
      ...(name ? { name } : {}),
      ...(provinceCode ? { administrativeUnit: { provinceCode } } : {}),
      ...(districtCode ? { administrativeUnit: { districtCode } } : {}),
      ...(wardCode ? { administrativeUnit: { wardCode } } : {}),
    };
    let secondNotEqualOrder: FindOptionsWhere<House> | undefined;
    let secondEqualOrder: FindOptionsWhere<House> | undefined;
    if (ID_desc_cursor) {
      secondEqualOrder = {
        ...secondEqualOrder,
        houseID: basicWhere.houseID
          ? And(
              LessThan(ID_desc_cursor),
              basicWhere.houseID as FindOperator<number>,
            )
          : LessThan(ID_desc_cursor),
      };
    }
    if (updateAt_desc_cursor) {
      secondNotEqualOrder = {
        ...secondNotEqualOrder,
        updateAt: basicWhere.updateAt
          ? And(
              LessThan(updateAt_desc_cursor),
              basicWhere.updateAt as FindOperator<Date>,
            )
          : LessThan(updateAt_desc_cursor),
      };
      secondEqualOrder = {
        ...secondEqualOrder,
        updateAt: basicWhere.updateAt
          ? And(
              Equal(updateAt_desc_cursor),
              basicWhere.updateAt as FindOperator<Date>,
            )
          : Equal(updateAt_desc_cursor),
      };
    }
    const where:
      | FindOptionsWhere<House>
      | FindOptionsWhere<House>[]
      | undefined = [
      {
        ...basicWhere,
        ...(houseID || houseID === 0 ? { houseID: Equal(houseID) } : {}),
        ...secondEqualOrder,
      },
      {
        ...basicWhere,
        ...(houseID || houseID === 0 ? { houseID: Equal(houseID) } : {}),
        ...secondNotEqualOrder,
      },
    ];
    const [houses, houseBlacklist] = await Promise.all([
      this.houseRepository.find({
        where: where,
        order: {
          ...(order_type == 'updateAt-desc' ? { updateAt: 'DESC' } : {}),
          houseID: 'DESC',
        },
        relations: { manager: true, administrativeUnit: true, street: true },
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
    //console.log('@Service: autocomplete');
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
    const [administrativeUnit, street] = await Promise.all([
      this.administrativeUnitConstraint.AdministrativeUnitIsAlive(
        createHouseDTOs.administrativeUnitID,
      ),
      this.streetConstraint.StreetIsAlive(createHouseDTOs.streetID),
    ]);
    if (administrativeUnit) house.administrativeUnit = administrativeUnit;
    if (street) house.street = street;
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

    //console.log('@Service: \n', updateHouseDTO);
    const [houseAlive, administrativeUnit, manager, street] = await Promise.all(
      [
        this.constraint.HouseIsAlive(updateHouseDTO.houseID),
        this.administrativeUnitConstraint.AdministrativeUnitIsAlive(
          updateHouseDTO.administrativeUnitID,
        ),
        this.userConstraint.UserIsAlive(updateHouseDTO.managerID),
        this.streetConstraint.StreetIsAlive(updateHouseDTO.streetID),
      ],
    );

    let IsAdmin = 0;
    if (houseAlive)
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        houseAlive,
      );
    this.userConstraint.JustAdminCanUpdateManagerField(IsAdmin, updateHouseDTO);
    if (administrativeUnit) house.administrativeUnit = administrativeUnit;
    if (manager) house.manager = manager;
    if (street) house.street = street;
    await this.houseRepository.update(house.houseID, house);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    houseID: number,
  ) {
    const result = await this.constraint.HouseIsAlive(houseID);
    //console.log('@Service: \n', result);
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
