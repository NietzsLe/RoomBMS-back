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
  BaseHouseDTO,
  CreateHouseDTO,
  CreateResponseHouseDTO,
  HardDeleteAndRecoverHouseDTO,
  UpdateHouseDTO,
} from 'src/dtos/houseDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { createFindOptionSelectWithBlacklist } from 'src/services/helper';
import { HouseService } from 'src/services/house.service';
import { HouseIDsCheckPipe } from './pipes/notDuplicateValue.pipe';

@Controller('houses')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class HouseController {
  constructor(private houseService: HouseService) {}
  @Get()
  @ApiOkResponse({ type: [BaseHouseDTO] })
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
    @Query('name') name: string,
  ) {
    const blackList = request['resourceBlackListAttrs'] as string[];
    return await this.houseService.findAll(
      houseID,
      name,
      offsetID,
      createFindOptionSelectWithBlacklist(BaseHouseDTO, blackList),
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [BaseHouseDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
  ) {
    return await this.houseService.findInactiveAll(houseID, offsetID);
  }
  @Post()
  @ApiOkResponse({ type: CreateResponseHouseDTO })
  async create(@Req() request: Request, @Body() dto: CreateHouseDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.houseService.create(requestorID, dto);
  }
  @Patch()
  async update(@Req() request: Request, @Body() dto: UpdateHouseDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.houseService.update(requestorRoleIDs, requestorID, dto);
  }
  @Delete(':houseID')
  async softDelete(
    @Req() request: Request,
    @Param('houseID', ParseIntPipe) houseID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.houseService.softRemove(requestorRoleIDs, requestorID, houseID);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete')
  async hardDelete(@Body(HouseIDsCheckPipe) dto: HardDeleteAndRecoverHouseDTO) {
    await this.houseService.hardRemove(dto.houseIDs);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(@Body(HouseIDsCheckPipe) dto: HardDeleteAndRecoverHouseDTO) {
    await this.houseService.recover(dto.houseIDs);
  }
}
