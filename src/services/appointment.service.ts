import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from 'src/dtos/appointmentDTO';
import { AppointmentMapper } from 'src/mappers/appointment.mapper';
import { Appointment } from 'src/models/appointment.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { AppointmentConstraint } from './constraints/appointment.helper';
import { RoomConstraint } from './constraints/room.helper';
import { TenantConstraint } from './constraints/tenant.helper';
import { DepositAgreementConstraint } from './constraints/depositAgreement.helper';
import { User } from 'src/models/user.model';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private constraint: AppointmentConstraint,
    private userConstraint: UserConstraint,
    private tenantConstraint: TenantConstraint,
    private roomConstraint: RoomConstraint,
    private depositAgreementConstraint: DepositAgreementConstraint,
    private userProcess: UserProcess,
  ) {}

  async findAll(
    appointmentID: number,
    offsetID: number,
    selectAndRelationOption: {
      select: FindOptionsSelect<Appointment>;
      relations: FindOptionsRelations<Appointment>;
    },
  ) {
    const appointments = await this.appointmentRepository.find({
      where: {
        ...(appointmentID || appointmentID == 0
          ? { appointmentID: appointmentID }
          : { appointmentID: MoreThan(offsetID) }),
      },
      order: {
        appointmentID: 'ASC',
      },
      select: { appointmentID: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    console.log('@Service: \n', appointments);
    return appointments.map((appointment) =>
      AppointmentMapper.EntityToBaseDTO(appointment),
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
      AppointmentMapper.EntityToBaseDTO(appointment),
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
    await this.appointmentRepository.insert(appointment);
  }

  async takeOver(requestorID: string, appointmentID: number) {
    const appointment = new Appointment();
    appointment.appointmentID = appointmentID;
    appointment.takenOverUser = new User();
    appointment.takenOverUser.username = requestorID;

    const result = await this.constraint.AppointmentIsAlive(
      appointment.appointmentID,
    );
    if (result) this.constraint.NoUserTakeOver(result);
    await this.appointmentRepository.update(
      appointment.appointmentID,
      appointment,
    );
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateAppointmentDTO: UpdateAppointmentDTO,
  ) {
    const appointment = AppointmentMapper.DTOToEntity(updateAppointmentDTO);
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
    if (result[1]) appointment.takenOverUser = result[1];
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
