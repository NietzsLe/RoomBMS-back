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

  async AppointmentIsAlive(appointmentID: number | undefined) {
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
  async AppointmentsIsNotAlive(appointmentIDs: number[] | undefined) {
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

  async AppointmentIsPersisted(appointmentID: number | undefined) {
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
        `appointment:${appointmentID} already exists`,
        HttpStatus.NOT_FOUND,
      );
    return exist;
  }

  NoUserTakeOver(appointment: Appointment) {
    if (appointment.takenOverUser) {
      throw new HttpException(
        'Another user has taken over appointment',
        HttpStatus.CONFLICT,
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
