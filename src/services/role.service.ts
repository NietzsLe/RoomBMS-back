import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDTO, MaxResponseRoleDTO } from 'src/dtos/roleDTO';
import { RoleMapper } from 'src/mappers/role.mapper';
import { Role } from 'src/models/role.model';

import { MoreThan, Repository } from 'typeorm';
import { RoleConstraint } from './constraints/role.helper';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private constraint: RoleConstraint,
    private authService: AuthService,
  ) {}

  async findAll(roleID: string, offsetID: string, requestorRoleIDs: string[]) {
    const [roles, roleBlacklist] = await Promise.all([
      this.roleRepository.find({
        where: {
          ...(roleID ? { roleID: roleID } : { roleID: MoreThan(offsetID) }),
        },
        order: {
          roleID: 'ASC',
        },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'roles',
        PermTypeEnum.READ,
      ),
    ]);
    return roles.map((role) => {
      const dto = RoleMapper.EntityToReadDTO(role);
      removeByBlacklist(dto, roleBlacklist.blacklist);
      return dto;
    });
  }

  async getMaxRole() {
    const dto = (await this.roleRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.roleID)', 'roleID')
      .getRawOne()) as MaxResponseRoleDTO;
    return dto;
  }

  async getAutocomplete(offsetID: string) {
    console.log('@Service: autocomplete');
    const roles = await this.roleRepository.find({
      where: {
        roleID: MoreThan(offsetID),
      },
      order: {
        roleID: 'ASC',
      },
      select: { roleID: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', roles);
    return roles.map((role) => RoleMapper.EntityToReadDTO(role));
  }

  async create(createRoleDTOs: CreateRoleDTO) {
    const role = RoleMapper.DTOToEntity(createRoleDTOs);
    //console.log('@Service: \n', role);
    await this.constraint.RoleIsNotPersisted(role.roleID);

    const insertResult = await this.roleRepository.insert(role);
    return {
      roleID: (insertResult.identifiers[0] as { roleID: string }).roleID,
    };
  }

  async hardRemove(ID: string): Promise<void> {
    const result = await this.constraint.RoleIsPersisted(ID);
    if (result) this.constraint.NoUserholdRole(result);
    await this.roleRepository.delete(ID);
  }
}
