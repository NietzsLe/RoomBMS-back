import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AdministrativeUnit } from 'src/models/administrative-unit.model';
import { DistrictUnit } from 'src/models/district-unit.model';
import { ProvinceUnit } from 'src/models/province-unit.model';
import { WardUnit } from 'src/models/ward-unit.model';
import { Repository } from 'typeorm';

@Injectable()
export class AdministrativeUnitConstraint {
  constructor(
    @InjectRepository(AdministrativeUnit)
    private administrativeUnitRepository: Repository<AdministrativeUnit>,
    @InjectRepository(WardUnit)
    private wardUnitRepository: Repository<WardUnit>,
    @InjectRepository(DistrictUnit)
    private districtUnitRepository: Repository<DistrictUnit>,
    @InjectRepository(ProvinceUnit)
    private provinceUnitRepository: Repository<ProvinceUnit>,
  ) {}

  async AdministrativeUnitIsAlive(
    administrativeUnitID: number[] | undefined | null,
  ) {
    if (administrativeUnitID) {
      const exist = await this.administrativeUnitRepository.findOne({
        where: {
          provinceCode: administrativeUnitID[2],
          districtCode: administrativeUnitID[1],
          wardCode: administrativeUnitID[0],
        },
        select: {
          provinceCode: true,
          districtCode: true,
          wardCode: true,
        },
        relations: {
          ward: true,
          district: true,
          province: true,
        },
      });
      if (!exist)
        throw new HttpException(
          `administrativeUnitID:[${administrativeUnitID[0]}, ${administrativeUnitID[1]}, ${administrativeUnitID[2]}] does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async AdministrativeUnitIsPersisted(
    administrativeUnitID: number[] | undefined | null,
  ) {
    if (administrativeUnitID) {
      const exist = await this.administrativeUnitRepository.findOne({
        where: {
          provinceCode: administrativeUnitID[0],
          districtCode: administrativeUnitID[1],
          wardCode: administrativeUnitID[2],
        },
        select: {
          provinceCode: true,
          districtCode: true,
          wardCode: true,
        },
        withDeleted: true,
      });
      if (!exist)
        throw new HttpException(
          `administrativeUnitID:[${administrativeUnitID[0]}, ${administrativeUnitID[1]}, ${administrativeUnitID[2]}] does not exists`,
          HttpStatus.NOT_FOUND,
        );
      return exist;
    }
  }

  async AdministrativeUnitIsNotPersisted(administrativeUnitID: number[]) {
    const exist = await this.administrativeUnitRepository.findOne({
      where: {
        provinceCode: administrativeUnitID[0],
        districtCode: administrativeUnitID[1],
        wardCode: administrativeUnitID[2],
      },
      select: {
        provinceCode: true,
        districtCode: true,
        wardCode: true,
      },
      withDeleted: true,
    });
    if (!exist)
      throw new HttpException(
        `${administrativeUnitID[0]}, ${administrativeUnitID[1]}, ${administrativeUnitID[2]} does not exist`,
        HttpStatus.NOT_FOUND,
      );
    return exist;
  }
  async WardsIsAlive(wardCodes: number[], wardNames: string[]) {
    const exists = await Promise.all(
      wardCodes.map((_, idx) =>
        this.wardUnitRepository.findOne({
          where: {
            wardCode: wardCodes[idx],
            wardName: wardNames[idx],
          },
          relations: { administrativeUnit: true },
          select: {
            wardCode: true,
            wardName: true,
          },
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${wardCodes[idx]}, ${wardNames[idx]}) is inactive`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  async ProvincesIsAlive(provinceCodes: number[], provinceNames: string[]) {
    const exists = await Promise.all(
      provinceCodes.map((_, idx) =>
        this.provinceUnitRepository.findOne({
          where: {
            provinceCode: provinceCodes[idx],
            provinceName: provinceNames[idx],
          },
          select: {
            provinceCode: true,
            provinceName: true,
          },
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${provinceCodes[idx]}, ${provinceNames[idx]}) is inactive`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  async DistrictsIsAlive(districtCodes: number[], districtNames: string[]) {
    const exists = await Promise.all(
      districtCodes.map((_, idx) =>
        this.districtUnitRepository.findOne({
          where: {
            districtCode: districtCodes[idx],
            districtName: districtNames[idx],
          },
          select: {
            districtCode: true,
            districtName: true,
          },
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${districtCodes[idx]}, ${districtNames[idx]}) is inactive`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  async WardsIsNotAlive(wardCodes: number[], wardNames: string[]) {
    const exists = await Promise.all(
      wardCodes.map((_, idx) =>
        this.wardUnitRepository.findOne({
          where: {
            wardCode: wardCodes[idx],
            wardName: wardNames[idx],
          },
          relations: { administrativeUnit: true },
          select: {
            deletedAt: true,
            wardCode: true,
            wardName: true,
          },
          withDeleted: true,
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${wardCodes[idx]}, ${wardNames[idx]}) does not exist`,
          HttpStatus.NOT_FOUND,
        );
      if (exist.deletedAt == null)
        throw new HttpException(
          `Pair (${wardCodes[idx]}, ${wardNames[idx]}) has not been archived`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  async ProvincesIsNotAlive(provinceCodes: number[], provinceNames: string[]) {
    const exists = await Promise.all(
      provinceCodes.map((_, idx) =>
        this.provinceUnitRepository.findOne({
          where: {
            provinceCode: provinceCodes[idx],
            provinceName: provinceNames[idx],
          },
          select: {
            deletedAt: true,
            provinceCode: true,
            provinceName: true,
          },
          withDeleted: true,
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${provinceCodes[idx]}, ${provinceNames[idx]}) does not exist`,
          HttpStatus.NOT_FOUND,
        );
      if (exist.deletedAt == null)
        throw new HttpException(
          `Pair (${provinceCodes[idx]}, ${provinceNames[idx]}) has not been archived`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  async DistrictsIsNotAlive(districtCodes: number[], districtNames: string[]) {
    const exists = await Promise.all(
      districtCodes.map((_, idx) =>
        this.districtUnitRepository.findOne({
          where: {
            districtCode: districtCodes[idx],
            districtName: districtNames[idx],
          },
          select: {
            deletedAt: true,
            districtCode: true,
            districtName: true,
          },
          withDeleted: true,
        }),
      ),
    );
    exists.forEach((exist, idx) => {
      if (!exist)
        throw new HttpException(
          `Pair (${districtCodes[idx]}, ${districtNames[idx]}) does not exist`,
          HttpStatus.NOT_FOUND,
        );
      if (exist.deletedAt == null)
        throw new HttpException(
          `Pair (${districtCodes[idx]}, ${districtNames[idx]}) has not been archived`,
          HttpStatus.NOT_FOUND,
        );
    });
    return exists;
  }

  ResourceIsSoftRemoved(
    exists: WardUnit[] | DistrictUnit[] | ProvinceUnit[],
    Codes: number[],
    Names: string[],
  ) {
    exists.forEach(
      (item: WardUnit | DistrictUnit | ProvinceUnit, idx: number) => {
        if (item.deletedAt == null)
          throw new HttpException(
            `Pair (${Codes[idx]}, ${Names[idx]}) has not been soft remove`,
            HttpStatus.NOT_FOUND,
          );
      },
    );
  }

  NamesAndCodesIsSameSize(Codes: number[], Names: string[]) {
    if (Codes.length != Names.length)
      throw new HttpException(
        'Names and Codes must be the same size',
        HttpStatus.BAD_REQUEST,
      );
  }
}

@Injectable()
export class AdministrativeUnitProcess {}
