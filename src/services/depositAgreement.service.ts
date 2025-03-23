import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateDepositAgreementDTO,
  UpdateDepositAgreementDTO,
} from 'src/dtos/depositAgreementDTO';
import { DepositAgreementMapper } from 'src/mappers/depositAgreement.mapper';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import {
  FindOptionsRelations,
  FindOptionsSelect,
  IsNull,
  MoreThan,
  Not,
  Repository,
} from 'typeorm';
import { UserConstraint, UserProcess } from './constraints/user.helper';
import { DepositAgreementConstraint } from './constraints/depositAgreement.helper';
import { RoomConstraint } from './constraints/room.helper';
import { TenantConstraint } from './constraints/tenant.helper';

@Injectable()
export class DepositAgreementService {
  constructor(
    @InjectRepository(DepositAgreement)
    private depositAgreementRepository: Repository<DepositAgreement>,
    private constraint: DepositAgreementConstraint,
    private userConstraint: UserConstraint,
    private tenantConstraint: TenantConstraint,
    private roomConstraint: RoomConstraint,
    private userProcess: UserProcess,
  ) {}

  async findAll(
    depositAgreementID: number,
    offsetID: number,
    selectAndRelationOption: {
      select: FindOptionsSelect<DepositAgreement>;
      relations: FindOptionsRelations<DepositAgreement>;
    },
  ) {
    const depositAgreements = await this.depositAgreementRepository.find({
      where: {
        ...(depositAgreementID || depositAgreementID == 0
          ? { depositAgreementID: depositAgreementID }
          : { depositAgreementID: MoreThan(offsetID) }),
      },
      order: {
        depositAgreementID: 'ASC',
      },
      select: { depositAgreementID: true, ...selectAndRelationOption.select },
      relations: { ...selectAndRelationOption.relations },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', depositAgreements);
    return depositAgreements.map((depositAgreement) =>
      DepositAgreementMapper.EntityToBaseDTO(depositAgreement),
    );
  }
  async findInactiveAll(depositAgreementID: number, offsetID: number) {
    const depositAgreements = await this.depositAgreementRepository.find({
      where: {
        ...(depositAgreementID || depositAgreementID == 0
          ? { depositAgreementID: depositAgreementID }
          : { depositAgreementID: MoreThan(offsetID) }),
        deletedAt: Not(IsNull()),
      },
      order: {
        depositAgreementID: 'ASC',
      },

      relations: { negotiator: true, tenant: true, room: true, manager: true },
      withDeleted: true,
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    //console.log('@Service: \n', depositAgreements);
    return depositAgreements.map((depositAgreement) =>
      DepositAgreementMapper.EntityToBaseDTO(depositAgreement),
    );
  }

  async create(
    requestorID: string,
    createDepositAgreementDTOs: CreateDepositAgreementDTO,
  ) {
    const depositAgreement = DepositAgreementMapper.DTOToEntity(
      createDepositAgreementDTOs,
    );
    //console.log('@Service: \n', depositAgreement);
    const result = await Promise.all([
      this.roomConstraint.RoomIsAlive(createDepositAgreementDTOs.roomID),
      this.tenantConstraint.TenantIsAlive(createDepositAgreementDTOs.tenantID),
      this.userConstraint.UserIsAlive(
        createDepositAgreementDTOs.negotiatorUsername,
      ),
    ]);
    if (result[0]) depositAgreement.room = result[0];
    if (result[1]) depositAgreement.tenant = result[1];
    if (result[2]) depositAgreement.negotiator = result[2];
    this.userProcess.CreatorIsDefaultManager(requestorID, depositAgreement);
    await this.depositAgreementRepository.insert(depositAgreement);
  }

  async update(
    requestorRoleIDs: string[],
    requestorID: string,
    updateDepositAgreementDTO: UpdateDepositAgreementDTO,
  ) {
    const depositAgreement = DepositAgreementMapper.DTOToEntity(
      updateDepositAgreementDTO,
    );
    const result = await Promise.all([
      this.constraint.DepositAgreementIsAlive(
        depositAgreement.depositAgreementID,
      ),
      this.roomConstraint.RoomIsAlive(updateDepositAgreementDTO.roomID),
      this.tenantConstraint.TenantIsAlive(updateDepositAgreementDTO.tenantID),
      this.userConstraint.UserIsAlive(
        updateDepositAgreementDTO.negotiatorUsername,
      ),
      this.userConstraint.ManagerIsAlive(updateDepositAgreementDTO.managerID),
    ]);

    let IsAdmin = 0;
    if (result[0])
      IsAdmin = this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result[0],
      );
    this.userConstraint.JustAdminCanUpdateManagerField(
      IsAdmin,
      updateDepositAgreementDTO,
    );
    if (result[1]) depositAgreement.room = result[1];
    if (result[2]) depositAgreement.tenant = result[2];
    if (result[3]) depositAgreement.negotiator = result[3];
    if (result[4]) depositAgreement.manager = result[4];
    //console.log('@Service: \n', depositAgreement);
    await this.depositAgreementRepository.update(
      depositAgreement.depositAgreementID,
      depositAgreement,
    );
  }

  async softRemove(
    requestorRoleIDs: string[],
    requestorID: string,
    depositAgreementID: number,
  ) {
    const result =
      await this.constraint.DepositAgreementIsAlive(depositAgreementID);
    if (result)
      this.userConstraint.RequestorManageNonUserResource(
        requestorRoleIDs,
        requestorID,
        result,
      );
    await this.depositAgreementRepository.softDelete(depositAgreementID);
  }

  async hardRemove(depositAgreementIDs: number[]) {
    await this.constraint.DepositAgreementsIsNotAlive(depositAgreementIDs);
    await this.depositAgreementRepository.delete(depositAgreementIDs);
  }
  async recover(depositAgreementIDs: number[]) {
    await this.constraint.DepositAgreementsIsNotAlive(depositAgreementIDs);
    await this.depositAgreementRepository.restore(depositAgreementIDs);
  }
}
