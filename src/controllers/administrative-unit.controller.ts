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
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
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
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findAllProvince() {
    return this.administrativeUnitService.findAllProvince();
  }
  @Get('district-unit')
  @ApiOkResponse({ type: [ReadDistrictUnitDTO] })
  async findAllDistrict(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    return this.administrativeUnitService.findAllDistrict(provinceUnitID);
  }
  @Get('ward-unit')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  async findAllWard(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    return this.administrativeUnitService.findAllWard(districtUnitID);
  }
  @Get('province-unit/inactive')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  async findInactiveAllProvince() {
    return this.administrativeUnitService.findInactiveAllProvince();
  }
  @Get('district-unit/inactive')
  @ApiOkResponse({ type: [ReadDistrictUnitDTO] })
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
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
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
