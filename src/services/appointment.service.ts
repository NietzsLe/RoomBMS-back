import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAppointmentDTO,
  MaxResponseAppointmentDTO,
  TakenOverAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentForRelatedUserDTO,
  UpdateDepositAgreementForRelatedUserDTO,
  UpdateTenantForRelatedUserDTO,
} from 'src/dtos/appointmentDTO';
import { AppointmentMapper } from 'src/mappers/appointment.mapper';
import { Appointment } from 'src/models/appointment.model';
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
import { UserConstraint, UserProcess } from './constraints/user.helper';
import {
  AppointmentConstraint,
  AppointmentProcess,
} from './constraints/appointment.helper';
import { RoomConstraint } from './constraints/room.helper';
import { TenantConstraint } from './constraints/tenant.helper';
import { DepositAgreementConstraint } from './constraints/depositAgreement.helper';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import { Tenant } from 'src/models/tenant.model';
// import { TelegramBotService } from './telegramBot.service';

import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';
import { ReadRoomDTO } from 'src/dtos/roomDTO';
import { ReadHouseDTO } from 'src/dtos/houseDTO';
import { ReadTenantDTO } from 'src/dtos/tenantDTO';
import { ReadUserDTO } from 'src/dtos/userDTO';
import { ReadDepositAgreementDTO } from 'src/dtos/depositAgreementDTO';
import { AppointmentStatus } from 'src/models/helper';
import { plainToClass } from '@nestjs/class-transformer';
import { DiscordService } from './discordBot.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(DepositAgreement)
    private depositAgreementRepository: Repository<DepositAgreement>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private constraint: AppointmentConstraint,
    private userConstraint: UserConstraint,
    private tenantConstraint: TenantConstraint,
    private roomConstraint: RoomConstraint,
    private depositAgreementConstraint: DepositAgreementConstraint,
    private userProcess: UserProcess,
    private process: AppointmentProcess,
    // private telegramBotService: TelegramBotService,
    private discordService: DiscordService,
    private authService: AuthService,
  ) {}

  async findAll(
    appointmentID: number,
    name: string,
    houseID: number,
    roomID: number,
    fromDate: Date,
    toDate: Date,
    status: string,
    relatedUsername: string,
    relatedTeamID: string,
    ID_desc_cursor: number,
    appointmentTime_desc_cursor: Date | null,
    appointmentTime_asc_cursor: Date | null,
    order_type: string,
    requestorRoleIDs: string[],
    requestorID: string,
  ) {
    let isAdmin = false;
    for (const roleID of requestorRoleIDs) {
      if (
        roleID == process.env.SUPER_ADMIN_ROLEID ||
        roleID == process.env.ADMIN_ROLEID ||
        roleID == process.env.APPOINTMENT_ADMIN_ROLEID
      ) {
        isAdmin = true;
        break;
      }
    }
    const basicWhere:
      | FindOptionsWhere<Appointment>
      | FindOptionsWhere<Appointment>[] = {
      ...(name ? { name: name } : {}),
      ...(houseID ? { house: { houseID: houseID } } : {}),
      ...(roomID ? { room: { roomID: roomID } } : {}),
      ...(fromDate || toDate
        ? fromDate && !toDate
          ? { appointmentTime: MoreThanOrEqual(fromDate) }
          : !fromDate && toDate
            ? { appointmentTime: LessThanOrEqual(toDate) }
            : {
                appointmentTime: And(
                  MoreThanOrEqual(fromDate),
                  LessThanOrEqual(toDate),
                ),
              }
        : {}),
      ...(status
        ? {
            status:
              (status as AppointmentStatus) == AppointmentStatus.EXTRA_CARE
                ? AppointmentStatus.EXTRA_CARE
                : (status as AppointmentStatus) ==
                    AppointmentStatus.NOT_YET_RECEIVED
                  ? AppointmentStatus.NOT_YET_RECEIVED
                  : (status as AppointmentStatus) == AppointmentStatus.RECEIVED
                    ? AppointmentStatus.RECEIVED
                    : AppointmentStatus.SUCCESS,
          }
        : {}),
    };
    let where:
      | FindOptionsWhere<Appointment>
      | FindOptionsWhere<Appointment>[]
      | undefined;
    if (appointmentID || appointmentID == 0) {
      basicWhere.appointmentID = Equal(appointmentID);
      where = basicWhere;
    } else {
      console.log('@Appointment Serice: here');
      let secondNotEqualOrder:
        | FindOptionsWhere<Appointment>
        | FindOptionsWhere<Appointment>[]
        | undefined;
      let secondEqualOrder:
        | FindOptionsWhere<Appointment>
        | FindOptionsWhere<Appointment>[]
        | undefined;
      if (ID_desc_cursor) {
        secondEqualOrder = {
          ...secondEqualOrder,
          appointmentID: basicWhere.appointmentID
            ? And(
                LessThan(ID_desc_cursor),
                basicWhere.appointmentID as FindOperator<number>,
              )
            : LessThan(ID_desc_cursor),
        };
      }
      if (appointmentTime_desc_cursor) {
        secondNotEqualOrder = {
          ...secondNotEqualOrder,
          appointmentTime: basicWhere.appointmentTime
            ? And(
                LessThan(appointmentTime_desc_cursor),
                basicWhere.appointmentTime as FindOperator<Date>,
              )
            : LessThan(appointmentTime_desc_cursor),
        };
        secondEqualOrder = {
          ...secondEqualOrder,
          appointmentTime: basicWhere.appointmentTime
            ? And(
                Equal(appointmentTime_desc_cursor),
                basicWhere.appointmentTime as FindOperator<Date>,
              )
            : Equal(appointmentTime_desc_cursor),
        };
      }
      if (appointmentTime_asc_cursor) {
        secondNotEqualOrder = {
          ...secondNotEqualOrder,
          appointmentTime: basicWhere.appointmentTime
            ? And(
                MoreThan(appointmentTime_asc_cursor),
                basicWhere.appointmentTime as FindOperator<Date>,
              )
            : MoreThan(appointmentTime_asc_cursor),
        };
        secondEqualOrder = {
          ...secondEqualOrder,
          appointmentTime: basicWhere.appointmentTime
            ? And(
                Equal(appointmentTime_asc_cursor),
                basicWhere.appointmentTime as FindOperator<Date>,
              )
            : Equal(appointmentTime_asc_cursor),
        };
      }
      if (isAdmin) {
        where = [
          {
            ...(relatedTeamID || relatedUsername
              ? {
                  takenOverUser:
                    relatedTeamID && relatedUsername
                      ? {
                          team: { teamID: relatedTeamID },
                          username: relatedUsername,
                        }
                      : relatedTeamID
                        ? { team: { teamID: relatedTeamID } }
                        : { username: relatedUsername },
                }
              : {}),
            ...basicWhere,
            ...secondEqualOrder,
          },
          {
            ...(relatedTeamID || relatedUsername
              ? {
                  takenOverUser:
                    relatedTeamID && relatedUsername
                      ? {
                          team: { teamID: relatedTeamID },
                          username: relatedUsername,
                        }
                      : relatedTeamID
                        ? { team: { teamID: relatedTeamID } }
                        : { username: relatedUsername },
                }
              : {}),
            ...basicWhere,
            ...secondNotEqualOrder,
          },
          {
            ...(relatedTeamID || relatedUsername
              ? {
                  madeUser:
                    relatedTeamID && relatedUsername
                      ? {
                          team: { teamID: relatedTeamID },
                          username: relatedUsername,
                        }
                      : relatedTeamID
                        ? { team: { teamID: relatedTeamID } }
                        : { username: relatedUsername },
                }
              : {}),
            ...basicWhere,
            ...secondEqualOrder,
          },
          {
            ...(relatedTeamID || relatedUsername
              ? {
                  madeUser:
                    relatedTeamID && relatedUsername
                      ? {
                          team: { teamID: relatedTeamID },
                          username: relatedUsername,
                        }
                      : relatedTeamID
                        ? { team: { teamID: relatedTeamID } }
                        : { username: relatedUsername },
                }
              : {}),
            ...basicWhere,
            ...secondNotEqualOrder,
          },
        ];
      } else {
        if (relatedTeamID || relatedUsername) {
          where = [
            {
              takenOverUser:
                relatedTeamID && relatedUsername
                  ? {
                      team: { teamID: relatedTeamID },
                      username: relatedUsername,
                    }
                  : relatedTeamID
                    ? { team: { teamID: relatedTeamID } }
                    : { username: relatedUsername },
              ...basicWhere,
              ...secondEqualOrder,
            },
            {
              takenOverUser:
                relatedTeamID && relatedUsername
                  ? {
                      team: { teamID: relatedTeamID },
                      username: relatedUsername,
                    }
                  : relatedTeamID
                    ? { team: { teamID: relatedTeamID } }
                    : { username: relatedUsername },
              ...basicWhere,
              ...secondNotEqualOrder,
            },
            {
              madeUser:
                relatedTeamID && relatedUsername
                  ? {
                      team: { teamID: relatedTeamID },
                      username: relatedUsername,
                    }
                  : relatedTeamID
                    ? { team: { teamID: relatedTeamID } }
                    : { username: relatedUsername },
              ...basicWhere,
              ...secondEqualOrder,
            },
            {
              madeUser:
                relatedTeamID && relatedUsername
                  ? {
                      team: { teamID: relatedTeamID },
                      username: relatedUsername,
                    }
                  : relatedTeamID
                    ? { team: { teamID: relatedTeamID } }
                    : { username: relatedUsername },
              ...basicWhere,
              ...secondNotEqualOrder,
            },
          ];
        } else {
          where = [
            {
              takenOverUser: [
                { team: { leader: { username: requestorID } } },
                { manager: { username: requestorID } },
                { username: requestorID },
              ],
              ...basicWhere,
              ...secondEqualOrder,
            },
            {
              takenOverUser: [
                { team: { leader: { username: requestorID } } },
                { manager: { username: requestorID } },
                { username: requestorID },
              ],
              ...basicWhere,
              ...secondNotEqualOrder,
            },
            {
              madeUser: [
                { team: { leader: { username: requestorID } } },
                { manager: { username: requestorID } },
                { username: requestorID },
              ],
              ...basicWhere,
              ...secondEqualOrder,
            },
            {
              madeUser: [
                { team: { leader: { username: requestorID } } },
                { manager: { username: requestorID } },
                { username: requestorID },
              ],
              ...basicWhere,
              ...secondNotEqualOrder,
            },
          ];
        }
      }
    }

    // Thêm filter theo relatedTeamID nếu có
    if (relatedTeamID) {
      if (isAdmin) {
        basicWhere['madeUser'] = { team: { teamID: relatedTeamID } };
        basicWhere['takenOverUser'] = { team: { teamID: relatedTeamID } };
      } else {
        // Nếu không phải admin, chỉ lọc theo team của madeUser hoặc takenOverUser liên quan đến requestor
        basicWhere['madeUser'] = [{ team: { teamID: relatedTeamID } }];
        basicWhere['takenOverUser'] = [{ team: { teamID: relatedTeamID } }];
      }
    }

    const [
      appointments,
      tenantBlacklist,
      roomBlacklist,
      depositAgreementBlacklist,
      userBlacklist,
      houseBlacklist,
      appointmentBlacklist,
    ] = await Promise.all([
      this.appointmentRepository.find({
        where: where,
        order: {
          ...(order_type == 'appointmentTime-desc'
            ? { appointmentTime: 'DESC' }
            : {}),
          ...(order_type == 'appointmentTime-asc'
            ? { appointmentTime: 'ASC' }
            : {}),
          appointmentID: 'DESC',
        },
        relations: {
          room: { house: { administrativeUnit: true } },
          depositAgreement: { room: { house: { administrativeUnit: true } } },
          takenOverUser: { team: true, roles: true, manager: true },
          madeUser: { team: true, roles: true, manager: true },
          tenant: true,
          manager: true,
        },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'tenants:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'rooms:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'deposit-agreements:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'users:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'houses:entity',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'appointments:entity',
        PermTypeEnum.READ,
      ),
    ]);
    const dto = appointments.map((appointment) => {
      const dto = AppointmentMapper.EntityToReadDTO(appointment);
      removeByBlacklist(dto, appointmentBlacklist.blacklist);

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
        if (tenantBlacklist.canAccess) {
          removeByBlacklist(dto.tenant, tenantBlacklist.blacklist);
          if (
            !this.constraint.JustRelatedUserCanSeeTenantPhone(
              appointment,
              requestorID,
            )
          )
            delete dto.tenant['phoneNumber'];
        } else dto.tenant = new ReadTenantDTO();
      }
      if (dto?.madeUser) {
        if (userBlacklist.canAccess) {
          if (dto?.madeUser?.manager) {
            removeByBlacklist(dto.madeUser.manager, userBlacklist.blacklist);
          }
          removeByBlacklist(dto.madeUser, userBlacklist.blacklist);
        } else dto.madeUser = new ReadUserDTO();
      }
      if (dto?.takenOverUser) {
        if (userBlacklist.canAccess) {
          if (dto?.takenOverUser?.manager) {
            removeByBlacklist(
              dto.takenOverUser.manager,
              userBlacklist.blacklist,
            );
          }
          removeByBlacklist(dto.takenOverUser, userBlacklist.blacklist);
        } else dto.takenOverUser = new ReadUserDTO();
      }
      if (dto.depositAgreement) {
        if (depositAgreementBlacklist.canAccess) {
          removeByBlacklist(
            dto.depositAgreement,
            depositAgreementBlacklist.blacklist,
          );
          if (dto?.depositAgreement?.room) {
            if (roomBlacklist.canAccess)
              removeByBlacklist(
                dto?.depositAgreement?.room,
                roomBlacklist.blacklist,
              );
            else dto.depositAgreement.room = new ReadRoomDTO();
          }
          if (dto?.depositAgreement?.room?.house) {
            if (houseBlacklist.canAccess)
              removeByBlacklist(
                dto?.depositAgreement?.room.house,
                houseBlacklist.blacklist,
              );
            else dto.depositAgreement.room.house = new ReadHouseDTO();
          }
        } else dto.depositAgreement = new ReadDepositAgreementDTO();
      }
      return dto;
    });
    console.log(roomBlacklist.blacklist);
    return dto;
  }

  async getMaxAppointment() {
    const query = this.appointmentRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.appointmentID)', 'appointmentID');
    const dto = (await query.getRawOne()) as MaxResponseAppointmentDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number) {
    console.log('@Service: autocomplete', offsetID);
    const appointments = await this.appointmentRepository.find({
      where: {
        appointmentID: MoreThan(offsetID),
      },
      order: {
        appointmentID: 'ASC',
      },
      select: { appointmentID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', appointments);
    return appointments.map((appointment) =>
      AppointmentMapper.EntityToReadDTO(appointment),
    );
  }

  async findInactiveAll(appointmentID: number, offsetID: number) {
    const appointments = await this.appointmentRepository.find({
      where: {
        ...(appointmentID || appointmentID == 0
          ? { appointmentID: appointmentID }
          : { appointmentID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        appointmentID: 'ASC',
      },
      relations: {
        takenOverUser: true,
        madeUser: true,
        room: true,
        depositAgreement: true,
      },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', appointments);
    return appointments.map((appointment) =>
      AppointmentMapper.EntityToReadDTO(appointment),
    );
  }

  async create(
    requestorID: string,
    createAppointmentDTOs: CreateAppointmentDTO,
  ) {
    const appointment = AppointmentMapper.DTOToEntity(createAppointmentDTOs);
    //console.log('@Service: \n', appointment);
    const result = await Promise.all([
      this.roomConstraint.RoomIsAlive(createAppointmentDTOs.roomID),
      this.tenantConstraint.TenantIsAlive(createAppointmentDTOs.tenantID),
    ]);
    if (result[0]) appointment.room = result[0];
    if (result[1]) appointment.tenant = result[1];
    this.userProcess.CreatorIsDefaultManager(requestorID, appointment);
    this.process.RequestorIsMadeUserWhenCreate(requestorID, appointment);

    const insertResult = await this.appointmentRepository.insert(appointment);
    await this.discordService.notifyCreateAppointment(
      (insertResult.identifiers[0] as { appointmentID: number }).appointmentID,
    );
    return {
      appointmentID: (insertResult.identifiers[0] as { appointmentID: number })
        .appointmentID,
    };
  }

  async takenOver(requestorID: string, dto: TakenOverAppointmentDTO) {
    const appointment = new Appointment();
    appointment.appointmentID = dto.appointmentID;

    const result = await Promise.all([
      this.constraint.AppointmentIsAlive(appointment.appointmentID),
      this.userConstraint.UserIsAlive(dto.takenOverUsername),
    ]);
    if (result[0]) this.constraint.NoUserTakeOver(requestorID, result[0]);
    if (result[1]) {
      appointment.takenOverUser = result[1];
    }
    appointment.status = AppointmentStatus.RECEIVED;
    await this.appointmentRepository.update(
      appointment.appointmentID,
      appointment,
    );
  }

  async updateByRelatedUser(
    requestorRoleIDs: string[],
    requestorID: string,
    updateAppointmentDTO: UpdateAppointmentForRelatedUserDTO,
  ) {
    const appointment = AppointmentMapper.DTOToEntity(updateAppointmentDTO);
    const result = await Promise.all([
      this.constraint.AppointmentIsAlive(appointment.appointmentID),
      this.depositAgreementConstraint.DepositAgreementIsAlive(
        updateAppointmentDTO.depositAgreementID,
      ),
      this.userConstraint.UserIsAlive(updateAppointmentDTO.takenOverUsername),
    ]);

    if (result[0])
      this.constraint.IsRelatedUser(requestorRoleIDs, requestorID, result[0]);
    if (result[1]) appointment.depositAgreement = result[1];
    if (result[2]) appointment.takenOverUser = result[2];
    console.log('@Service: \n', appointment);
    await this.appointmentRepository.save(appointment);
    if (updateAppointmentDTO.status && result[0])
      await this.discordService.notifyReturnDepositAgreementResult(
        appointment.appointmentID,
        result[0].status,
      );

    if (updateAppointmentDTO.appointmentTime)
      await this.discordService.notifyWhenChangeAppointmentTime(
        appointment.appointmentID,
      );
  }

  async updateTenantByRelatedUser(
    requestorRoleIDs: string[],
    requestorID: string,
    updateTenantDTO: UpdateTenantForRelatedUserDTO,
  ) {
    const tenant = AppointmentMapper.OtherResourceDTOToEntity(
      updateTenantDTO,
      Tenant,
    );
    const result = await Promise.all([
      this.constraint.AppointmentIsAlive(updateTenantDTO.appointmentID),
      this.tenantConstraint.TenantIsAlive(updateTenantDTO.tenantID),
    ]);

    if (result[0])
      this.constraint.IsRelatedUser(requestorRoleIDs, requestorID, result[0]);
    if (result[1]) {
      //console.log('@Service: \n', appointment);
      await this.tenantRepository.update(tenant.tenantID, tenant);
    }
  }
  async updateDepositAgreementByRelatedUser(
    requestorRoleIDs: string[],
    requestorID: string,
    updateDepositAgreementDTO: UpdateDepositAgreementForRelatedUserDTO,
  ) {
    const depositAgreement = AppointmentMapper.OtherResourceDTOToEntity(
      updateDepositAgreementDTO,
      DepositAgreement,
    );
    const result = await Promise.all([
      this.constraint.AppointmentIsAlive(
        updateDepositAgreementDTO.appointmentID,
      ),
      this.depositAgreementConstraint.DepositAgreementIsAlive(
        updateDepositAgreementDTO.depositAgreementID,
      ),
    ]);

    if (result[0])
      this.constraint.IsRelatedUser(requestorRoleIDs, requestorID, result[0]);

    if (result[1]) {
      //console.log('@Service: \n', appointment);
      await this.depositAgreementRepository.update(
        depositAgreement.depositAgreementID,
        depositAgreement,
      );
      await this.discordService.notifyCancelDepositAgreement(
        updateDepositAgreementDTO.appointmentID,
      );
    }
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateAppointmentDTO: UpdateAppointmentDTO,
  ) {
    const appointment = AppointmentMapper.DTOToEntity(
      plainToClass(UpdateAppointmentDTO, updateAppointmentDTO),
    );
    const result = await Promise.all([
      this.constraint.AppointmentIsAlive(appointment.appointmentID),
      this.userConstraint.UserIsAlive(updateAppointmentDTO.takenOverUsername),
      this.userConstraint.UserIsAlive(updateAppointmentDTO.madeUsername),
      this.roomConstraint.RoomIsAlive(updateAppointmentDTO.roomID),
      this.tenantConstraint.TenantIsAlive(updateAppointmentDTO.tenantID),
      this.depositAgreementConstraint.DepositAgreementIsAlive(
        updateAppointmentDTO.depositAgreementID,
      ),
      this.userConstraint.ManagerIsAlive(updateAppointmentDTO.managerID),
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
      updateAppointmentDTO,
    );
    if (result[1]) {
      appointment.takenOverUser = result[1];
      if (
        result[0] &&
        !(result[0].status == AppointmentStatus.NOT_YET_RECEIVED)
      ) {
        appointment.status = AppointmentStatus.RECEIVED;
      }
    }
    if (result[2]) appointment.madeUser = result[2];
    if (result[3]) appointment.room = result[3];
    if (result[4]) appointment.tenant = result[4];
    if (result[5]) appointment.depositAgreement = result[5];
    if (result[6]) appointment.manager = result[6];
    //console.log('@Service: \n', appointment);
    await this.appointmentRepository.update(
      appointment.appointmentID,
      appointment,
    );
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    appointmentID: number,
  ) {
    const result = await this.constraint.AppointmentIsAlive(appointmentID);
    if (result)
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
    await this.appointmentRepository.softDelete(appointmentID);
  }

  async hardRemove(appointmentIDs: number[]) {
    await this.constraint.AppointmentsIsNotAlive(appointmentIDs);
    await this.appointmentRepository.delete(appointmentIDs);
  }
  async recover(appointmentIDs: number[]) {
    await this.constraint.AppointmentsIsNotAlive(appointmentIDs);
    await this.appointmentRepository.restore(appointmentIDs);
  }
}
