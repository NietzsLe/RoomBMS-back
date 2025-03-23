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
  BaseDepositAgreementDTO,
  CreateDepositAgreementDTO,
  HardDeleteAndRecoverDepositAgreementDTO,
  UpdateDepositAgreementDTO,
} from 'src/dtos/depositAgreementDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { DepositAgreementService } from 'src/services/depositAgreement.service';
import { createFindOptionSelectWithBlacklist } from 'src/services/helper';
import { DepositAgreementIDsCheckPipe } from './pipes/notDuplicateValue.pipe';

@Controller('deposit-agreements')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class DepositAgreementController {
  constructor(private depositAgreementService: DepositAgreementService) {}
  @Get()
  @ApiOkResponse({ type: [BaseDepositAgreementDTO] })
  @ApiQuery({ name: 'depositAgreementID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findAll(
    @Req() request: Request,
    @Query('offsetID') offsetID: number = 0,
    @Query('depositAgreementID') depositAgreementID: number,
  ) {
    const blackList = request['resourceBlackListAttrs'] as string[];
    return await this.depositAgreementService.findAll(
      depositAgreementID,
      offsetID,
      createFindOptionSelectWithBlacklist(BaseDepositAgreementDTO, blackList),
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [BaseDepositAgreementDTO] })
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'depositAgreementID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID') offsetID: number = 0,
    @Query('depositAgreementID') depositAgreementID: number,
  ) {
    return await this.depositAgreementService.findInactiveAll(
      depositAgreementID,
      offsetID,
    );
  }
  @Post()
  async create(
    @Req() request: Request,
    @Body() dto: CreateDepositAgreementDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    await this.depositAgreementService.create(requestorID, dto);
  }
  @Patch()
  async update(
    @Req() request: Request,
    @Body() dto: UpdateDepositAgreementDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.depositAgreementService.update(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }
  @Delete(':depositAgreementID')
  async softDelete(
    @Req() request: Request,
    @Param('depositAgreementID', ParseIntPipe) depositAgreementID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.depositAgreementService.softRemove(
      requestorRoleIDs,
      requestorID,
      depositAgreementID,
    );
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete')
  async hardDelete(
    @Body(DepositAgreementIDsCheckPipe)
    dto: HardDeleteAndRecoverDepositAgreementDTO,
  ) {
    await this.depositAgreementService.hardRemove(dto.depositAgreementIDs);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(
    @Body(DepositAgreementIDsCheckPipe)
    dto: HardDeleteAndRecoverDepositAgreementDTO,
  ) {
    await this.depositAgreementService.recover(dto.depositAgreementIDs);
  }
}
