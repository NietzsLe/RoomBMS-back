import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateDepositAgreementDTO,
  MaxResponseDepositAgreementDTO,
  UpdateDepositAgreementDTO,
} from 'src/dtos/deposit-agreement.dto';
import { DepositAgreementMapper } from 'src/mappers/depositAgreement.mapper';
import { DepositAgreement } from 'src/models/deposit-agreement.model';
import {
  And,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { DepositAgreementConstraint } from './constraints/deposit-agreement.helper';
import { RoomConstraint } from './constraints/room.helper';
import { TenantConstraint } from './constraints/tenant.helper';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';
import { ReadRoomDTO } from 'src/dtos/room.dto';
import { ReadHouseDTO } from 'src/dtos/house.dto';
import { ReadTenantDTO } from 'src/dtos/tenant.dto';
import { ReadAppointmentDTO } from 'src/dtos/appointment.dto';
import { ReadUserDTO } from 'src/dtos/user.dto';

@Injectable()
export class DepositAgreementService {
  constructor(
    @InjectRepository(DepositAgreement)
    private depositAgreementRepository: Repository<DepositAgreement>,
    private constraint: DepositAgreementConstraint,
    private userConstraint: UserConstraint,
    private tenantConstraint: TenantConstraint,
    private roomConstraint: RoomConstraint,
    private userProcess: UserProcess,
    private authSerice: AuthService,
  ) {}

  async getForSheet(
    depositAgreementID: number,
    name: string,
    fromDate: Date,
    toDate: Date,
    offsetID: number,
    requestorRoleIDs: string[],
  ) {
    const [
      depositAgreements,
      depositAgreementBlacklist,
      tenantBlacklist,
      roomBlacklist,
      houseBlacklist,
      userBlacklist,
      appointmentBlacklist,
    ] = await Promise.all([
      this.depositAgreementRepository.find({
        where: {
          ...(depositAgreementID || depositAgreementID == 0
            ? { depositAgreementID: depositAgreementID }
            : { depositAgreementID: MoreThan(offsetID) }),
          ...(name ? { name: name } : {}),
          ...(fromDate || toDate
            ? fromDate && !toDate
              ? { depositDeliverDate: MoreThanOrEqual(fromDate) }
              : !fromDate && toDate
                ? { depositDeliverDate: LessThanOrEqual(toDate) }
                : {
                    depositDeliverDate: And(
                      MoreThanOrEqual(fromDate),
                      LessThanOrEqual(toDate),
                    ),
                  }
            : {}),
        },
        order: {
          depositDeliverDate: 'DESC',
        },
        relations: {
          room: { house: { administrativeUnit: true } },
          tenant: true,
          appointment: {
            madeUser: { team: true, manager: true, roles: true },
            takenOverUser: { team: true, manager: true, roles: true },
          },
          manager: true,
        },
      }),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'deposit-agreements:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'tenants:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'rooms:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'houses:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'users:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'appointments:entity',
        PermTypeEnum.READ,
      ),
    ]);
    //console.log('@Service: \n', depositAgreements);

    return depositAgreements.map((depositAgreement) => {
      const dto = DepositAgreementMapper.EntityToReadDTO(depositAgreement);
      removeByBlacklist(dto, depositAgreementBlacklist.blacklist);
      if (dto.room) {
        if (roomBlacklist.canAccess)
          removeByBlacklist(dto.room, roomBlacklist.blacklist);
        else dto.room = new ReadRoomDTO();
      }
      if (dto?.room?.house) {
        if (houseBlacklist.canAccess)
          removeByBlacklist(dto.room.house, houseBlacklist.blacklist);
        else dto.room.house = new ReadHouseDTO();
      }
      if (dto.tenant) {
        if (tenantBlacklist.canAccess)
          removeByBlacklist(dto.tenant, tenantBlacklist.blacklist);
        else dto.tenant = new ReadTenantDTO();
      }
      if (dto.appointment) {
        if (appointmentBlacklist.canAccess)
          removeByBlacklist(dto.appointment, appointmentBlacklist.blacklist);
        else dto.appointment = new ReadAppointmentDTO();
      }
      if (dto?.appointment?.madeUser) {
        if (userBlacklist.canAccess) {
          // 🧑‍💼 Remove blacklist for manager if present
          if (dto?.appointment?.madeUser?.manager) {
            removeByBlacklist(
              dto.appointment.madeUser.manager,
              userBlacklist.blacklist,
            );
          }
          // 🧑‍💼 Remove blacklist for leader if present
          if (dto?.appointment?.madeUser?.leader) {
            removeByBlacklist(
              dto.appointment.madeUser.leader,
              userBlacklist.blacklist,
            );
          }
          removeByBlacklist(dto.appointment.madeUser, userBlacklist.blacklist);
        } else dto.appointment.madeUser = new ReadUserDTO();
      }
      if (dto?.appointment?.takenOverUser) {
        if (userBlacklist.canAccess) {
          // 🧑‍💼 Remove blacklist for manager if present
          if (dto?.appointment?.takenOverUser?.manager) {
            removeByBlacklist(
              dto.appointment.takenOverUser.manager,
              userBlacklist.blacklist,
            );
          }
          // 🧑‍💼 Remove blacklist for leader if present
          if (dto?.appointment?.takenOverUser?.leader) {
            removeByBlacklist(
              dto.appointment.takenOverUser.leader,
              userBlacklist.blacklist,
            );
          }
          removeByBlacklist(
            dto.appointment.takenOverUser,
            userBlacklist.blacklist,
          );
        } else dto.appointment.takenOverUser = new ReadUserDTO();
      }
      return dto;
    });
  }

  async findAll(
    depositAgreementID: number,
    name: string,
    fromDate: Date,
    toDate: Date,
    offsetID: number,
    requestorRoleIDs: string[],
  ) {
    const [
      depositAgreements,
      depositAgreementBlacklist,
      tenantBlacklist,
      roomBlacklist,
      houseBlacklist,
      userBlacklist,
      appointmentBlacklist,
    ] = await Promise.all([
      this.depositAgreementRepository.find({
        where: {
          ...(depositAgreementID || depositAgreementID == 0
            ? { depositAgreementID: depositAgreementID }
            : { depositAgreementID: MoreThan(offsetID) }),
          ...(name ? { name: name } : {}),
          ...(fromDate || toDate
            ? fromDate && !toDate
              ? { depositDeliverDate: MoreThanOrEqual(fromDate) }
              : !fromDate && toDate
                ? { depositDeliverDate: LessThanOrEqual(toDate) }
                : {
                    depositDeliverDate: And(
                      MoreThanOrEqual(fromDate),
                      LessThanOrEqual(toDate),
                    ),
                  }
            : {}),
        },
        order: {
          // depositDeliverDate: 'DESC',
          depositAgreementID: 'ASC',
        },
        relations: {
          room: { house: { administrativeUnit: true } },
          tenant: true,
          appointment: {
            madeUser: { team: true, manager: true, roles: true, leader: true },
            takenOverUser: {
              team: true,
              manager: true,
              roles: true,
              leader: true,
            },
          },
          manager: true,
        },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'deposit-agreements:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'tenants:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'rooms:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'houses:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'users:entity',
        PermTypeEnum.READ,
      ),
      this.authSerice.getBlacklist(
        requestorRoleIDs,
        'appointments:entity',
        PermTypeEnum.READ,
      ),
    ]);
    //console.log('@Service: \n', depositAgreements);

    return depositAgreements.map((depositAgreement) => {
      const dto = DepositAgreementMapper.EntityToReadDTO(depositAgreement);
      console.log(dto);
      removeByBlacklist(dto, depositAgreementBlacklist.blacklist);
      if (dto.room) {
        if (roomBlacklist.canAccess)
          removeByBlacklist(dto.room, roomBlacklist.blacklist);
        else dto.room = new ReadRoomDTO();
      }
      if (dto?.room?.house) {
        if (houseBlacklist.canAccess)
          removeByBlacklist(dto.room.house, houseBlacklist.blacklist);
        else dto.room.house = new ReadHouseDTO();
      }
      if (dto.tenant) {
        if (tenantBlacklist.canAccess)
          removeByBlacklist(dto.tenant, tenantBlacklist.blacklist);
        else dto.tenant = new ReadTenantDTO();
      }
      if (dto.appointment) {
        if (appointmentBlacklist.canAccess)
          removeByBlacklist(dto.appointment, appointmentBlacklist.blacklist);
        else dto.appointment = new ReadAppointmentDTO();
      }
      if (dto?.appointment?.madeUser) {
        if (userBlacklist.canAccess) {
          // 🧑‍💼 Remove blacklist for manager if present
          if (dto?.appointment?.madeUser?.manager) {
            removeByBlacklist(
              dto.appointment.madeUser.manager,
              userBlacklist.blacklist,
            );
          }
          // 🧑‍💼 Remove blacklist for leader if present
          if (dto?.appointment?.madeUser?.leader) {
            removeByBlacklist(
              dto.appointment.madeUser.leader,
              userBlacklist.blacklist,
            );
          }
          removeByBlacklist(dto.appointment.madeUser, userBlacklist.blacklist);
        } else dto.appointment.madeUser = new ReadUserDTO();
      }
      if (dto?.appointment?.takenOverUser) {
        if (userBlacklist.canAccess) {
          // 🧑‍💼 Remove blacklist for manager if present
          if (dto?.appointment?.takenOverUser?.manager) {
            removeByBlacklist(
              dto.appointment.takenOverUser.manager,
              userBlacklist.blacklist,
            );
          }
          // 🧑‍💼 Remove blacklist for leader if present
          if (dto?.appointment?.takenOverUser?.leader) {
            removeByBlacklist(
              dto.appointment.takenOverUser.leader,
              userBlacklist.blacklist,
            );
          }
          removeByBlacklist(
            dto.appointment.takenOverUser,
            userBlacklist.blacklist,
          );
        } else dto.appointment.takenOverUser = new ReadUserDTO();
      }
      return dto;
    });
  }

  async getMaxDepositAgreement() {
    const query = this.depositAgreementRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.depositAgreementID)', 'depositAgreementID');

    const dto = (await query.getRawOne()) as MaxResponseDepositAgreementDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number) {
    console.log('@Service: autocomplete');
    const depositAgreements = await this.depositAgreementRepository.find({
      where: {
        depositAgreementID: MoreThan(offsetID),
      },
      order: {
        depositAgreementID: 'ASC',
      },
      select: { depositAgreementID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    console.log('@Service: \n', depositAgreements);
    return depositAgreements.map((depositAgreement) =>
      DepositAgreementMapper.EntityToReadDTO(depositAgreement),
    );
  }

  async findInactiveAll(depositAgreementID: number, offsetID: number) {
    const depositAgreements = await this.depositAgreementRepository.find({
      where: {
        ...(depositAgreementID || depositAgreementID == 0
          ? { depositAgreementID: depositAgreementID }
          : { depositAgreementID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        depositAgreementID: 'ASC',
      },

      relations: { tenant: true, room: true, manager: true },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', depositAgreements);
    return depositAgreements.map((depositAgreement) =>
      DepositAgreementMapper.EntityToReadDTO(depositAgreement),
    );
  }

  async create(
    requestorID: string,
    createDepositAgreementDTOs: CreateDepositAgreementDTO,
  ) {
    const depositAgreement = DepositAgreementMapper.DTOToEntity(
      createDepositAgreementDTOs,
    );
    //console.log('@Service: \n', depositAgreement);
    const result = await Promise.all([
      this.roomConstraint.RoomIsAlive(createDepositAgreementDTOs.roomID),
      this.tenantConstraint.TenantIsAlive(createDepositAgreementDTOs.tenantID),
    ]);
    if (result[0]) depositAgreement.room = result[0];
    if (result[1]) depositAgreement.tenant = result[1];
    this.userProcess.CreatorIsDefaultManager(requestorID, depositAgreement);

    const insertResult =
      await this.depositAgreementRepository.insert(depositAgreement);
    return {
      depositAgreementID: (
        insertResult.identifiers[0] as { depositAgreementID: number }
      ).depositAgreementID,
    };
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateDepositAgreementDTO: UpdateDepositAgreementDTO,
  ) {
    const depositAgreement = DepositAgreementMapper.DTOToEntity(
      updateDepositAgreementDTO,
    );
    const result = await Promise.all([
      this.constraint.DepositAgreementIsAlive(
        depositAgreement.depositAgreementID,
      ),
      this.roomConstraint.RoomIsAlive(updateDepositAgreementDTO.roomID),
      this.tenantConstraint.TenantIsAlive(updateDepositAgreementDTO.tenantID),
      this.userConstraint.UserIsAlive(updateDepositAgreementDTO.managerID),
    ]);

    let IsAdmin = 0;
    if (result[0])
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result[0],
      );
    this.userConstraint.JustAdminCanUpdateManagerField(
      IsAdmin,
      updateDepositAgreementDTO,
    );
    if (result[1]) depositAgreement.room = result[1];
    if (result[2]) depositAgreement.tenant = result[2];
    if (result[3]) depositAgreement.manager = result[3];
    await this.depositAgreementRepository.update(
      depositAgreement.depositAgreementID,
      depositAgreement,
    );
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    depositAgreementID: number,
  ) {
    const result =
      await this.constraint.DepositAgreementIsAlive(depositAgreementID);
    if (result)
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
    await this.depositAgreementRepository.softDelete(depositAgreementID);
  }

  async hardRemove(depositAgreementIDs: number[]) {
    await this.constraint.DepositAgreementsIsNotAlive(depositAgreementIDs);
    await this.depositAgreementRepository.delete(depositAgreementIDs);
  }
  async recover(depositAgreementIDs: number[]) {
    await this.constraint.DepositAgreementsIsNotAlive(depositAgreementIDs);
    await this.depositAgreementRepository.restore(depositAgreementIDs);
  }
}
