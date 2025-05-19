import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';

import {
  ReadAccessRuleDTO,
  CreateAccessRuleDTO,
  UpdateAccessRuleDTO,
} from 'src/dtos/accessRuleDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/notEmptyCheck.pipe';
import { AccessRuleService } from 'src/services/accessRule.service';
import { Request } from 'express';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';

@Controller('access-rules')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class AccessRuleController {
  constructor(private accessRuleService: AccessRuleService) {}

  @Get()
  @ApiOkResponse({ type: [ReadAccessRuleDTO] })
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'roleID', required: false })
  @ApiQuery({ name: 'resourceID', required: false })
  @ApiQuery({ name: 'roleIDOffsetID', required: false })
  @ApiQuery({ name: 'resourceIDOffsetID', required: false })
  async findAll(
    @Req() request: Request,
    @Query('roleIDOffsetID') roleIDOffsetID: string = '',
    @Query('resourceIDOffsetID') resourceIDOffsetID: string = '',
    @Query('roleID') roleID: string = '',
    @Query('resourceID') resourceID: string = '',
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.accessRuleService.findAll(
      { roleID: roleID, resourceID: resourceID },
      {
        roleID: roleIDOffsetID,
        resourceID: resourceIDOffsetID,
      },
      requestorRoleIDs,
    );
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiOkResponse({ type: CreateAccessRuleDTO })
  @Post()
  async create(@Body() dto: CreateAccessRuleDTO) {
    return await this.accessRuleService.create(dto);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Patch()
  async update(@Body() dto: UpdateAccessRuleDTO) {
    await this.accessRuleService.update(dto);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete/:roleID/:resourceID')
  async hardDelete(
    @Param('roleID', NotEmptyCheckPipe) roleID: string = '',
    @Param('resourceID', NotEmptyCheckPipe) resourceID: string = '',
  ) {
    await this.accessRuleService.hardRemove({
      roleID: roleID,
      resourceID: resourceID,
    });
  }
}
