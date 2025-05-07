import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDTO,
  MaxResponseUserDTO,
  UpdateUserDTO,
} from 'src/dtos/userDTO';
import { UserMapper } from 'src/mappers/user.mapper';
import { User } from 'src/models/user.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { RoleConstraint } from './constraints/role.helper';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private constraint: UserConstraint,
    private roleConstraint: RoleConstraint,
    private proccess: UserProcess,
  ) {}

  async findAll(
    username: string,
    name: string,
    offsetUsername: string,
    selectAndRelationOption: {
      select: FindOptionsSelect<User>;
      relations: FindOptionsRelations<User>;
    },
  ) {
    const users = await this.userRepository.find({
      where: {
        ...(username
          ? { username: username }
          : { username: MoreThan(offsetUsername) }),
        ...(name ? { name: name } : {}),
      },
      order: {
        username: 'ASC',
      },
      select: { username: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', users);
    return users.map((user) => UserMapper.EntityToBaseDTO(user));
  }

  async getMaxUser(name: string) {
    const query = this.userRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.username)', 'username');
    if (name) {
      query.where('entity.name = :name', { name: name });
    }

    const dto = (await query.getRawOne()) as MaxResponseUserDTO;

    return dto;
  }

  async getAutocomplete(offsetID: string) {
    console.log('@Service: autocomplete');
    const users = await this.userRepository.find({
      where: {
        username: MoreThan(offsetID),
      },
      order: {
        username: 'ASC',
      },
      select: { username: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', users);
    return users.map((user) => UserMapper.EntityToBaseDTO(user));
  }

  async findInactiveAll(username: string, offsetUsername: string) {
    const users = await this.userRepository.find({
      where: {
        ...(username
          ? { username: username }
          : { username: MoreThan(offsetUsername) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        username: 'ASC',
      },

      relations: { manager: true, roles: true },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', users);
    return users.map((user) => UserMapper.EntityToBaseDTO(user));
  }

  async create(requestorID: string, createUserDTOs: CreateUserDTO) {
    const user = UserMapper.DTOToEntity(createUserDTOs);
    //console.log('@Service: \n', user);
    await this.constraint.UserIsNotPersisted(user.username);
    this.proccess.CreatorIsDefaultManager(requestorID, user);
    const insertResult = await this.userRepository.insert(user);
    return {
      username: (insertResult.identifiers[0] as { username: string }).username,
    };
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateUserDTO: UpdateUserDTO,
  ) {
    const user = UserMapper.DTOToEntity(updateUserDTO);
    if (updateUserDTO.managerID == null) user.manager = null;
    const result = await Promise.all([
      this.constraint.UserIsAlive(user.username),
      this.roleConstraint.RolesIsPersisted(updateUserDTO.roleIDs),
      this.constraint.ManagerIsAlive(updateUserDTO.managerID),
    ]);
    console.log('@Service: \n', user);
    let IsAdmin = 0;
    if (result[0]) {
      IsAdmin = this.constraint.RequestorManageUser(
        requestorRoleIDs,
        requestorID,
        result[0],
      );
      this.constraint.JustAdminCanUpdateManagerFieldOfUser(
        IsAdmin,
        result[0],
        updateUserDTO,
      );
    }
    this.constraint.JustAdminCanAssignRoles(
      requestorRoleIDs,
      updateUserDTO.roleIDs,
    );
    this.constraint.CantChangeManagerByYourself(requestorID, user);
    if (result[1]) {
      user.roles = result[1];
      user.hashedAccessToken = null;
      user.hashedRefreshToken = null;
    }
    if (result[2]) user.manager = result[2];

    await this.userRepository.save(user);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    username: string,
  ) {
    const result = await this.constraint.UserIsAlive(username);
    if (result)
      this.constraint.RequestorManageUser(
        requestorRoleIDs,
        requestorID,
        result,
      );
    await this.userRepository.softDelete(username);
  }

  async hardRemove(usernames: string[]) {
    await this.constraint.UsersIsNotAlive(usernames);
    await this.userRepository.delete(usernames);
  }
  async recover(usernames: string[]) {
    await this.constraint.UsersIsNotAlive(usernames);
    await this.userRepository.restore(usernames);
  }
}
