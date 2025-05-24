import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAppointmentDTO,
  MaxResponseAppointmentDTO,
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
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Or,
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
import { User } from 'src/models/user.model';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import { Tenant } from 'src/models/tenant.model';
import { TelegramBotService } from './telegramBot.service';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';
import { ReadRoomDTO } from 'src/dtos/roomDTO';
import { ReadHouseDTO } from 'src/dtos/houseDTO';
import { ReadTenantDTO } from 'src/dtos/tenantDTO';
import { ReadUserDTO } from 'src/dtos/userDTO';
import { ReadDepositAgreementDTO } from 'src/dtos/depositAgreementDTO';
import { AppointmentStatus } from 'src/models/helper';
import { plainToClass } from '@nestjs/class-transformer';

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
    private telegramBotService: TelegramBotService,
    private authService: AuthService,
  ) {}

  async findAll(
    appointmentID: number,
    offsetID: number,
    name: string,
    houseID: number,
    roomID: number,
    fromDate: Date,
    toDate: Date,
    status: string,
    requestorRoleIDs: string[],
    requestorID: string,
  ) {
    let isAdmin = false;
    for (const roleID of requestorRoleIDs) {
      if (
        roleID == process.env.SUPER_ADMIN_ROLEID ||
        roleID == process.env.ADMIN_ROLEID
      ) {
        isAdmin = true;
        break;
      }
    }
    const basicWhere:
      | FindOptionsWhere<Appointment>
      | FindOptionsWhere<Appointment>[]
      | undefined = {
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
        ? status == 'not-end'
          ? {
              status: Or(
                Equal(AppointmentStatus.EXTRA_CARE),
                Equal(AppointmentStatus.NOT_YET_RECEIVED),
                Equal(AppointmentStatus.RECEIVED),
              ),
            }
          : {
              status: Or(
                Equal(AppointmentStatus.SUCCESS),
                Equal(AppointmentStatus.STOPPED),
              ),
            }
        : {}),
    };
    let where:
      | FindOptionsWhere<Appointment>
      | FindOptionsWhere<Appointment>[]
      | undefined;
    if (appointmentID || appointmentID == 0) {
      basicWhere.appointmentID = appointmentID;
      where = basicWhere;
    } else {
      basicWhere.appointmentID = MoreThan(offsetID);
      if (isAdmin) {
        where = basicWhere;
      } else {
        where = [
          {
            takenOverUser: [
              { team: { leader: { username: requestorID } } },
              { manager: { username: requestorID } },
              { username: requestorID },
            ],
            ...basicWhere,
          },
          {
            madeUser: [
              { team: { leader: { username: requestorID } } },
              { manager: { username: requestorID } },
              { username: requestorID },
            ],
            ...basicWhere,
          },
        ];
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
          appointmentID: 'ASC',
        },
        relations: {
          room: { house: { administrativeUnit: true } },
          depositAgreement: true,
          takenOverUser: { team: true },
          madeUser: { team: true },
          tenant: true,
          manager: true,
        },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'tenants',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'rooms',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'deposit-agreements',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'users',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'houses',
        PermTypeEnum.READ,
      ),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'appointments',
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
      if (dto.takenOverUser) {
        if (userBlacklist.canAccess)
          removeByBlacklist(dto.takenOverUser, userBlacklist.blacklist);
        else dto.takenOverUser = new ReadUserDTO();
      }
      if (dto.madeUser) {
        if (userBlacklist.canAccess) {
          removeByBlacklist(dto.madeUser, userBlacklist.blacklist);
        } else dto.madeUser = new ReadUserDTO();
      }
      if (dto.depositAgreement) {
        if (depositAgreementBlacklist.canAccess)
          removeByBlacklist(
            dto.depositAgreement,
            depositAgreementBlacklist.blacklist,
          );
        else dto.depositAgreement = new ReadDepositAgreementDTO();
      }
      // console.log('@Service: \n', dto);

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
    await this.telegramBotService.notifyCreateAppointment(
      (insertResult.identifiers[0] as { appointmentID: number }).appointmentID,
    );
    return {
      appointmentID: (insertResult.identifiers[0] as { appointmentID: number })
        .appointmentID,
    };
  }

  async takenOver(requestorID: string, appointmentID: number) {
    const appointment = new Appointment();
    appointment.appointmentID = appointmentID;
    appointment.takenOverUser = new User();
    appointment.takenOverUser.username = requestorID;

    const result = await this.constraint.AppointmentIsAlive(
      appointment.appointmentID,
    );
    if (result) this.constraint.NoUserTakeOver(result);
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
    ]);

    if (result[0])
      this.constraint.IsRelatedUser(requestorRoleIDs, requestorID, result[0]);
    if (result[1]) appointment.depositAgreement = result[1];
    console.log('@Service: \n', appointment);
    await this.appointmentRepository.save(appointment);
    await this.telegramBotService.notifyReturnDepositAgreementResult(
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
