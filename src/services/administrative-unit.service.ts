import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DistrictUnitMapper } from 'src/mappers/district-unit.mapper';
import { ProvinceUnitMapper } from 'src/mappers/province-unit.mapper';
import { WardUnitMapper } from 'src/mappers/ward-unit.mapper';
import { DistrictUnit } from 'src/models/district-unit.model';
import { ProvinceUnit } from 'src/models/province-unit.model';
import { WardUnit } from 'src/models/ward-unit.model';

import { In, IsNull, Not, Repository } from 'typeorm';
import { AdministrativeUnitConstraint } from './constraints/administrative-unit.helper';

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
      ProvinceUnitMapper.EntityToReadDTO(province),
    );
  }
  async getProvinceAutocomplete() {
    const provinces = await this.provinceUnitRepository.find({
      select: {
        provinceCode: true,
        provinceName: true,
      },
      order: {
        provinceCode: 'ASC',
      },
    });
    return provinces.map((province) =>
      ProvinceUnitMapper.EntityToReadDTO(province),
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
    // console.log('@Service: \n', provinces);
    return provinces.map((province) =>
      ProvinceUnitMapper.EntityToReadDTO(province),
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
    // console.log('@Service: \n', districts);
    return districts.map((district) =>
      DistrictUnitMapper.EntityToReadDTO(district),
    );
  }
  async getDistrictAutocomplete(provinceCode: number) {
    const districts = await this.districtUnitRepository.find({
      where: {
        provinceCode: provinceCode,
      },
      select: { districtCode: true, districtName: true },
      order: {
        districtCode: 'ASC',
      },
    });
    // console.log('@Service: \n', districts);
    return districts.map((district) =>
      DistrictUnitMapper.EntityToReadDTO(district),
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
    // console.log('@Service: \n', districts);
    return districts.map((district) =>
      DistrictUnitMapper.EntityToReadDTO(district),
    );
  }
  async findAllWard(districtCode: number) {
    const wards = await this.wardUnitRepository.find({
      where: {
        districtCode: districtCode,
      },
      select: { wardCode: true, wardName: true },
      order: {
        wardCode: 'ASC',
      },
    });
    // console.log('@Service: \n', wards);
    return wards.map((ward) => WardUnitMapper.EntityToReadDTO(ward));
  }
  async getWardAutocomplete(districtCode: number) {
    const wards = await this.wardUnitRepository.find({
      where: {
        districtCode: districtCode,
      },
      order: {
        wardCode: 'ASC',
      },
    });
    // console.log('@Service: \n', wards);
    return wards.map((ward) => WardUnitMapper.EntityToReadDTO(ward));
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
    // console.log('@Service: \n', wards);
    return wards.map((ward) => WardUnitMapper.EntityToReadDTO(ward));
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
      relations: { administrativeUnit: true },
      select: { wardCode: true },
    });
    await this.wardUnitRepository.softRemove(result);
  }
  async trustHardRemoveWards(districtCodes: number[]) {
    const result = await this.wardUnitRepository.find({
      where: { districtCode: In(districtCodes) },
      relations: { administrativeUnit: true },
      select: { wardCode: true },
      withDeleted: true,
    });
    await this.wardUnitRepository.remove(result);
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
    // console.log('@Constraint: \n', result);
    await this.trustRecoverDistricts(provinceCodes);
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
    await this.trustRecoverWards(districtCodes);
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
  async trustRecoverDistricts(provinceCodes: number[]) {
    const result = await this.districtUnitRepository.find({
      where: { provinceCode: In(provinceCodes), deletedAt: Not(IsNull()) },
      select: { districtCode: true },
      withDeleted: true,
    });
    await this.trustRecoverWards(result.map((item) => item.districtCode));
    await this.districtUnitRepository.recover(result);
  }
  async trustRecoverWards(districtCodes: number[]) {
    const result = await this.wardUnitRepository.find({
      where: { districtCode: In(districtCodes), deletedAt: Not(IsNull()) },
      select: { wardCode: true },
      relations: { administrativeUnit: true },
      withDeleted: true,
    });
    await this.wardUnitRepository.recover(result);
  }
}
