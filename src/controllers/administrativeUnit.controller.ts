import {
  Body,
  Controller,
  Delete,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdministrativeUnitService } from 'src/services/administrativeUnit.service';
import {
  BaseDistrictUnitDTO,
  BaseProvinceUnitDTO,
  DeleteAndRecoverDistrictUnitDTO,
  DeleteAndRecoverProvinceUnitDTO,
  DeleteAndRecoverWardUnitDTO,
} from 'src/dtos/administrativeUnitDTO';
import {
  JustAdminRolesGuard,
  JustSuperAdminRoleGuard,
} from 'src/guards/justAdminRoles.guard';
import {
  DistrictCodesCheckPipe,
  ProvinceCodesCheckPipe,
  WardCodesCheckPipe,
} from './pipes/notDuplicateValue.pipe';

@Controller('administrative-units')
@ApiCookieAuth('JWTAuth')
export class AdministrativeUnitController {
  constructor(private administrativeUnitService: AdministrativeUnitService) {}
  @Get('province-unit')
  @ApiOkResponse({ type: [BaseProvinceUnitDTO] })
  async findAllProvince() {
    return this.administrativeUnitService.findAllProvince();
  }
  @Get('district-unit')
  @ApiOkResponse({ type: [BaseDistrictUnitDTO] })
  async findAllDistrict(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    return this.administrativeUnitService.findAllDistrict(provinceUnitID);
  }
  @Get('ward-unit')
  @ApiOkResponse({ type: [BaseProvinceUnitDTO] })
  async findAllWard(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    return this.administrativeUnitService.findAllWard(districtUnitID);
  }
  @Get('province-unit/inactive')
  @ApiOkResponse({ type: [BaseProvinceUnitDTO] })
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  async findInactiveAllProvince() {
    return this.administrativeUnitService.findInactiveAllProvince();
  }
  @Get('district-unit/inactive')
  @ApiOkResponse({ type: [BaseDistrictUnitDTO] })
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  async findInactiveAllDistrict(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    return this.administrativeUnitService.findInactiveAllDistrict(
      provinceUnitID,
    );
  }
  @Get('ward-unit/inactive')
  @ApiOkResponse({ type: [BaseProvinceUnitDTO] })
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  async findInactiveAllWard(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    return this.administrativeUnitService.findInactiveAllWard(districtUnitID);
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @Delete('ward-unit')
  @ApiOkResponse()
  async softDeleteWards(@Body() dto: DeleteAndRecoverWardUnitDTO) {
    await this.administrativeUnitService.softRemoveWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('ward-unit/hard-delete')
  @ApiOkResponse()
  async hardDeleteWards(
    @Body(WardCodesCheckPipe) dto: DeleteAndRecoverWardUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @Delete('district-unit')
  @ApiOkResponse()
  async softDeleteDistricts(@Body() dto: DeleteAndRecoverDistrictUnitDTO) {
    await this.administrativeUnitService.softRemoveDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('district-unit/hard-delete')
  @ApiOkResponse()
  async hardDeleteDistricts(
    @Body(DistrictCodesCheckPipe) dto: DeleteAndRecoverDistrictUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @Delete('province-unit')
  @ApiOkResponse()
  async softDeleteProvinces(@Body() dto: DeleteAndRecoverProvinceUnitDTO) {
    await this.administrativeUnitService.softRemoveProvinces(
      dto.provinceCodes,
      dto.provinceNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('province-unit/hard-delete')
  @ApiOkResponse()
  async hardDeleteProvinces(
    @Body(ProvinceCodesCheckPipe) dto: DeleteAndRecoverProvinceUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveProvinces(
      dto.provinceCodes,
      dto.provinceNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('ward-unit/recover')
  @ApiOkResponse()
  async recoverWard(
    @Body(WardCodesCheckPipe) dto: DeleteAndRecoverWardUnitDTO,
  ) {
    await this.administrativeUnitService.recoverWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('district-unit/recover')
  @ApiOkResponse()
  async recoverDistricts(
    @Body(DistrictCodesCheckPipe) dto: DeleteAndRecoverDistrictUnitDTO,
  ) {
    await this.administrativeUnitService.recoverDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('province-unit/recover')
  @ApiOkResponse()
  async recoverProvinces(
    @Body(ProvinceCodesCheckPipe) dto: DeleteAndRecoverProvinceUnitDTO,
  ) {
    await this.administrativeUnitService.recoverProvinces(
      dto.provinceCodes,
      dto.provinceNames,
    );
  }
}
