import {
  Body,
  Controller,
  Delete,
  Get,
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
  BaseTenantDTO,
  CreateTenantDTO,
  HardDeleteAndRecoverTenantDTO,
  UpdateTenantDTO,
} from 'src/dtos/tenantDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { createFindOptionSelectWithBlacklist } from 'src/services/helper';
import { TenantService } from 'src/services/tenant.service';
import { TenantIDsCheckPipe } from './pipes/notDuplicateValue.pipe';

@Controller('tenants')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class TenantController {
  constructor(private tenantService: TenantService) {}
  @Get()
  @ApiOkResponse({ type: [BaseTenantDTO] })
  @ApiQuery({ name: 'tenantID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findAll(
    @Req() request: Request,
    @Query('offsetID') offsetID: number = 0,
    @Query('tenantID') tenantID: number,
  ) {
    const blackList = request['resourceBlackListAttrs'] as string[];
    return await this.tenantService.findAll(
      tenantID,
      offsetID,
      createFindOptionSelectWithBlacklist(BaseTenantDTO, blackList),
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [BaseTenantDTO] })
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'tenantID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID') offsetID: number = 0,
    @Query('tenantID') tenantID: number,
  ) {
    return await this.tenantService.findInactiveAll(tenantID, offsetID);
  }
  @Post()
  async create(@Req() request: Request, @Body() dto: CreateTenantDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    await this.tenantService.create(requestorID, dto);
  }
  @Patch()
  async update(@Req() request: Request, @Body() dto: UpdateTenantDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.tenantService.update(requestorRoleIDs, requestorID, dto);
  }
  @Delete(':tenantID')
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
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete')
  async hardDelete(
    @Body(TenantIDsCheckPipe) dto: HardDeleteAndRecoverTenantDTO,
  ) {
    await this.tenantService.hardRemove(dto.tenantIDs);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(@Body(TenantIDsCheckPipe) dto: HardDeleteAndRecoverTenantDTO) {
    await this.tenantService.recover(dto.tenantIDs);
  }
}
