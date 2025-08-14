import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateRoomDTO,
  MaxResponseRoomDTO,
  UpdateRoomDTO,
  FindRoomQueryDTO,
} from 'src/dtos/room.dto';
import { RoomMapper } from 'src/mappers/room.mapper';
import { Room } from 'src/models/room.model';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { RoomConstraint } from './constraints/room.helper';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { HouseConstraint } from './constraints/house.helper';
import { House } from 'src/models/house.model';
import { RoomImageService } from './room-image.service';
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
    roomID: number | undefined,
    provinceCode: number | undefined,
    districtCode: number | undefined,
    wardCode: number | undefined,
    houseID: number | undefined,
    minPrice: number | undefined,
    maxPrice: number | undefined,
    isHot: boolean | undefined,
    isEmpty: boolean | undefined,
    name: string | undefined,
    ID_desc_cursor: number | undefined,
    updateAt_desc_cursor: Date | undefined,
    price_asc_cursor: number | undefined,
    order_type: string | undefined,
    requestorRoleIDs: string[],
    additionFilter: FindRoomQueryDTO = {},
    streetID?: number,
  ) {
    // Sử dụng query builder để filter additionInfo (JSON)
    const query = this.roomRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.house', 'house')
      .leftJoinAndSelect('house.administrativeUnit', 'administrativeUnit')
      .leftJoinAndSelect('house.street', 'street')
      .leftJoinAndSelect('room.manager', 'manager')
      .leftJoinAndSelect('room.images', 'images');

    if (roomID || roomID === 0)
      query.andWhere('room.roomID = :roomID', { roomID });
    if (provinceCode)
      query.andWhere('administrativeUnit.provinceCode = :provinceCode', {
        provinceCode,
      });
    if (districtCode)
      query.andWhere('administrativeUnit.districtCode = :districtCode', {
        districtCode,
      });
    if (wardCode)
      query.andWhere('administrativeUnit.wardCode = :wardCode', { wardCode });
    if (houseID) query.andWhere('house.houseID = :houseID', { houseID });
    if (streetID) query.andWhere('street.streetID = :streetID', { streetID });
    if (minPrice) query.andWhere('room.price >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('room.price <= :maxPrice', { maxPrice });
    if (isHot !== undefined) query.andWhere('room.isHot = :isHot', { isHot });
    if (isEmpty !== undefined)
      query.andWhere('room.isEmpty = :isEmpty', { isEmpty });
    if (name) query.andWhere('room.name = :name', { name });

    if (updateAt_desc_cursor && ID_desc_cursor) {
      query.andWhere(
        '(room.updateAt < :updateAt_desc_cursor OR (room.updateAt = :updateAt_desc_cursor AND room.roomID < :roomID_cursor))',
        {
          updateAt_desc_cursor,
          roomID_cursor: ID_desc_cursor,
        },
      );
    } else if (updateAt_desc_cursor) {
      query.andWhere('room.updateAt < :updateAt_desc_cursor', {
        updateAt_desc_cursor,
      });
    }
    if (price_asc_cursor && ID_desc_cursor !== undefined) {
      query.andWhere(
        '(room.price > :price_asc_cursor OR (room.price = :price_asc_cursor AND room.roomID < :roomID_cursor))',
        {
          price_asc_cursor,
          roomID_cursor: ID_desc_cursor,
        },
      );
    } else if (price_asc_cursor) {
      query.andWhere('room.price > :price_asc_cursor', { price_asc_cursor });
    }
    // additionInfo filter (Postgres JSONB)
    // Lọc tất cả các trường trong additionInfo
    if (additionFilter.addition_moveInTime !== undefined)
      query.andWhere(`room."additionInfo"->>'moveInTime' = :moveInTime`, {
        moveInTime: String(additionFilter.addition_moveInTime),
      });
    if (additionFilter.addition_roomType)
      query.andWhere(`room."additionInfo"->>'roomType' = :roomType`, {
        roomType: additionFilter.addition_roomType,
      });
    if (additionFilter.addition_toilet)
      query.andWhere(`room."additionInfo"->>'toilet' = :toilet`, {
        toilet: additionFilter.addition_toilet,
      });
    if (additionFilter.addition_position)
      query.andWhere(`room."additionInfo"->>'position' = :position`, {
        position: additionFilter.addition_position,
      });
    if (additionFilter.addition_gateLock)
      query.andWhere(`room."additionInfo"->>'gateLock' = :gateLock`, {
        gateLock: additionFilter.addition_gateLock,
      });
    if (additionFilter.addition_dryingYard)
      query.andWhere(`room."additionInfo"->>'dryingYard' = :dryingYard`, {
        dryingYard: additionFilter.addition_dryingYard,
      });
    if (additionFilter.addition_activityHours)
      query.andWhere(`room."additionInfo"->>'activityHours' = :activityHours`, {
        activityHours: additionFilter.addition_activityHours,
      });
    if (additionFilter.addition_numberOfVehicles !== undefined)
      query.andWhere(
        `room."additionInfo"->>'numberOfVehicles' = :numberOfVehicles`,
        {
          numberOfVehicles: String(additionFilter.addition_numberOfVehicles),
        },
      );
    if (additionFilter.addition_parkingSpace)
      query.andWhere(`room."additionInfo"->>'parkingSpace' = :parkingSpace`, {
        parkingSpace: additionFilter.addition_parkingSpace,
      });
    if (additionFilter.addition_area)
      query.andWhere(`room."additionInfo"->>'area' = :area`, {
        area: additionFilter.addition_area,
      });
    if (additionFilter.addition_numberOfPeoples !== undefined)
      query.andWhere(
        `room."additionInfo"->>'numberOfPeoples' = :numberOfPeoples`,
        {
          numberOfPeoples: String(additionFilter.addition_numberOfPeoples),
        },
      );
    if (additionFilter.addition_deposit !== undefined)
      query.andWhere(`room."additionInfo"->>'deposit' = :deposit`, {
        deposit: String(additionFilter.addition_deposit),
      });
    if (additionFilter.addition_depositReplenishmentTime !== undefined)
      query.andWhere(
        `room."additionInfo"->>'depositReplenishmentTime' = :depositReplenishmentTime`,
        {
          depositReplenishmentTime: String(
            additionFilter.addition_depositReplenishmentTime,
          ),
        },
      );
    // ...existing boolean filters...
    if (additionFilter.addition_kitchenShelf !== undefined)
      query.andWhere(`room."additionInfo"->>'kitchenShelf' = :kitchenShelf`, {
        kitchenShelf: String(additionFilter.addition_kitchenShelf),
      });
    if (additionFilter.addition_bed !== undefined)
      query.andWhere(`room."additionInfo"->>'bed' = :bed`, {
        bed: String(additionFilter.addition_bed),
      });
    if (additionFilter.addition_sharedOwner !== undefined)
      query.andWhere(`room."additionInfo"->>'sharedOwner' = :sharedOwner`, {
        sharedOwner: String(additionFilter.addition_sharedOwner),
      });
    if (additionFilter.addition_airConditioner !== undefined)
      query.andWhere(
        `room."additionInfo"->>'airConditioner' = :airConditioner`,
        {
          airConditioner: String(additionFilter.addition_airConditioner),
        },
      );
    if (additionFilter.addition_sharedWashingMachine !== undefined)
      query.andWhere(
        `room."additionInfo"->>'sharedWashingMachine' = :sharedWashingMachine`,
        {
          sharedWashingMachine: String(
            additionFilter.addition_sharedWashingMachine,
          ),
        },
      );
    if (additionFilter.addition_window !== undefined)
      query.andWhere(`room."additionInfo"->>'window' = :window`, {
        window: String(additionFilter.addition_window),
      });
    if (additionFilter.addition_tv !== undefined)
      query.andWhere(`room."additionInfo"->>'tv' = :tv`, {
        tv: String(additionFilter.addition_tv),
      });
    if (additionFilter.addition_dishWasher !== undefined)
      query.andWhere(`room."additionInfo"->>'dishWasher' = :dishWasher`, {
        dishWasher: String(additionFilter.addition_dishWasher),
      });
    if (additionFilter.addition_mattress !== undefined)
      query.andWhere(`room."additionInfo"->>'mattress' = :mattress`, {
        mattress: String(additionFilter.addition_mattress),
      });
    if (additionFilter.addition_elevator !== undefined)
      query.andWhere(`room."additionInfo"->>'elevator' = :elevator`, {
        elevator: String(additionFilter.addition_elevator),
      });
    if (additionFilter.addition_skylight !== undefined)
      query.andWhere(`room."additionInfo"->>'skylight' = :skylight`, {
        skylight: String(additionFilter.addition_skylight),
      });
    if (additionFilter.addition_balcony !== undefined)
      query.andWhere(`room."additionInfo"->>'balcony' = :balcony`, {
        balcony: String(additionFilter.addition_balcony),
      });
    if (additionFilter.addition_washingMachine !== undefined)
      query.andWhere(
        `room."additionInfo"->>'washingMachine' = :washingMachine`,
        {
          washingMachine: String(additionFilter.addition_washingMachine),
        },
      );
    if (additionFilter.addition_waterHeater !== undefined)
      query.andWhere(`room."additionInfo"->>'waterHeater' = :waterHeater`, {
        waterHeater: String(additionFilter.addition_waterHeater),
      });
    if (additionFilter.addition_wardrobe !== undefined)
      query.andWhere(`room."additionInfo"->>'wardrobe' = :wardrobe`, {
        wardrobe: String(additionFilter.addition_wardrobe),
      });
    if (additionFilter.addition_security !== undefined)
      query.andWhere(`room."additionInfo"->>'security' = :security`, {
        security: String(additionFilter.addition_security),
      });
    if (additionFilter.addition_pet !== undefined)
      query.andWhere(`room."additionInfo"->>'pet' = :pet`, {
        pet: String(additionFilter.addition_pet),
      });
    if (additionFilter.addition_electricBike !== undefined)
      query.andWhere(`room."additionInfo"->>'electricBike' = :electricBike`, {
        electricBike: String(additionFilter.addition_electricBike),
      });
    if (additionFilter.addition_attic !== undefined)
      query.andWhere(`room."additionInfo"->>'attic' = :attic`, {
        attic: String(additionFilter.addition_attic),
      });
    if (additionFilter.addition_fridge !== undefined)
      query.andWhere(`room."additionInfo"->>'fridge' = :fridge`, {
        fridge: String(additionFilter.addition_fridge),
      });
    // Order
    if (order_type === 'updateAt-desc') query.orderBy('room.updateAt', 'DESC');
    else if (order_type === 'price-asc') query.orderBy('room.price', 'ASC');
    else query.orderBy('room.roomID', 'DESC');
    query.take(+(process.env.DEFAULT_SELECT_LIMIT ?? '10'));
    const rooms = await query.getMany();

    const [roomBlacklist, houseBlacklist] = await Promise.all([
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
      this.userConstraint.UserIsAlive(updateRoomDTO.managerID),
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
