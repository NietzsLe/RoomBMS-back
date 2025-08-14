import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateTenantDTO,
  MaxResponseTenantDTO,
  UpdateTenantDTO,
} from 'src/dtos/tenant.dto';

import { Tenant } from 'src/models/tenant.model';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { TenantConstraint } from './constraints/tenant.helper';
import { AdministrativeUnitConstraint } from './constraints/administrative-unit.helper';
import { TenantMapper } from 'src/mappers/tenant.mapper';
import { AuthService, PermTypeEnum } from './auth.service';
import { removeByBlacklist } from './helper';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private constraint: TenantConstraint,
    private userConstraint: UserConstraint,
    private administrativeUnitConstraint: AdministrativeUnitConstraint,
    private userProcess: UserProcess,
    private authService: AuthService,
  ) {}

  async findAll(
    tenantID: number,
    name: string,
    offsetID: number,
    requestorRoleIDs: string[],
  ) {
    const [tenants, tenantBlacklist] = await Promise.all([
      this.tenantRepository.find({
        where: {
          ...(tenantID || tenantID == 0
            ? { tenantID: tenantID }
            : { tenantID: MoreThan(offsetID) }),
          ...(name ? { name: name } : {}),
        },
        order: {
          tenantID: 'ASC',
        },
        relations: { manager: true },
        take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
      }),
      this.authService.getBlacklist(
        requestorRoleIDs,
        'tenants:entity',
        PermTypeEnum.READ,
      ),
    ]);
    //console.log('@Service: \n', tenants);
    return tenants.map((tenant) => {
      const dto = TenantMapper.EntityToReadDTO(tenant);
      removeByBlacklist(dto, tenantBlacklist.blacklist);
      return dto;
    });
  }

  async getMaxTenant() {
    const query = this.tenantRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.tenantID)', 'tenantID');

    const dto = (await query.getRawOne()) as MaxResponseTenantDTO;
    return dto;
  }

  async getAutocomplete(offsetID: number) {
    console.log('@Service: autocomplete');
    const tenants = await this.tenantRepository.find({
      where: {
        tenantID: MoreThan(offsetID),
      },
      order: {
        tenantID: 'ASC',
      },
      select: { tenantID: true, name: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', tenants);
    return tenants.map((tenant) => TenantMapper.EntityToReadDTO(tenant));
  }

  async findInactiveAll(tenantID: number, offsetID: number) {
    const tenants = await this.tenantRepository.find({
      where: {
        ...(tenantID || tenantID == 0
          ? { tenantID: tenantID }
          : { tenantID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        tenantID: 'ASC',
      },
      relations: {
        manager: true,
      },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', tenants);
    return tenants.map((tenant) => TenantMapper.EntityToReadDTO(tenant));
  }

  async create(requestorID: string, createTenantDTOs: CreateTenantDTO) {
    const tenant = TenantMapper.DTOToEntity(createTenantDTOs);

    //console.log('@Service: \n', tenant);
    this.userProcess.CreatorIsDefaultManager(requestorID, tenant);

    const insertResult = await this.tenantRepository.insert(tenant);
    return {
      tenantID: (insertResult.identifiers[0] as { tenantID: number }).tenantID,
    };
  }

  async update(
    requestorRoleIDsDs: string[],
    requestorID: string,
    updateTenantDTO: UpdateTenantDTO,
  ) {
    const tenant = TenantMapper.DTOToEntity(updateTenantDTO);
    const result = await Promise.all([
      this.constraint.TenantIsAlive(tenant.tenantID),
      this.userConstraint.UserIsAlive(updateTenantDTO.managerID),
    ]);
    let IsAdmin = 0;
    if (result[0])
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDsDs,
        requestorID,
        result[0],
      );
    this.userConstraint.JustAdminCanUpdateManagerField(
      IsAdmin,
      updateTenantDTO,
    );
    if (result[1]) tenant.manager = result[1];
    //console.log('@Service: \n', tenant);
    await this.tenantRepository.save(tenant);
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    tenantID: number,
  ) {
    const result = await this.constraint.TenantIsAlive(tenantID);
    if (result)
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
    await this.tenantRepository.softDelete(tenantID);
  }

  async hardRemove(tenantIDs: number[]) {
    await this.constraint.TenantsIsNotAlive(tenantIDs);
    await this.tenantRepository.delete(tenantIDs);
  }
  async recover(tenantIDs: number[]) {
    await this.constraint.TenantsIsNotAlive(tenantIDs);
    await this.tenantRepository.restore(tenantIDs);
  }
}
