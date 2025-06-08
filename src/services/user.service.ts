import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AutocompleteTeamDTO,
  CreateUserDTO,
  MaxResponseTeamDTO,
  MaxResponseUserDTO,
  UpdateUserDTO,
} from 'src/dtos/userDTO';
import { UserMapper } from 'src/mappers/user.mapper';
import { User } from 'src/models/user.model';
import {
  And,
  Equal,
  FindOptionsWhere,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { RoleConstraint } from './constraints/role.helper';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';
import { Team } from 'src/models/team.model';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    private constraint: UserConstraint,
    private roleConstraint: RoleConstraint,
    private proccess: UserProcess,
    private authService: AuthService,
  ) {}

  async findAll(
    username: string,
    name: string,
    offsetUsername: string,
    requestorRoleIDs: string[],
  ) {
    const [users, userBlacklist] = await Promise.all([
      this.userRepository.find({
        where: {
          ...(username
            ? { username: username }
            : { username: MoreThan(offsetUsername) }),
          ...(name ? { name: name } : {}),
        },
        order: {
          username: 'ASC',
        },
        relations: { roles: true, team: true, manager: true },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'users',
        PermTypeEnum.READ,
      ),
    ]);
    //console.log('@Service: \n', users);
    return users.map((user) => {
      const dto = UserMapper.EntityToReadDTO(user);
      removeByBlacklist(dto, userBlacklist.blacklist);
      return dto;
    });
  }

  async getMaxUser() {
    const query = this.userRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.username)', 'username');

    const dto = (await query.getRawOne()) as MaxResponseUserDTO;

    return dto;
  }

  async getMaxTeam() {
    const query = this.teamRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.teamID)', 'teamID');

    const dto = (await query.getRawOne()) as MaxResponseTeamDTO;

    return dto;
  }

  async getUserAutocomplete(
    offsetID: string,
    requestorID: string,
    requestorRoleIDs: string[],
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
    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] | undefined = [
      { username: MoreThan(offsetID) },
    ];
    if (!isAdmin) {
      where = [
        {
          team: { leader: { username: requestorID } },
          username: MoreThan(offsetID),
        },
        { manager: { username: requestorID }, username: MoreThan(offsetID) },
        { username: And(Equal(requestorID), MoreThan(offsetID)) },
      ];
    }
    console.log('@Service: autocomplete');
    const users = await this.userRepository.find({
      where: where,
      order: {
        username: 'ASC',
      },
      select: { username: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', users);
    return users.map((user) => UserMapper.EntityToReadDTO(user));
  }

  async getTeamAutocomplete(offsetID: string) {
    console.log('@Service: autocomplete');
    const teams = await this.teamRepository.find({
      where: {
        teamID: MoreThan(offsetID),
      },
      order: {
        teamID: 'ASC',
      },
      select: { teamID: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    console.log('@Service: \n', teams);
    return teams.map((team) => {
      const dto = new AutocompleteTeamDTO();
      dto.teamID = team.teamID;
      return dto;
    });
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
    return users.map((user) => UserMapper.EntityToReadDTO(user));
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
      this.constraint.TeamIsAlive(updateUserDTO.teamID),
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
    if (result[3]) user.team = result[3];

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
