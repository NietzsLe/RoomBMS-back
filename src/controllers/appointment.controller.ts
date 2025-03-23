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
  BaseAppointmentDTO,
  CreateAppointmentDTO,
  HardDeleteAndRecoverAppointmentDTO,
  UpdateAppointmentDTO,
} from 'src/dtos/appointmentDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { AppointmentService } from 'src/services/appointment.service';
import { createFindOptionSelectWithBlacklist } from 'src/services/helper';
import { AppointmentIDsCheckPipe } from './pipes/notDuplicateValue.pipe';

@Controller('appointments')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}
  @Get()
  @ApiOkResponse({ type: [BaseAppointmentDTO] })
  @ApiQuery({ name: 'appointmentID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findAll(
    @Req() request: Request,
    @Query('offsetID') offsetID: number = 0,
    @Query('appointmentID') appointmentID: number,
  ) {
    const blackList = request['resourceBlackListAttrs'] as string[];
    return await this.appointmentService.findAll(
      appointmentID,
      offsetID,
      createFindOptionSelectWithBlacklist(BaseAppointmentDTO, blackList),
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [BaseAppointmentDTO] })
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'appointmentID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactivateAll(
    @Query('offsetID') offsetID: number = 0,
    @Query('appointmentID') appointmentID: number,
  ) {
    return await this.appointmentService.findInactiveAll(
      appointmentID,
      offsetID,
    );
  }
  @Post()
  async create(@Req() request: Request, @Body() dto: CreateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    await this.appointmentService.create(requestorID, dto);
  }
  @Patch()
  async update(@Req() request: Request, @Body() dto: UpdateAppointmentDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.appointmentService.update(requestorRoleIDs, requestorID, dto);
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
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(
    @Body(AppointmentIDsCheckPipe) dto: HardDeleteAndRecoverAppointmentDTO,
  ) {
    await this.appointmentService.recover(dto.appointmentIDs);
  }
}
