import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAccessRuleDTO,
  UpdateAccessRuleDTO,
} from 'src/dtos/accessRuleDTO';
import { AccessRuleMapper } from 'src/mappers/accessRule.mapper';
import { AccessRule } from 'src/models/accessRule.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { AccessRuleConstraint } from './constraints/accessRule.helper';
import { RoleConstraint } from './constraints/role.helper';

@Injectable()
export class AccessRuleService {
  constructor(
    @InjectRepository(AccessRule)
    private accessRuleRepository: Repository<AccessRule>,
    private roleConstraint: RoleConstraint,
    private constraint: AccessRuleConstraint,
  ) {}

  async findAll(
    ID: {
      roleID: string;
      resourceID: string;
    },
    offsetID: {
      roleID: string;
      resourceID: string;
    },
    selectAndRelationOption: {
      select: FindOptionsSelect<AccessRule>;
      relations: FindOptionsRelations<AccessRule>;
    },
  ) {
    const accessRules = await this.accessRuleRepository.find({
      where: {
        ...(ID.roleID
          ? { roleID: offsetID.roleID, resourceID: offsetID.resourceID }
          : {
              roleID: MoreThanOrEqual(offsetID.roleID),
              resourceID: MoreThan(offsetID.resourceID),
            }),
      },
      order: {
        roleID: 'ASC',
        resourceID: 'ASC',
      },
      select: {
        roleID: true,
        resourceID: true,
        ...selectAndRelationOption.select,
      },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    return accessRules.map((accessRule) =>
      AccessRuleMapper.EntityToBaseDTO(accessRule),
    );
  }

  async create(createAccessRuleDTOs: CreateAccessRuleDTO) {
    const accessRule = AccessRuleMapper.DTOToEntity(createAccessRuleDTOs);
    //console.log('@Service: \n', accessRule);
    const result = await Promise.all([
      this.constraint.AccessRuleIsNotPersisted(
        accessRule.roleID,
        accessRule.resourceID,
      ),
      this.roleConstraint.RoleIsPersisted(accessRule.roleID),
    ]);
    if (result[1]) accessRule.role = result[1];
    await this.accessRuleRepository.insert(accessRule);
  }

  async update(updateAccessRuleDTO: UpdateAccessRuleDTO) {
    const accessRule = AccessRuleMapper.DTOToEntity(updateAccessRuleDTO);
    const [ARexist] = await Promise.all([
      this.accessRuleRepository.findOne({
        where: {
          roleID: accessRule.roleID,
          resourceID: accessRule.resourceID,
        },
        select: {
          roleID: true,
        },
      }),
    ]);
    if (!ARexist)
      throw new HttpException(
        `(${updateAccessRuleDTO.roleID}, ${updateAccessRuleDTO.resourceID})  already exists`,
        HttpStatus.NOT_FOUND,
      );
    await this.accessRuleRepository.update(
      { roleID: accessRule.roleID, resourceID: accessRule.resourceID },
      accessRule,
    );
  }

  async hardRemove(ID: { roleID: string; resourceID: string }): Promise<void> {
    const accessRule = await this.accessRuleRepository.findOne({
      where: {
        roleID: ID.roleID,
        resourceID: ID.resourceID,
      },
      withDeleted: true,
    });
    if (!accessRule)
      throw new HttpException('ID does not exist', HttpStatus.NOT_FOUND);
    await this.accessRuleRepository.remove(accessRule);
  }
}
