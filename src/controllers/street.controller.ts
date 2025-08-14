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
  Query,
  Header,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth.guard';
import { StreetService } from 'src/services/street.service';
import { Request } from 'express';
import {
  CreateStreetDTO,
  UpdateStreetDTO,
  ReadStreetDTO,
  AutocompleteStreetDTO,
  MaxResponseStreetDTO,
} from 'src/dtos/street.dto';

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

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: streets/autocomplete
   * Trả về danh sách autocomplete cho streets
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteStreetDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(@Query('offsetID', ParseIntPipe) offsetID: number) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.streetService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: streets/max
   * Trả về thông tin max cho streets
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseStreetDTO })
  @Header('Cache-Control', 'max-age=5')
  async getMaxStreet() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.streetService.getMaxStreetID();
  }
}
