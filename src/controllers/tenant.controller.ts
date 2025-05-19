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
} from 'src/dtos/tenantDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { TenantService } from 'src/services/tenant.service';
import { TenantIDsCheckPipe } from './pipes/notDuplicateValue.pipe';

@Controller('tenants')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class TenantController {
  constructor(private tenantService: TenantService) {}
  @Get()
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
  @ApiOkResponse({ type: CreateResponseTenantDTO })
  @Post()
  async create(@Req() request: Request, @Body() dto: CreateTenantDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.tenantService.create(requestorID, dto);
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
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(@Body(TenantIDsCheckPipe) dto: HardDeleteAndRecoverTenantDTO) {
    await this.tenantService.recover(dto.tenantIDs);
  }
}
