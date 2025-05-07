import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/models/role.model';
import { In, Repository } from 'typeorm';

@Injectable()
export class RoleConstraint {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async RoleIsNotPersisted(ID: string) {
    const exist = await this.roleRepository.findOne({
      where: {
        roleID: ID,
      },
      select: {
        roleID: true,
      },
    });
    if (exist)
      throw new HttpException(`${ID} already exist`, HttpStatus.CONFLICT);
  }

  async RoleIsPersisted(ID: string | undefined | null) {
    if (ID || ID == '') {
      const role = await this.roleRepository.findOne({
        where: {
          roleID: ID,
        },
        relations: {
          users: true,
        },
        withDeleted: true,
      });
      if (!role)
        throw new HttpException(
          `role:${ID} does not exist`,
          HttpStatus.NOT_FOUND,
        );
      return role;
    }
  }

  NoUserholdRole(role: Role) {
    if (role.users.length != 0)
      throw new HttpException(
        `Can't hard delete ${role.roleID}, because there are some users holding this role`,
        HttpStatus.CONFLICT,
      );
  }

  async RolesIsPersisted(roleIDs: string[] | undefined | null) {
    if (roleIDs) {
      const roles = await this.roleRepository.find({
        select: {
          roleID: true,
        },
        where: {
          roleID: In<string>(roleIDs),
        },
      });
      if (roleIDs.length > roles.length)
        throw new HttpException(
          'There are some roleIDs that do not exist',
          HttpStatus.NOT_FOUND,
        );
      return roles;
    }
  }
}

@Injectable()
export class RoleProcess {}
