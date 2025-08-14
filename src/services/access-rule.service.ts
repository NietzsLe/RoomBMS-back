import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateAccessRuleDTO,
  UpdateAccessRuleDTO,
} from 'src/dtos/access-rule.dto';
import { AccessRuleMapper } from 'src/mappers/access-rule.mapper';
import { AccessRule } from 'src/models/access-rule.model';
import { MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { AccessRuleConstraint } from './constraints/access-rule.helper';
import { RoleConstraint } from './constraints/role.helper';
import { removeByBlacklist } from './helper';
import { AuthService, PermTypeEnum } from './auth.service';

@Injectable()
export class AccessRuleService {
  constructor(
    @InjectRepository(AccessRule)
    private accessRuleRepository: Repository<AccessRule>,
    private roleConstraint: RoleConstraint,
    private constraint: AccessRuleConstraint,
    private authService: AuthService,
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
    requestorRoleIDs: string[],
  ) {
    const [accessRules, accessRuleBlacklist] = await Promise.all([
      this.accessRuleRepository.find({
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
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'access-rules:entity',
        PermTypeEnum.READ,
      ),
    ]);
    return accessRules.map((accessRule) => {
      const dto = AccessRuleMapper.EntityToReadDTO(accessRule);
      removeByBlacklist(dto, accessRuleBlacklist.blacklist);
      return dto;
    });
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
    const insertResult = await this.accessRuleRepository.insert(accessRule);
    return {
      resourceID: (insertResult.identifiers[0] as { resourceID: string })
        .resourceID,
      roleID: (insertResult.identifiers[0] as { roleID: { roleID: string } })
        .roleID.roleID,
    };
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
        `(${updateAccessRuleDTO.roleID}, ${updateAccessRuleDTO.resourceID}) does not exists`,
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
