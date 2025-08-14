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
  ReadDepositAgreementDTO,
  CreateDepositAgreementDTO,
  CreateResponseDepositAgreementDTO,
  HardDeleteAndRecoverDepositAgreementDTO,
  UpdateDepositAgreementDTO,
  AutocompleteDepositAgreementDTO,
  MaxResponseDepositAgreementDTO,
} from 'src/dtos/deposit-agreement.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';
import { DepositAgreementService } from 'src/services/deposit-agreement.service';
import { DepositAgreementIDsCheckPipe } from './pipes/not-duplicate-value.pipe';
import { ParseDatePipe } from './pipes/date.pipe';

@Controller('deposit-agreements')
export class DepositAgreementController {
  constructor(private depositAgreementService: DepositAgreementService) {}
  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadDepositAgreementDTO] })
  @ApiQuery({ name: 'depositAgreementID', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('depositAgreementID', new ParseIntPipe({ optional: true }))
    depositAgreementID: number,
    @Query('fromDate', ParseDatePipe) fromDate: Date,
    @Query('toDate', ParseDatePipe) toDate: Date,
    @Query('name')
    name: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.depositAgreementService.findAll(
      depositAgreementID,
      name,
      fromDate,
      toDate,
      offsetID,
      requestorRoleIDs,
    );
  }
  @Get('for-sheet')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadDepositAgreementDTO] })
  @ApiQuery({ name: 'depositAgreementID', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async getForSheet(
    @Req() request: Request,
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('depositAgreementID', new ParseIntPipe({ optional: true }))
    depositAgreementID: number,
    @Query('fromDate', ParseDatePipe) fromDate: Date,
    @Query('toDate', ParseDatePipe) toDate: Date,
    @Query('name')
    name: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.depositAgreementService.getForSheet(
      depositAgreementID,
      name,
      fromDate,
      toDate,
      offsetID,
      requestorRoleIDs,
    );
  }
  @Get('inactive')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadDepositAgreementDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'depositAgreementID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('depositAgreementID', new ParseIntPipe({ optional: true }))
    depositAgreementID: number,
  ) {
    return await this.depositAgreementService.findInactiveAll(
      depositAgreementID,
      offsetID,
    );
  }
  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: CreateResponseDepositAgreementDTO })
  async create(
    @Req() request: Request,
    @Body() dto: CreateDepositAgreementDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.depositAgreementService.create(requestorID, dto);
  }
  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
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
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
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
  @Delete('hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async hardDelete(
    @Body(DepositAgreementIDsCheckPipe)
    dto: HardDeleteAndRecoverDepositAgreementDTO,
  ) {
    await this.depositAgreementService.hardRemove(dto.depositAgreementIDs);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(
    @Body(DepositAgreementIDsCheckPipe)
    dto: HardDeleteAndRecoverDepositAgreementDTO,
  ) {
    await this.depositAgreementService.recover(dto.depositAgreementIDs);
  }
  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: deposit-agreements/autocomplete
   * Trả về danh sách autocomplete cho deposit-agreements
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteDepositAgreementDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.depositAgreementService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: deposit-agreements/max
   * Trả về thông tin max cho deposit-agreements
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseDepositAgreementDTO })
  @Header('Cache-Control', 'max-age=5')
  async getMaxDepositAgreement() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.depositAgreementService.getMaxDepositAgreement();
  }
}
