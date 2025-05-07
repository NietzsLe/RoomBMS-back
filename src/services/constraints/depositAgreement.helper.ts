import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DepositAgreement } from 'src/models/depositAgreement.model';
import { User } from 'src/models/user.model';
import { In, IsNull, Not, Repository } from 'typeorm';

@Injectable()
export class DepositAgreementConstraint {
  constructor(
    @InjectRepository(DepositAgreement)
    private depositAgreementRepository: Repository<DepositAgreement>,
  ) {}

  async DepositAgreementIsAlive(depositAgreementID: number | undefined) {
    if (depositAgreementID || depositAgreementID == 0) {
      const exist = await this.depositAgreementRepository.findOne({
        where: {
          depositAgreementID: depositAgreementID,
        },
        select: {
          depositAgreementID: true,
        },
        relations: {
          negotiator: true,
          tenant: true,
          room: true,
          manager: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `depositAgreement:${depositAgreementID} is inactive`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }
  async DepositAgreementsIsNotAlive(depositAgreementIDs: number[] | undefined) {
    if (depositAgreementIDs) {
      const exists = await this.depositAgreementRepository.find({
        where: {
          depositAgreementID: In(depositAgreementIDs),
          deletedAt: Not(IsNull()),
        },
        select: {
          depositAgreementID: true,
        },
        relations: {
          negotiator: true,
          tenant: true,
          room: true,
          manager: true,
        },
        withDeleted: true,
      });
      if (depositAgreementIDs.length > exists.length)
        throw new HttpException(
          'There are some depositAgreementIDs that do not exist or is active',
          HttpStatus.NOT_FOUND,
        );
      return exists;
    }
  }

  async DepositAgreementIsPersisted(
    depositAgreementID: number | undefined | null,
  ) {
    if (depositAgreementID || depositAgreementID == 0) {
      const exist = await this.depositAgreementRepository.findOne({
        where: {
          depositAgreementID: depositAgreementID,
        },
        select: {
          depositAgreementID: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `depositAgreement:${depositAgreementID} does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async DepositAgreementIsNotPersisted(depositAgreementID: number) {
    const exist = await this.depositAgreementRepository.findOne({
      where: {
        depositAgreementID: depositAgreementID,
      },
      select: {
        depositAgreementID: true,
      },
      withDeleted: true,
    });
    if (!exist)
      throw new HttpException(
        `depositAgreement:${depositAgreementID} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    return exist;
  }
}

@Injectable()
export class DepositAgreementProcess {
  RequestorIsNegotiatorWhenCreate(
    requestorID: string,
    depositAgreement: DepositAgreement,
  ) {
    const user = new User();
    user.username = requestorID;
    depositAgreement.negotiator = user;
  }
}
