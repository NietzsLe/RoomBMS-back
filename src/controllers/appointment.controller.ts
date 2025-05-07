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
  BaseAppointmentDTO,
  CreateAppointmentDTO,
  CreateResponseAppointmentDTO,
  HardDeleteAndRecoverAppointmentDTO,
  TakenOverAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentForRelatedUserDTO,
  UpdateDepositAgreementForRelatedUserDTO,
  UpdateTenantForRelatedUserDTO,
} from 'src/dtos/appointmentDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { AppointmentService } from 'src/services/appointment.service';
import { createFindOptionSelectWithBlacklist } from 'src/services/helper';
import { AppointmentIDsCheckPipe } from './pipes/notDuplicateValue.pipe';
import { ParseDatePipe } from './pipes/date.pipe';

@Controller('appointments')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}
  @Get()
  @ApiOkResponse({ type: [BaseAppointmentDTO] })
  @ApiQuery({ name: 'appointmentID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'roomID', required: false })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  @ApiQuery({ name: 'takenOverUsername', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('appointmentID', new ParseIntPipe({ optional: true }))
    appointmentID: number,
    @Query('name') name: string,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
    @Query('roomID', new ParseIntPipe({ optional: true })) roomID: number,
    @Query('fromDate', ParseDatePipe) fromDate: Date,
    @Query('toDate', ParseDatePipe) toDate: Date,
    @Query('takenOverUsername') takenOverUsername: string,
    @Query('endID', new ParseIntPipe({ optional: true })) endID: number,
  ) {
    const blackList = request['resourceBlackListAttrs'] as string[];
    return await this.appointmentService.findAll(
      appointmentID,
      offsetID,
      name,
      houseID,
      roomID,
      fromDate,
      toDate,
      takenOverUsername,
      endID,
      createFindOptionSelectWithBlacklist(BaseAppointmentDTO, blackList),
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [BaseAppointmentDTO] })
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
  async create(@Req() request: Request, @Body() dto: CreateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.appointmentService.create(requestorID, dto);
  }

  @Patch('taken-over')
  async takenOver(
    @Req() request: Request,
    @Body() dto: TakenOverAppointmentDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.takenOver(requestorID, dto.appointmentID);
  }

  @Patch()
  async update(@Req() request: Request, @Body() dto: UpdateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.update(requestorRoleIDs, requestorID, dto);
  }

  @Patch('by-related-user')
  async relatedUserUpdate(
    @Req() request: Request,
    @Body() dto: UpdateAppointmentForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }

  @Patch('deposit-agreement/by-related-user')
  async relatedUserDepositAgreementUpdate(
    @Req() request: Request,
    @Body() dto: UpdateDepositAgreementForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateDepositAgreementByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }
  @Patch('tenant/by-related-user')
  async relatedUserTenantUpdate(
    @Req() request: Request,
    @Body() dto: UpdateTenantForRelatedUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.updateTenantByRelatedUser(
      requestorRoleIDs,
      requestorID,
      dto,
    );
  }

  @Delete(':appointmentID')
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
  async recover(
    @Body(AppointmentIDsCheckPipe) dto: HardDeleteAndRecoverAppointmentDTO,
  ) {
    await this.appointmentService.recover(dto.appointmentIDs);
  }
}
