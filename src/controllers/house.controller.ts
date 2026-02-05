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
  AutocompleteHouseDTO,
  MaxResponseHouseDTO,
} from 'src/dtos/house.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';
import { HouseService } from 'src/services/house.service';
import { HouseIDsCheckPipe } from './pipes/not-duplicate-value.pipe';
import { ParseDatePipe } from './pipes/date.pipe';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('houses')
export class HouseController {
  constructor(private houseService: HouseService) {}
  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
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
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
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
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: CreateResponseHouseDTO })
  async create(@Req() request: Request, @Body() dto: CreateHouseDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.houseService.create(requestorID, dto);
  }
  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async update(@Req() request: Request, @Body() dto: UpdateHouseDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // console.log('@Controller: \n', requestorRoleIDs);
    await this.houseService.update(requestorRoleIDs, requestorID, dto);
  }
  @Delete(':houseID')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async softDelete(
    @Req() request: Request,
    @Param('houseID', ParseIntPipe) houseID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.houseService.softRemove(requestorRoleIDs, requestorID, houseID);
  }
  @Delete('hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async hardDelete(@Body(HouseIDsCheckPipe) dto: HardDeleteAndRecoverHouseDTO) {
    await this.houseService.hardRemove(dto.houseIDs);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(@Body(HouseIDsCheckPipe) dto: HardDeleteAndRecoverHouseDTO) {
    await this.houseService.recover(dto.houseIDs);
  }

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: houses/autocomplete
   * Trả về danh sách autocomplete cho houses
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteHouseDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.houseService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: houses/max
   * Trả về thông tin max cho houses
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseHouseDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxHouse() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.houseService.getMaxHouse();
  }
}
