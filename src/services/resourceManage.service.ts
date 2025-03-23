import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import {
  And,
  EntityTarget,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { User } from 'src/models/user.model';
import { Tenant } from 'src/models/tenant.model';
import { Room } from 'src/models/room.model';
import { House } from 'src/models/house.model';
import { Image } from 'src/models/image.model';
import { Appointment } from 'src/models/appointment.model';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import { AdministrativeUnit } from 'src/models/administrativeUnit.model';
import { ProvinceUnit } from 'src/models/provinceUnit.model';
import { DistrictUnit } from 'src/models/districtUnit.model';
import { WardUnit } from 'src/models/wardUnit.model';

import { DataSource } from 'typeorm';

@Injectable()
export class ResourceManageServive {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
    @InjectRepository(House)
    private houseRepository: Repository<House>,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(DepositAgreement)
    private depositAgreementRepository: Repository<DepositAgreement>,
    @InjectRepository(AdministrativeUnit)
    private administrativeUnitRepository: Repository<AdministrativeUnit>,
    @InjectRepository(ProvinceUnit)
    private provinceUnitRepository: Repository<ProvinceUnit>,
    @InjectRepository(DistrictUnit)
    private districtUnitRepository: Repository<DistrictUnit>,
    @InjectRepository(WardUnit)
    private wardUnitRepository: Repository<WardUnit>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async clean(startTime: Date, endTime: Date) {
    const whereOption = {
      deletedAt: And(
        ...[
          ...(startTime ? [MoreThanOrEqual(startTime)] : []),
          ...(endTime ? [LessThanOrEqual(endTime)] : []),
        ],
      ),
    };
    const affectRecords = await Promise.all([
      this.userRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(User),
        withDeleted: true,
      }),
      this.tenantRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Tenant),
        withDeleted: true,
      }),
      this.roomRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Room),
        withDeleted: true,
      }),
      this.houseRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(House),
        withDeleted: true,
      }),
      this.imageRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Image),
        withDeleted: true,
      }),
      this.appointmentRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Appointment),
        withDeleted: true,
      }),
      this.depositAgreementRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(DepositAgreement),
        withDeleted: true,
      }),
      this.administrativeUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(AdministrativeUnit),
        withDeleted: true,
      }),
      this.provinceUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(ProvinceUnit),
        withDeleted: true,
      }),
      this.districtUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(DistrictUnit),
        withDeleted: true,
      }),
      this.wardUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(WardUnit),
        withDeleted: true,
      }),
    ]);
    await Promise.all([
      this.userRepository.delete(whereOption),
      this.tenantRepository.delete(whereOption),
      this.roomRepository.delete(whereOption),
      this.houseRepository.delete(whereOption),
      this.imageRepository.delete(whereOption),
      this.appointmentRepository.delete(whereOption),
      this.depositAgreementRepository.delete(whereOption),
      this.administrativeUnitRepository.delete(whereOption),
      this.provinceUnitRepository.delete(whereOption),
      this.districtUnitRepository.delete(whereOption),
      this.wardUnitRepository.delete(whereOption),
    ]);
    return affectRecords;
  }
  async recover(startTime: Date, endTime: Date) {
    const whereOption = {
      deletedAt: And(
        ...[
          ...(startTime ? [MoreThanOrEqual(startTime)] : []),
          ...(endTime ? [LessThanOrEqual(endTime)] : []),
        ],
      ),
    };
    const affectRecords = await Promise.all([
      this.userRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(User),
        withDeleted: true,
      }),
      this.tenantRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Tenant),
        withDeleted: true,
      }),
      this.roomRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Room),
        withDeleted: true,
      }),
      this.houseRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(House),
        withDeleted: true,
      }),
      this.imageRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Image),
        withDeleted: true,
      }),
      this.appointmentRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(Appointment),
        withDeleted: true,
      }),
      this.depositAgreementRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(DepositAgreement),
        withDeleted: true,
      }),
      this.administrativeUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(AdministrativeUnit),
        withDeleted: true,
      }),
      this.provinceUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(ProvinceUnit),
        withDeleted: true,
      }),
      this.districtUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(DistrictUnit),
        withDeleted: true,
      }),
      this.wardUnitRepository.find({
        ...{ where: whereOption },
        ...this.createSelectAndRelationsFindOption(WardUnit),
        withDeleted: true,
      }),
    ]);
    await Promise.all([
      this.userRepository.restore(whereOption),
      this.tenantRepository.restore(whereOption),
      this.roomRepository.restore(whereOption),
      this.houseRepository.restore(whereOption),
      this.imageRepository.restore(whereOption),
      this.appointmentRepository.restore(whereOption),
      this.depositAgreementRepository.restore(whereOption),
      this.administrativeUnitRepository.restore(whereOption),
      this.provinceUnitRepository.restore(whereOption),
      this.districtUnitRepository.restore(whereOption),
      this.wardUnitRepository.restore(whereOption),
    ]);
    return affectRecords;
  }

  // Lấy repository của entity User
  private createSelectAndRelationsFindOption(
    cls: EntityTarget<
      | User
      | Room
      | Tenant
      | DepositAgreement
      | Appointment
      | AdministrativeUnit
      | ProvinceUnit
      | DistrictUnit
      | WardUnit
      | House
      | Image
    >,
  ) {
    const clsRepository = this.dataSource.getRepository(cls);

    // Lấy metadata của User
    const clsMetadata = clsRepository.metadata;

    // Trích xuất tên các quan hệ và các thuộc tính của mỗi quan hệ
    const relationsOption = {};
    const selectOption = {};
    clsMetadata.columns.forEach((column) => {
      selectOption[column.propertyName] = true;
    });
    clsMetadata.relations.forEach((column) => {
      relationsOption[column.propertyName] = true;
      selectOption[column.propertyName] = this.getPrimaryColumn(
        column.inverseEntityMetadata.tableName,
      );
    });
    console.log('@Service: \n', selectOption, relationsOption);
    return { select: selectOption, relations: relationsOption };
  }
  private getPrimaryColumn(
    cls: EntityTarget<
      | User
      | Room
      | Tenant
      | DepositAgreement
      | Appointment
      | AdministrativeUnit
      | ProvinceUnit
      | DistrictUnit
      | WardUnit
      | House
      | Image
    >,
  ) {
    // Lấy repository của entity User
    const clsRepository = this.dataSource.getRepository(cls);

    // Lấy metadata của User
    const clsMetadata = clsRepository.metadata;

    // Lọc ra tất cả các trường là Primary Key
    const primaryKeys = {};
    clsMetadata.columns
      .filter((column) => column.isPrimary) // Kiểm tra các cột có thuộc tính isPrimary
      .forEach((column) => (primaryKeys[column.propertyName] = true)); // Trích xuất tên các cột

    return primaryKeys;
  }
}
