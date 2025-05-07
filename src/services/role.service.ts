import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateRoleDTO, MaxResponseRoleDTO } from 'src/dtos/roleDTO';
import { RoleMapper } from 'src/mappers/role.mapper';
import { Role } from 'src/models/role.model';

import {
  FindOptionsRelations,
  FindOptionsSelect,
  MoreThan,
  Repository,
} from 'typeorm';
import { RoleConstraint } from './constraints/role.helper';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    private constraint: RoleConstraint,
  ) {}

  async findAll(
    roleID: string,
    offsetID: string,
    selectAndRelationOption: {
      select: FindOptionsSelect<Role>;
      relations: FindOptionsRelations<Role>;
    },
  ) {
    const roles = await this.roleRepository.find({
      where: {
        ...(roleID ? { roleID: roleID } : { roleID: MoreThan(offsetID) }),
      },
      order: {
        roleID: 'ASC',
      },
      select: { roleID: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    return roles.map((role) => RoleMapper.EntityToBaseDTO(role));
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
    return roles.map((role) => RoleMapper.EntityToBaseDTO(role));
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
