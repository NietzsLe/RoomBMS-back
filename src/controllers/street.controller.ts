import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { StreetService } from 'src/services/street.service';
import { Request } from 'express';
import {
  CreateStreetDTO,
  UpdateStreetDTO,
  ReadStreetDTO,
} from 'src/dtos/streetDTO';

@Controller('streets')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class StreetController {
  constructor(private streetService: StreetService) {}

  @Get()
  @ApiOkResponse({ type: [ReadStreetDTO] })
  async findAll() {
    return this.streetService.findAll();
  }

  @Get('inactive')
  @ApiOkResponse({ type: [ReadStreetDTO] })
  async findInactiveAll() {
    return this.streetService.findInactiveAll();
  }

  @Post()
  @ApiOkResponse({ type: ReadStreetDTO })
  async create(
    @Req() request: Request,
    @Body() createStreetDTO: CreateStreetDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    return this.streetService.create(requestorID, createStreetDTO);
  }

  @Post('update')
  @ApiOkResponse({ type: ReadStreetDTO })
  async update(
    @Req() request: Request,
    @Body() updateStreetDTO: UpdateStreetDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return this.streetService.update(
      requestorRoleIDs,
      requestorID,
      updateStreetDTO,
    );
  }

  @Delete(':streetID')
  @ApiOkResponse()
  async softRemove(
    @Req() request: Request,
    @Param('streetID', ParseIntPipe) streetID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.streetService.softRemove(
      requestorRoleIDs,
      requestorID,
      streetID,
    );
  }

  @Delete('hard/:streetID')
  @ApiOkResponse()
  async hardRemove(
    @Req() request: Request,
    @Param('streetID', ParseIntPipe) streetID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.streetService.hardRemove(requestorRoleIDs, requestorID, [
      streetID,
    ]);
  }

  @Post('recover/:streetID')
  @ApiOkResponse()
  async recover(
    @Req() request: Request,
    @Param('streetID', ParseIntPipe) streetID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.streetService.recover(requestorRoleIDs, requestorID, [streetID]);
  }
}
