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
} from 'src/dtos/access-rule.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/not-empty-check.pipe';
import { AccessRuleService } from 'src/services/access-rule.service';
import { Request } from 'express';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';

@Controller('access-rules')
export class AccessRuleController {
  constructor(private accessRuleService: AccessRuleService) {}

  @Get()
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadAccessRuleDTO] })
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
  @Post()
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: CreateAccessRuleDTO })
  async create(@Body() dto: CreateAccessRuleDTO) {
    return await this.accessRuleService.create(dto);
  }
  @Patch()
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async update(@Body() dto: UpdateAccessRuleDTO) {
    await this.accessRuleService.update(dto);
  }
  @Delete('hard-delete/:roleID/:resourceID')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
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
