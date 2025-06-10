import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/models/appointment.model';
import { User } from 'src/models/user.model';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class AppointmentConstraint {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  JustRelatedUserCanSeeTenantPhone(
    appointment: Appointment,
    requestorID: string,
  ) {
    if (
      (appointment.madeUser?.username &&
        appointment.madeUser?.username == requestorID) ||
      (appointment.takenOverUser?.username &&
        appointment.takenOverUser?.username == requestorID)
    ) {
      return true;
    }
    return false;
  }

  async AppointmentIsAlive(appointmentID: number | undefined | null) {
    if (appointmentID || appointmentID == 0) {
      const exist = await this.appointmentRepository.findOne({
        where: {
          appointmentID: appointmentID,
        },
        select: {
          appointmentID: true,
        },
        relations: {
          takenOverUser: true,
          madeUser: true,
          room: true,
          depositAgreement: true,
          manager: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `appointment:${appointmentID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }
  async AppointmentsIsNotAlive(appointmentIDs: number[] | undefined | null) {
    if (appointmentIDs) {
      const exists = await this.appointmentRepository.find({
        where: {
          appointmentID: In(appointmentIDs),
          deletedAt: Not(IsNull()),
        },
        select: {
          appointmentID: true,
        },
        relations: {
          takenOverUser: true,
          madeUser: true,
          room: true,
          depositAgreement: true,
        },
        withDeleted: true,
      });
      if (appointmentIDs.length > exists.length)
        throw new HttpException(
          'There are some usernames that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async AppointmentIsPersisted(appointmentID: number | undefined | null) {
    if (appointmentID || appointmentID == 0) {
      const exist = await this.appointmentRepository.findOne({
        where: {
          appointmentID: appointmentID,
        },
        select: {
          appointmentID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `appointment:${appointmentID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async AppointmentIsNotPersisted(appointmentID: number) {
    const exist = await this.appointmentRepository.findOne({
      where: {
        appointmentID: appointmentID,
      },
      select: {
        appointmentID: true,
      },
      withDeleted: true,
    });
    if (!exist)
      throw new HttpException(
        `appointment:${appointmentID} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    return exist;
  }

  NoUserTakeOver(requestorID: string, appointment: Appointment) {
    if (
      appointment.takenOverUser?.username &&
      appointment.takenOverUser?.username != requestorID
    ) {
      throw new HttpException(
        'Another user has taken over appointment',
        HttpStatus.CONFLICT,
      );
    }
  }

  IsRelatedUser(
    requestorRoleIDs: string[],
    requestorID: string,
    appointment: Appointment,
  ) {
    for (const role of requestorRoleIDs) {
      if (
        role == process.env.SUPER_ADMIN_ROLEID ||
        role == process.env.ADMIN_ROLEID
      )
        return;
    }
    if (
      !(
        (appointment.takenOverUser &&
          requestorID == appointment.takenOverUser.username) ||
        (appointment.madeUser &&
          requestorID == appointment.madeUser.username) ||
        (appointment.manager && requestorID == appointment.manager.username)
      )
    ) {
      throw new HttpException(
        'You are not a related user of this resource',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}

@Injectable()
export class AppointmentProcess {
  RequestorIsMadeUserWhenCreate(requestorID: string, appointment: Appointment) {
    const user = new User();
    user.username = requestorID;
    appointment.madeUser = user;
  }
}
