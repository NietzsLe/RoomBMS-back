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
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { AdministrativeUnitService } from 'src/services/administrative-unit.service';
import {
  ReadDistrictUnitDTO,
  ReadProvinceUnitDTO,
  DeleteAndRecoverDistrictUnitDTO,
  DeleteAndRecoverProvinceUnitDTO,
  DeleteAndRecoverWardUnitDTO,
  AutocompleteWardUnitDTO,
  AutocompleteDistrictUnitDTO,
  AutocompleteProvinceUnitDTO,
} from 'src/dtos/administrative-unit.dto';
import {
  JustAdminRolesGuard,
  JustSuperAdminRoleGuard,
} from 'src/guards/just-admin-roles.guard';
import {
  DistrictCodesCheckPipe,
  ProvinceCodesCheckPipe,
  WardCodesCheckPipe,
} from './pipes/not-duplicate-value.pipe';

@Controller('administrative-units')
export class AdministrativeUnitController {
  constructor(private administrativeUnitService: AdministrativeUnitService) {}
  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: administrative-units/ward-unit/autocomplete
   * Trả về danh sách autocomplete cho ward-unit
   */
  @Get('ward-unit/autocomplete')
  @ApiOkResponse({ type: [AutocompleteWardUnitDTO] })
  @ApiQuery({ name: 'districtCode', required: true })
  async getWardAutocomplete(
    @Query('districtCode', ParseIntPipe) districtCode: number,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.administrativeUnitService.getWardAutocomplete(
      districtCode,
    );
  }
  /**
   * Endpoint: administrative-units/district-unit/autocomplete
   * Trả về danh sách autocomplete cho district-unit
   */
  @Get('district-unit/autocomplete')
  @ApiOkResponse({ type: [AutocompleteDistrictUnitDTO] })
  @ApiQuery({ name: 'provinceCode', required: true })
  async getDistrictAutocomplete(
    @Query('provinceCode', ParseIntPipe) provinceCode: number,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.administrativeUnitService.getDistrictAutocomplete(
      provinceCode,
    );
  }
  /**
   * Endpoint: administrative-units/province-unit/autocomplete
   * Trả về danh sách autocomplete cho province-unit
   */
  @Get('province-unit/autocomplete')
  @ApiOkResponse({ type: [AutocompleteProvinceUnitDTO] })
  async getProvinceAutocomplete() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.administrativeUnitService.getProvinceAutocomplete();
  }
  @Get('province-unit')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findAllProvince() {
    return this.administrativeUnitService.findAllProvince();
  }
  @Get('district-unit')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadDistrictUnitDTO] })
  async findAllDistrict(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    return this.administrativeUnitService.findAllDistrict(provinceUnitID);
  }
  @Get('ward-unit')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findAllWard(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    return this.administrativeUnitService.findAllWard(districtUnitID);
  }
  @Get('province-unit/inactive')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findInactiveAllProvince() {
    return this.administrativeUnitService.findInactiveAllProvince();
  }
  @Get('district-unit/inactive')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadDistrictUnitDTO] })
  async findInactiveAllDistrict(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    return this.administrativeUnitService.findInactiveAllDistrict(
      provinceUnitID,
    );
  }
  @Get('ward-unit/inactive')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findInactiveAllWard(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    return this.administrativeUnitService.findInactiveAllWard(districtUnitID);
  }
  @Delete('ward-unit')
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async softDeleteWards(@Body() dto: DeleteAndRecoverWardUnitDTO) {
    await this.administrativeUnitService.softRemoveWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @Delete('ward-unit/hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async hardDeleteWards(
    @Body(WardCodesCheckPipe) dto: DeleteAndRecoverWardUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @Delete('district-unit')
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async softDeleteDistricts(@Body() dto: DeleteAndRecoverDistrictUnitDTO) {
    await this.administrativeUnitService.softRemoveDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @UseGuards(AuthGuard)
  @Delete('district-unit/hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async hardDeleteDistricts(
    @Body(DistrictCodesCheckPipe) dto: DeleteAndRecoverDistrictUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @Delete('province-unit')
  @UseGuards(AuthGuard)
  @UseGuards(JustAdminRolesGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async softDeleteProvinces(@Body() dto: DeleteAndRecoverProvinceUnitDTO) {
    await this.administrativeUnitService.softRemoveProvinces(
      dto.provinceCodes,
      dto.provinceNames,
    );
  }
  @Delete('province-unit/hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async hardDeleteProvinces(
    @Body(ProvinceCodesCheckPipe) dto: DeleteAndRecoverProvinceUnitDTO,
  ) {
    await this.administrativeUnitService.hardRemoveProvinces(
      dto.provinceCodes,
      dto.provinceNames,
    );
  }
  @Post('ward-unit/recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async recoverWard(
    @Body(WardCodesCheckPipe) dto: DeleteAndRecoverWardUnitDTO,
  ) {
    await this.administrativeUnitService.recoverWards(
      dto.wardCodes,
      dto.wardNames,
    );
  }
  @Post('district-unit/recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse()
  async recoverDistricts(
    @Body(DistrictCodesCheckPipe) dto: DeleteAndRecoverDistrictUnitDTO,
  ) {
    await this.administrativeUnitService.recoverDistricts(
      dto.districtCodes,
      dto.districtNames,
    );
  }
  @Post('province-unit/recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
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
