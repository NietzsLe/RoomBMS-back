import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from 'src/models/tenant.model';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class TenantConstraint {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}
  async TenantIsAlive(tenantID: number | undefined) {
    if (tenantID || tenantID == 0) {
      const exist = await this.tenantRepository.findOne({
        where: {
          tenantID: tenantID,
        },
        select: {
          tenantID: true,
        },
        relations: {
          administrativeUnit: true,
          manager: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `tenant:${tenantID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async TenantsIsNotAlive(tenantIDs: number[] | undefined) {
    if (tenantIDs) {
      const exists = await this.tenantRepository.find({
        where: {
          tenantID: In<number>(tenantIDs),
          deletedAt: Not(IsNull()),
        },
        select: {
          tenantID: true,
        },
        relations: {
          administrativeUnit: true,
          manager: true,
        },
        withDeleted: true,
      });
      if (tenantIDs.length > exists.length)
        throw new HttpException(
          'There are some tenantIDs that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async TenantIsPersisted(tenantID: number | undefined) {
    if (tenantID || tenantID == 0) {
      const exist = await this.tenantRepository.findOne({
        where: {
          tenantID: tenantID,
        },
        select: {
          tenantID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `tenant:${tenantID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  // async TenantIsNotPersisted(tenantID: number) {
  //   const exist = await this.tenantRepository.findOne({
  //     where: {
  //       tenantID: tenantID,
  //     },
  //     select: {
  //       tenantID: true,
  //     },
  //     withDeleted: true,
  //   });
  //   if (!exist)
  //     throw new HttpException(
  //       `${tenantID} already exists`,
  //       HttpStatus.NOT_FOUND,
  //     );
  //   return exist;
  // }
}

@Injectable()
export class TenantProcess {}
