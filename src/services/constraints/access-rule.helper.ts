import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRule } from 'src/models/access-rule.model';
import { Role } from 'src/models/role.model';
import { Repository } from 'typeorm';

@Injectable()
export class AccessRuleConstraint {
  constructor(
    @InjectRepository(AccessRule)
    private accessRuleRepository: Repository<AccessRule>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}
  async AccessRuleIsNotPersisted(roleID: string, resourceID: string) {
    const exist = await this.accessRuleRepository.findOne({
      where: {
        roleID: roleID,
        resourceID: resourceID,
      },
      select: {
        roleID: true,
      },
    });
    if (exist)
      throw new HttpException(
        `(${roleID}, ${resourceID}) already exists`,
        HttpStatus.CONFLICT,
      );
  }
}

@Injectable()
export class AccessRuleProcess {}
