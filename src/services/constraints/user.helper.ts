import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/models/user.model';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Room } from 'src/models/room.model';
import { House } from 'src/models/house.model';
import { Tenant } from 'src/models/tenant.model';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import { Appointment } from 'src/models/appointment.model';
import { UpdateAppointmentDTO } from 'src/dtos/appointmentDTO';
import { UpdateHouseDTO } from 'src/dtos/houseDTO';
import { UpdateRoomDTO } from 'src/dtos/roomDTO';
import { UpdateDepositAgreementDTO } from 'src/dtos/depositAgreementDTO';
import { UpdateTenantDTO } from 'src/dtos/tenantDTO';
import { UpdateUserDTO } from 'src/dtos/userDTO';

@Injectable()
export class UserConstraint {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  RequestorManageUser(
    requestorRoleIDs: string[],
    requestorID: string,
    user: User,
  ) {
    let IsAdmin = 0;

    for (const role of requestorRoleIDs) {
      if (role == process.env.SUPER_ADMIN_ROLEID) return 2;
      if (role == process.env.ADMIN_ROLEID) IsAdmin = 1;
    }
    if (requestorID == user.username) return IsAdmin;

    if (
      (user.manager && user.manager.username == requestorID) ||
      (!user.manager && IsAdmin)
    ) {
      (user.roles ?? []).forEach((role) => {
        if (
          role.roleID == process.env.SUPER_ADMIN_ROLEID ||
          role.roleID == process.env.ADMIN_ROLEID
        ) {
          throw new HttpException(
            "You can't manage a admin",
            HttpStatus.FORBIDDEN,
          );
        }
      });
      return IsAdmin;
    }

    throw new HttpException(
      'You are not the manager of this user',
      HttpStatus.FORBIDDEN,
    );
  }

  RequestorManageNonUserResource(
    requestorRoleIDs: string[],
    requestorID: string,
    resource: Room | House | Tenant | DepositAgreement | Appointment,
  ) {
    for (const role of requestorRoleIDs) {
      if (
        role == process.env.SUPER_ADMIN_ROLEID ||
        role == process.env.ADMIN_ROLEID
      )
        return 1;
    }
    if (resource.manager)
      if (resource.manager.username != requestorID)
        throw new HttpException(
          'You are not the manager of this resource',
          HttpStatus.FORBIDDEN,
        );
    return 0;
  }

  async UserIsNotPersisted(username: string) {
    const exist = await this.userRepository.findOne({
      where: {
        username: username,
      },
      select: {
        username: true,
      },
      withDeleted: true,
    });
    if (exist)
      throw new HttpException(
        `username:${username}  already exists`,
        HttpStatus.CONFLICT,
      );
  }

  async UserIsAlive(username: string | undefined | null) {
    if (username || username == '') {
      const exist = await this.userRepository.findOne({
        where: {
          username: username,
        },
        select: {
          username: true,
        },
        relations: {
          manager: true,
          roles: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `user:${username} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async UsersIsNotAlive(usernames: string[] | undefined | null) {
    if (usernames) {
      const exists = await this.userRepository.find({
        where: {
          username: In<string>(usernames),
          deletedAt: Not(IsNull()),
        },
        select: {
          username: true,
        },
        relations: {
          manager: true,
          roles: true,
        },
        withDeleted: true,
      });
      if (usernames.length > exists.length)
        throw new HttpException(
          'There are some usernames that do not exist or is active',

          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async UserIsPersisted(username: string | undefined | null) {
    if (username || username == '') {
      const exist = await this.userRepository.findOne({
        where: {
          username: username,
        },
        select: {
          username: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `user:${username} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  JustAdminCanAssignRoles(
    requestorRoleIDs: string[],
    roleIDs: string[] | undefined | null,
  ) {
    let IsAdmin = 0;
    for (const role of requestorRoleIDs) {
      if (role == process.env.SUPER_ADMIN_ROLEID) return 2;
      if (role == process.env.ADMIN_ROLEID) IsAdmin = 1;
    }
    if (roleIDs) {
      if (IsAdmin) {
        roleIDs.forEach((role) => {
          if (
            role == process.env.SUPER_ADMIN_ROLEID ||
            role == process.env.ADMIN_ROLEID
          )
            throw new HttpException(
              `You do not have permission to assign ${role} role`,
              HttpStatus.FORBIDDEN,
            );
        });
        return 0;
      }
      throw new HttpException(
        `You do not have permission to assign roles`,
        HttpStatus.FORBIDDEN,
      );
    }
    return 1;
  }

  JustAdminCanUpdateManagerField(
    IsAdmin: number,
    dto:
      | UpdateAppointmentDTO
      | UpdateHouseDTO
      | UpdateRoomDTO
      | UpdateDepositAgreementDTO
      | UpdateTenantDTO,
  ) {
    //console.log('@Constraint: \n', IsAdmin);
    if (dto.managerID)
      if (!IsAdmin)
        throw new HttpException(
          'Since you are not an administrator, you do not have permission to change the manager',
          HttpStatus.FORBIDDEN,
        );
  }

  JustAdminCanUpdateManagerFieldOfUser(
    IsAdmin: number,
    user: User,
    dto: UpdateUserDTO,
  ) {
    //console.log('@Constraint: \n', IsAdmin);
    if (dto.managerID)
      if (!IsAdmin)
        throw new HttpException(
          'Since you are not an administrator, you do not have permission to change the manager',
          HttpStatus.FORBIDDEN,
        );
      else if (IsAdmin == 1) {
        (user.roles ?? []).forEach((role) => {
          if (
            role.roleID == process.env.SUPER_ADMIN_ROLEID ||
            role.roleID == process.env.ADMIN_ROLEID
          )
            throw new HttpException(
              `You do not have permission to change manager of ${role.roleID}`,
              HttpStatus.FORBIDDEN,
            );
        });
      }
  }

  CantChangeManagerByYourself(requestorID: string, user: User) {
    if (user.manager)
      if (requestorID == user.username)
        throw new HttpException(
          "Can't change manager by yourself",
          HttpStatus.FORBIDDEN,
        );
  }

  async ManagerIsAlive(managerID: string | undefined | null) {
    const manager = await this.UserIsAlive(managerID);
    return manager;
  }
}

@Injectable()
export class UserProcess {
  CreatorIsDefaultManager(
    requestorID: string,
    value: Room | User | House | Tenant | DepositAgreement | Appointment,
  ) {
    value.manager = new User();
    value.manager.username = requestorID;
  }
}
