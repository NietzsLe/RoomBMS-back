import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import {
  ReadTenantDTO,
  CreateResponseTenantDTO,
  CreateTenantDTO,
  HardDeleteAndRecoverTenantDTO,
  UpdateTenantDTO,
  AutocompleteTenantDTO,
  MaxResponseTenantDTO,
} from 'src/dtos/tenant.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';
import { TenantService } from 'src/services/tenant.service';
import { TenantIDsCheckPipe } from './pipes/not-duplicate-value.pipe';

@Controller('tenants')
export class TenantController {
  constructor(private tenantService: TenantService) {}
  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadTenantDTO] })
  @ApiQuery({ name: 'tenantID', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('tenantID', new ParseIntPipe({ optional: true })) tenantID: number,
    @Query('name') name: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.tenantService.findAll(
      tenantID,
      name,
      offsetID,
      requestorRoleIDs,
    );
  }
  @Get('inactive')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadTenantDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'tenantID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('tenantID', new ParseIntPipe({ optional: true })) tenantID: number,
  ) {
    return await this.tenantService.findInactiveAll(tenantID, offsetID);
  }
  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: CreateResponseTenantDTO })
  async create(@Req() request: Request, @Body() dto: CreateTenantDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.tenantService.create(requestorID, dto);
  }
  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async update(@Req() request: Request, @Body() dto: UpdateTenantDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.tenantService.update(requestorRoleIDs, requestorID, dto);
  }
  @Delete(':tenantID')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async softDelete(
    @Req() request: Request,
    @Param('tenantID', ParseIntPipe) tenantID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.tenantService.softRemove(
      requestorRoleIDs,
      requestorID,
      tenantID,
    );
  }
  @Delete('hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async hardDelete(
    @Body(TenantIDsCheckPipe) dto: HardDeleteAndRecoverTenantDTO,
  ) {
    await this.tenantService.hardRemove(dto.tenantIDs);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(@Body(TenantIDsCheckPipe) dto: HardDeleteAndRecoverTenantDTO) {
    await this.tenantService.recover(dto.tenantIDs);
  }
  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: tenants/autocomplete
   * Trả về danh sách autocomplete cho tenants
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteTenantDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.tenantService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: tenants/max
   * Trả về thông tin max cho tenants
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseTenantDTO })
  @Header('Cache-Control', 'max-age=5')
  async getMaxTenant() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.tenantService.getMaxTenant();
  }
}
