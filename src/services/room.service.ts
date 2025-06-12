import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateRoomDTO,
  MaxResponseRoomDTO,
  UpdateRoomDTO,
} from 'src/dtos/roomDTO';
import { RoomMapper } from 'src/mappers/room.mapper';
import { Room } from 'src/models/room.model';
import {
  And,
  Equal,
  FindOperator,
  FindOptionsWhere,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { RoomConstraint } from './constraints/room.helper';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { House } from 'src/models/house.model';
import { RoomImageService } from './roomImage.service';
import { removeByBlacklist } from './helper';
import { AuthService, PermTypeEnum } from './auth.service';

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
    private authService: AuthService,
  ) {}

  async findAll(
    roomID: number,
    provinceCode: number,
    districtCode: number,
    wardCode: number,
    houseID: number,
    minPrice: number,
    maxPrice: number,
    isHot: boolean,
    isEmpty: boolean,
    name: string,
    ID_desc_cursor: number,
    updateAt_desc_cursor: Date,
    price_asc_cursor: number,
    order_type: string,
    requestorRoleIDs: string[],
  ) {
    const basicWhere: FindOptionsWhere<Room> | FindOptionsWhere<Room>[] = {
      ...(provinceCode
        ? { administrativeUnit: { provinceCode: provinceCode } }
        : {}),
      ...(districtCode
        ? { administrativeUnit: { districtCode: districtCode } }
        : {}),
      ...(wardCode ? { administrativeUnit: { wardCode: wardCode } } : {}),
      ...(houseID ? { house: { houseID: houseID } } : {}),
      ...(minPrice || maxPrice
        ? minPrice && !maxPrice
          ? { price: MoreThanOrEqual(minPrice) }
          : !minPrice && maxPrice
            ? { price: LessThanOrEqual(maxPrice) }
            : {
                price: And(
                  MoreThanOrEqual(minPrice),
                  LessThanOrEqual(maxPrice),
                ),
              }
        : {}),
      ...(isHot ? { isHot: isHot } : {}),
      ...(!(!isEmpty && isEmpty != false) ? { isEmpty: isEmpty } : {}),
      ...(name ? { name: name } : {}),
    };
    let where: FindOptionsWhere<Room> | FindOptionsWhere<Room>[] | undefined;
    if (roomID || roomID == 0) {
      basicWhere.roomID = Equal(roomID);
      where = basicWhere;
    } else {
      let secondNotEqualOrder:
        | FindOptionsWhere<Room>
        | FindOptionsWhere<Room>[]
        | undefined;
      let secondEqualOrder:
        | FindOptionsWhere<Room>
        | FindOptionsWhere<Room>[]
        | undefined;
      if (ID_desc_cursor) {
        secondEqualOrder = {
          ...secondEqualOrder,
          roomID: basicWhere.roomID
            ? And(
                LessThan(ID_desc_cursor),
                basicWhere.roomID as FindOperator<number>,
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
      if (price_asc_cursor) {
        secondNotEqualOrder = {
          ...secondNotEqualOrder,
          price: basicWhere.price
            ? And(
                MoreThan(price_asc_cursor),
                basicWhere.price as FindOperator<number>,
              )
            : MoreThan(price_asc_cursor),
        };
        secondEqualOrder = {
          ...secondEqualOrder,
          price: basicWhere.price
            ? And(
                Equal(price_asc_cursor),
                basicWhere.price as FindOperator<number>,
              )
            : Equal(price_asc_cursor),
        };
      }

      where = [
        {
          ...basicWhere,
          ...secondEqualOrder,
        },
        { ...basicWhere, ...secondNotEqualOrder },
      ];
    }

    const [rooms, roomBlacklist, houseBlacklist] = await Promise.all([
      this.roomRepository.find({
        where: where,
        order: {
          ...(order_type == 'updateAt-desc' ? { updateAt: 'DESC' } : {}),
          ...(order_type == 'price-asc' ? { price: 'ASC' } : {}),
          roomID: 'DESC',
        },
        relations: {
          house: {
            administrativeUnit: true,
          },
          manager: true,
          images: true,
        },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'rooms:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'houses:entity',
        PermTypeEnum.READ,
      ),
    ]);
    return rooms.map((room) => {
      const dto = RoomMapper.EntityToReadDTO(room);
      removeByBlacklist(dto, roomBlacklist.blacklist);
      if (dto.house) {
        removeByBlacklist(dto.house, houseBlacklist.blacklist);
      }
      return dto;
    });
  }

  async getMaxRoom(houseID: number) {
    const query = this.roomRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.roomID)', 'roomID');
    if (houseID) {
      query.where('entity.houseID = :houseID', { houseID: houseID });
    }
    const dto = (await query.getRawOne()) as MaxResponseRoomDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number, houseID: number) {
    console.log('@Service: autocomplete');
    const rooms = await this.roomRepository.find({
      where: {
        roomID: MoreThan(offsetID),
        ...(houseID ? { house: { houseID: houseID } } : {}),
      },
      order: {
        roomID: 'ASC',
      },
      select: { roomID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    console.log('@Service: \n', rooms);
    return rooms.map((room) => RoomMapper.EntityToReadDTO(room));
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
    return rooms.map((room) => RoomMapper.EntityToReadDTO(room));
  }

  async create(requestorID: string, createRoomDTOs: CreateRoomDTO) {
    const room = RoomMapper.DTOToEntity(createRoomDTOs);
    //console.log('@Service: \n', room);
    const result = await Promise.all([
      this.houseConstraint.HouseIsAlive(createRoomDTOs.houseID),
    ]);
    if (result[0]) room.house = result[0];
    this.userProcess.CreatorIsDefaultManager(requestorID, room);

    const insertResult = await this.roomRepository.insert(room);
    return {
      roomID: (insertResult.identifiers[0] as { roomID: number }).roomID,
    };
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateRoomDTO: UpdateRoomDTO,
  ) {
    const room = RoomMapper.DTOToEntity(updateRoomDTO);
    const result = await Promise.all([
      this.constraint.RoomIsAlive(room.roomID),
      this.houseConstraint.HouseIsAlive(room.house?.houseID),
      this.userConstraint.ManagerIsAlive(updateRoomDTO.managerID),
    ]);

    let IsAdmin = 0;
    if (result[0]) {
      if (!updateRoomDTO.areAllPropertiesUndefinedExcludeEmptyAndHot()) {
        IsAdmin = this.userConstraint.RequestorManageNonUserResource(
          requestorRoleIDs,
          requestorID,
          result[0],
        );
      } else IsAdmin = this.userConstraint.RequestorIsAdmin(requestorRoleIDs);
    }

    this.userConstraint.JustAdminCanUpdateManagerField(IsAdmin, updateRoomDTO);
    if (result[1]) room.house = result[1];
    if (result[2]) room.manager = result[2];
    console.log('@Service: \n', room);
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
