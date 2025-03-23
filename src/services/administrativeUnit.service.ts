import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DistrictUnitMapper } from 'src/mappers/districtUnit.mapper';
import { ProvinceUnitMapper } from 'src/mappers/provinceUnit.mapper';
import { WardUnitMapper } from 'src/mappers/wardUnit.mapper';
import { DistrictUnit } from 'src/models/districtUnit.model';
import { ProvinceUnit } from 'src/models/provinceUnit.model';
import { WardUnit } from 'src/models/wardUnit.model';

import { In, IsNull, Not, Repository } from 'typeorm';
import { AdministrativeUnitConstraint } from './constraints/administrativeUnit.helper';

@Injectable()
export class AdministrativeUnitService {
  constructor(
    @InjectRepository(WardUnit)
    private wardUnitRepository: Repository<WardUnit>,
    @InjectRepository(DistrictUnit)
    private districtUnitRepository: Repository<DistrictUnit>,
    @InjectRepository(ProvinceUnit)
    private provinceUnitRepository: Repository<ProvinceUnit>,
    private constraint: AdministrativeUnitConstraint,
  ) {}
  async findAllProvince() {
    const provinces = await this.provinceUnitRepository.find({
      order: {
        provinceCode: 'ASC',
      },
    });
    return provinces.map((province) =>
      ProvinceUnitMapper.EntityToBaseDTO(province),
    );
  }
  async findInactiveAllProvince() {
    const provinces = await this.provinceUnitRepository.find({
      where: { deletedAt: Not(IsNull()) },
      order: {
        provinceCode: 'ASC',
      },
      withDeleted: true,
    });
    //console.log('@Service: \n', provinces);
    return provinces.map((province) =>
      ProvinceUnitMapper.EntityToBaseDTO(province),
    );
  }
  async findAllDistrict(provinceCode: number) {
    const districts = await this.districtUnitRepository.find({
      where: {
        provinceCode: provinceCode,
      },
      order: {
        districtCode: 'ASC',
      },
    });
    //console.log('@Service: \n', districts);
    return districts.map((district) =>
      DistrictUnitMapper.EntityToBaseDTO(district),
    );
  }
  async findInactiveAllDistrict(provinceCode: number) {
    const districts = await this.districtUnitRepository.find({
      where: {
        provinceCode: provinceCode,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      order: {
        districtCode: 'ASC',
      },
    });
    //console.log('@Service: \n', districts);
    return districts.map((district) =>
      DistrictUnitMapper.EntityToBaseDTO(district),
    );
  }
  async findAllWard(districtCode: number) {
    const wards = await this.wardUnitRepository.find({
      where: {
        districtCode: districtCode,
      },
      order: {
        wardCode: 'ASC',
      },
    });
    //console.log('@Service: \n', wards);
    return wards.map((ward) => WardUnitMapper.EntityToBaseDTO(ward));
  }
  async findInactiveAllWard(districtCode: number) {
    const wards = await this.wardUnitRepository.find({
      where: {
        districtCode: districtCode,
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
      order: {
        wardCode: 'ASC',
      },
    });
    //console.log('@Service: \n', wards);
    return wards.map((ward) => WardUnitMapper.EntityToBaseDTO(ward));
  }

  async softRemoveWards(wardCodes: number[], wardNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(wardCodes, wardNames);
    const result = await this.constraint.WardsIsAlive(wardCodes, wardNames);
    await this.wardUnitRepository.softRemove(result as WardUnit[]);
  }
  async hardRemoveWards(wardCodes: number[], wardNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(wardCodes, wardNames);
    const result = await this.constraint.WardsIsNotAlive(wardCodes, wardNames);
    await this.wardUnitRepository.remove(result as WardUnit[]);
  }
  async trustSoftRemoveWards(districtCodes: number[]) {
    const result = await this.wardUnitRepository.find({
      where: { districtCode: In(districtCodes) },
      select: { districtCode: true },
    });
    await this.wardUnitRepository.softRemove(result);
  }
  async trustHardRemoveWards(districtCodes: number[]) {
    const result = await this.wardUnitRepository.find({
      where: { districtCode: In(districtCodes) },
      select: { districtCode: true },
      withDeleted: true,
    });
    await this.wardUnitRepository.softRemove(result);
  }
  async softRemoveDistricts(districtCodes: number[], districtNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(districtCodes, districtNames);
    const result = await this.constraint.DistrictsIsAlive(
      districtCodes,
      districtNames,
    );
    await this.trustSoftRemoveWards(districtCodes);
    await this.districtUnitRepository.softRemove(result as DistrictUnit[]);
  }

  async hardRemoveDistricts(districtCodes: number[], districtNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(districtCodes, districtNames);
    const result = await this.constraint.DistrictsIsNotAlive(
      districtCodes,
      districtNames,
    );
    await this.trustHardRemoveWards(districtCodes);
    await this.districtUnitRepository.remove(result as DistrictUnit[]);
  }
  async trustSoftRemoveDistricts(provinceCodes: number[]) {
    const result = await this.districtUnitRepository.find({
      where: { provinceCode: In(provinceCodes) },
      select: { districtCode: true },
    });
    await this.trustSoftRemoveWards(result.map((item) => item.districtCode));
    await this.districtUnitRepository.softRemove(result);
  }

  async trustHardRemoveDistricts(provinceCodes: number[]) {
    const result = await this.districtUnitRepository.find({
      where: { provinceCode: In(provinceCodes) },
      select: { districtCode: true },
      withDeleted: true,
    });
    await this.trustSoftRemoveWards(result.map((item) => item.districtCode));
    await this.districtUnitRepository.remove(result);
  }
  async softRemoveProvinces(provinceCodes: number[], provinceNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(provinceCodes, provinceNames);
    const result = await this.constraint.ProvincesIsAlive(
      provinceCodes,
      provinceNames,
    );
    await this.trustSoftRemoveDistricts(provinceCodes);
    await this.provinceUnitRepository.softRemove(result as ProvinceUnit[]);
  }
  async hardRemoveProvinces(provinceCodes: number[], provinceNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(provinceCodes, provinceNames);
    const result = await this.constraint.ProvincesIsNotAlive(
      provinceCodes,
      provinceNames,
    );
    await this.trustHardRemoveDistricts(provinceCodes);
    await this.provinceUnitRepository.remove(result as ProvinceUnit[]);
  }

  async recoverProvinces(provinceCodes: number[], provinceNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(provinceCodes, provinceNames);
    const result = await this.constraint.ProvincesIsNotAlive(
      provinceCodes,
      provinceNames,
    );
    this.constraint.ResourceIsSoftRemoved(
      result as ProvinceUnit[],
      provinceCodes,
      provinceNames,
    );
    //console.log('@Constraint: \n', result);
    await this.provinceUnitRepository.recover(result as ProvinceUnit[]);
  }

  async recoverDistricts(districtCodes: number[], districtNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(districtCodes, districtNames);
    const result = await this.constraint.DistrictsIsNotAlive(
      districtCodes,
      districtNames,
    );
    this.constraint.ResourceIsSoftRemoved(
      result as DistrictUnit[],
      districtCodes,
      districtNames,
    );
    await this.districtUnitRepository.recover(result as DistrictUnit[]);
  }
  async recoverWards(wardCodes: number[], wardNames: string[]) {
    this.constraint.NamesAndCodesIsSameSize(wardCodes, wardNames);
    const result = await this.constraint.WardsIsNotAlive(wardCodes, wardNames);
    this.constraint.ResourceIsSoftRemoved(
      result as WardUnit[],
      wardCodes,
      wardNames,
    );
    await this.wardUnitRepository.recover(result as WardUnit[]);
  }
}
