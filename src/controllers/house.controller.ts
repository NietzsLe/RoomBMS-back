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
  ReadHouseDTO,
  CreateHouseDTO,
  CreateResponseHouseDTO,
  HardDeleteAndRecoverHouseDTO,
  UpdateHouseDTO,
} from 'src/dtos/houseDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { HouseService } from 'src/services/house.service';
import { HouseIDsCheckPipe } from './pipes/notDuplicateValue.pipe';
import { ParseDatePipe } from './pipes/date.pipe';

@Controller('houses')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class HouseController {
  constructor(private houseService: HouseService) {}
  @Get()
  @ApiOkResponse({ type: [ReadHouseDTO] })
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'provinceCode', required: false })
  @ApiQuery({ name: 'districtCode', required: false })
  @ApiQuery({ name: 'wardCode', required: false })
  @ApiQuery({ name: 'ID_desc_cursor', required: false })
  @ApiQuery({ name: 'updateAt_desc_cursor', required: false })
  @ApiQuery({ name: 'order_type', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
    @Query('name') name: string,
    @Query('provinceCode', new ParseIntPipe({ optional: true }))
    provinceCode: number,
    @Query('districtCode', new ParseIntPipe({ optional: true }))
    districtCode: number,
    @Query('wardCode', new ParseIntPipe({ optional: true })) wardCode: number,
    @Query('ID_desc_cursor', new ParseIntPipe({ optional: true }))
    ID_desc_cursor: number,
    @Query('updateAt_desc_cursor', ParseDatePipe) updateAt_desc_cursor: Date,
    @Query('order_type') order_type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.houseService.findAll(
      houseID,
      name,
      provinceCode,
      districtCode,
      wardCode,
      ID_desc_cursor,
      updateAt_desc_cursor,
      order_type,
      requestorRoleIDs,
    );
  }
  @Get('inactive')
  @ApiOkResponse({ type: [ReadHouseDTO] })
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
