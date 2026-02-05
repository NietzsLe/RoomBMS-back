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
  ReadAppointmentDTO,
  CreateAppointmentDTO,
  CreateResponseAppointmentDTO,
  HardDeleteAndRecoverAppointmentDTO,
  TakenOverAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentForRelatedUserDTO,
  UpdateDepositAgreementForRelatedUserDTO,
  UpdateTenantForRelatedUserDTO,
  AutocompleteAppointmentDTO,
  MaxResponseAppointmentDTO,
} from 'src/dtos/appointment.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';
import { AppointmentService } from 'src/services/appointment.service';
import { AppointmentIDsCheckPipe } from './pipes/not-duplicate-value.pipe';
import { ParseDatePipe } from './pipes/date.pipe';

@Controller('appointments')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @ApiQuery({ name: 'relatedTeamID', required: false })
  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadAppointmentDTO] })
  @ApiQuery({ name: 'appointmentID', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'roomID', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'relatedUsername', required: false })
  @ApiQuery({ name: 'ID_desc_cursor', required: false })
  @ApiQuery({ name: 'appointmentTime_desc_cursor', required: false })
  @ApiQuery({ name: 'appointmentTime_asc_cursor', required: false })
  @ApiQuery({ name: 'order_type', required: false })
  @Header('Cache-Control', 'max-age=1')
  async findAll(
    @Req() request: Request,
    @Query('appointmentID', new ParseIntPipe({ optional: true }))
    appointmentID: number,
    @Query('name') name: string,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
    @Query('roomID', new ParseIntPipe({ optional: true })) roomID: number,
    @Query('fromDate', ParseDatePipe) fromDate: Date,
    @Query('toDate', ParseDatePipe) toDate: Date,
    @Query('status') status: string,
    @Query('relatedUsername') relatedUsername: string,
    @Query('relatedTeamID') relatedTeamID: string,
    @Query('ID_desc_cursor', new ParseIntPipe({ optional: true }))
    ID_desc_cursor: number,
    @Query('appointmentTime_desc_cursor', ParseDatePipe)
    appointmentTime_desc_cursor: Date,
    @Query('appointmentTime_asc_cursor', ParseDatePipe)
    appointmentTime_asc_cursor: Date,
    @Query('order_type')
    order_type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.appointmentService.findAll(
      appointmentID,
      name,
      houseID,
      roomID,
      fromDate,
      toDate,
      status,
      relatedUsername,
      relatedTeamID,
      ID_desc_cursor,
      appointmentTime_desc_cursor,
      appointmentTime_asc_cursor,
      order_type,
      requestorRoleIDs,
      requestorID,
    );
  }
  @Get('inactive')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadAppointmentDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'appointmentID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactivateAll(
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('appointmentID', new ParseIntPipe({ optional: true }))
    appointmentID: number,
  ) {
    return await this.appointmentService.findInactiveAll(
      appointmentID,
      offsetID,
    );
  }
  @ApiOkResponse({ type: CreateResponseAppointmentDTO })
  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async create(@Req() request: Request, @Body() dto: CreateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.appointmentService.create(requestorID, dto);
  }

  @Patch('taken-over')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async takenOver(
    @Req() request: Request,
    @Body() dto: TakenOverAppointmentDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    // console.log('@Controller: \n', requestorRoleIDs);
    return await this.appointmentService.takenOver(requestorID, dto);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async update(@Req() request: Request, @Body() dto: UpdateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.update(requestorRoleIDs, requestorID, dto);
  }

  @Patch('by-related-user')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async relatedUserUpdate(
    @Req() request: Request,
    @Body() dto: UpdateAppointmentForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // console.logg'@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }

  @Patch('deposit-agreement/by-related-user')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async relatedUserDepositAgreementUpdate(
    @Req() request: Request,
    @Body() dto: UpdateDepositAgreementForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // console.logog@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateDepositAgreementByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }
  @Patch('tenant/by-related-user')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async relatedUserTenantUpdate(
    @Req() request: Request,
    @Body() dto: UpdateTenantForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateTenantByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }

  @Delete(':appointmentID')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async softDelete(
    @Req() request: Request,
    @Param('appointmentID', ParseIntPipe) appointmentID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.appointmentService.softRemove(
      requestorRoleIDs,
      requestorID,
      appointmentID,
    );
  }

  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete/:appointmentID')
  async hardDelete(
    @Body(AppointmentIDsCheckPipe) dto: HardDeleteAndRecoverAppointmentDTO,
  ) {
    await this.appointmentService.hardRemove(dto.appointmentIDs);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(
    @Body(AppointmentIDsCheckPipe) dto: HardDeleteAndRecoverAppointmentDTO,
  ) {
    await this.appointmentService.recover(dto.appointmentIDs);
  }

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: appointments/autocomplete
   * Trả về danh sách autocomplete cho appointments
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteAppointmentDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.appointmentService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: appointments/max
   * Trả về thông tin max cho appointments
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseAppointmentDTO })
  @Header('Cache-Control', 'max-age=5')
  async getMaxAppointment() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.appointmentService.getMaxAppointment();
  }
}
