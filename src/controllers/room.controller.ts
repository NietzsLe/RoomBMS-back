import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import {
  DeleteImagesDTO,
  UploadResponseImageDTO,
} from 'src/dtos/room-images.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoomImageService } from 'src/services/room-image.service';
import { Request } from 'express';
import { RoomService } from 'src/services/room.service';
import {
  ReadRoomDTO,
  CreateResponseRoomDTO,
  CreateRoomDTO,
  HardDeleteAndRecoverRoomDTO,
  UpdateRoomDTO,
  AutocompleteRoomDTO,
  MaxResponseRoomDTO,
} from 'src/dtos/room.dto';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';
import {
  ImageNamesCheckPipe,
  RoomIDsCheckPipe,
} from './pipes/not-duplicate-value.pipe';
import { FileTypeValidationPipe } from './pipes/room-image.pipe';
import { CacheTTL } from '@nestjs/cache-manager';

@Controller('rooms')
export class RoomController {
  constructor(
    private roomImageService: RoomImageService,
    private roomService: RoomService,
  ) {}
  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadRoomDTO] })
  @ApiQuery({ name: 'roomID', required: false })
  @ApiQuery({ name: 'provinceCode', required: false })
  @ApiQuery({ name: 'districtCode', required: false })
  @ApiQuery({ name: 'wardCode', required: false })
  @ApiQuery({ name: 'houseID', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'isHot', required: false, type: Boolean })
  @ApiQuery({ name: 'isEmpty', required: false, type: Boolean })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'ID_desc_cursor', required: false })
  @ApiQuery({ name: 'updateAt_desc_cursor', required: false })
  @ApiQuery({ name: 'price_asc_cursor', required: false })
  @ApiQuery({ name: 'order_type', required: false })
  @ApiQuery({ name: 'streetID', required: false })
  // additionInfo fields
  @ApiQuery({ name: 'addition_moveInTime', required: false, type: Number })
  @ApiQuery({ name: 'addition_roomType', required: false })
  @ApiQuery({ name: 'addition_toilet', required: false })
  @ApiQuery({ name: 'addition_position', required: false })
  @ApiQuery({ name: 'addition_gateLock', required: false })
  @ApiQuery({ name: 'addition_dryingYard', required: false })
  @ApiQuery({ name: 'addition_activityHours', required: false })
  @ApiQuery({
    name: 'addition_numberOfVehicles',
    required: false,
    type: Number,
  })
  @ApiQuery({ name: 'addition_parkingSpace', required: false })
  @ApiQuery({ name: 'addition_area', required: false })
  @ApiQuery({ name: 'addition_numberOfPeoples', required: false, type: Number })
  @ApiQuery({ name: 'addition_deposit', required: false, type: Number })
  @ApiQuery({
    name: 'addition_depositReplenishmentTime',
    required: false,
    type: Number,
  })
  @ApiQuery({ name: 'addition_kitchenShelf', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_bed', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_sharedOwner', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_airConditioner', required: false, type: Boolean })
  @ApiQuery({
    name: 'addition_sharedWashingMachine',
    required: false,
    type: Boolean,
  })
  @ApiQuery({ name: 'addition_window', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_tv', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_dishWasher', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_mattress', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_elevator', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_skylight', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_balcony', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_washingMachine', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_waterHeater', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_wardrobe', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_security', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_pet', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_electricBike', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_attic', required: false, type: Boolean })
  @ApiQuery({ name: 'addition_fridge', required: false, type: Boolean })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('roomID', new ParseIntPipe({ optional: true })) roomID?: number,
    @Query('provinceCode', new ParseIntPipe({ optional: true }))
    provinceCode?: number,
    @Query('districtCode', new ParseIntPipe({ optional: true }))
    districtCode?: number,
    @Query('wardCode', new ParseIntPipe({ optional: true })) wardCode?: number,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID?: number,
    @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice?: number,
    @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice?: number,
    @Query('isHot', new ParseBoolPipe({ optional: true })) isHot?: boolean,
    @Query('isEmpty', new ParseBoolPipe({ optional: true })) isEmpty?: boolean,
    @Query('name') name?: string,
    @Query('ID_desc_cursor', new ParseIntPipe({ optional: true }))
    ID_desc_cursor?: number,
    @Query('updateAt_desc_cursor') updateAt_desc_cursor?: string,
    @Query('price_asc_cursor', new ParseIntPipe({ optional: true }))
    price_asc_cursor?: number,
    @Query('order_type') order_type?: string,
    @Query('streetID', new ParseIntPipe({ optional: true })) streetID?: number,
    // additionInfo fields
    @Query('addition_moveInTime', new ParseIntPipe({ optional: true }))
    addition_moveInTime?: number,
    @Query('addition_roomType') addition_roomType?: string,
    @Query('addition_toilet') addition_toilet?: string,
    @Query('addition_position') addition_position?: string,
    @Query('addition_gateLock') addition_gateLock?: string,
    @Query('addition_dryingYard') addition_dryingYard?: string,
    @Query('addition_activityHours') addition_activityHours?: string,
    @Query('addition_numberOfVehicles', new ParseIntPipe({ optional: true }))
    addition_numberOfVehicles?: number,
    @Query('addition_parkingSpace') addition_parkingSpace?: string,
    @Query('addition_area') addition_area?: string,
    @Query('addition_numberOfPeoples', new ParseIntPipe({ optional: true }))
    addition_numberOfPeoples?: number,
    @Query('addition_deposit', new ParseIntPipe({ optional: true }))
    addition_deposit?: number,
    @Query(
      'addition_depositReplenishmentTime',
      new ParseIntPipe({ optional: true }),
    )
    addition_depositReplenishmentTime?: number,
    @Query('addition_kitchenShelf', new ParseBoolPipe({ optional: true }))
    addition_kitchenShelf?: boolean,
    @Query('addition_bed', new ParseBoolPipe({ optional: true }))
    addition_bed?: boolean,
    @Query('addition_sharedOwner', new ParseBoolPipe({ optional: true }))
    addition_sharedOwner?: boolean,
    @Query('addition_airConditioner', new ParseBoolPipe({ optional: true }))
    addition_airConditioner?: boolean,
    @Query(
      'addition_sharedWashingMachine',
      new ParseBoolPipe({ optional: true }),
    )
    addition_sharedWashingMachine?: boolean,
    @Query('addition_window', new ParseBoolPipe({ optional: true }))
    addition_window?: boolean,
    @Query('addition_tv', new ParseBoolPipe({ optional: true }))
    addition_tv?: boolean,
    @Query('addition_dishWasher', new ParseBoolPipe({ optional: true }))
    addition_dishWasher?: boolean,
    @Query('addition_mattress', new ParseBoolPipe({ optional: true }))
    addition_mattress?: boolean,
    @Query('addition_elevator', new ParseBoolPipe({ optional: true }))
    addition_elevator?: boolean,
    @Query('addition_skylight', new ParseBoolPipe({ optional: true }))
    addition_skylight?: boolean,
    @Query('addition_balcony', new ParseBoolPipe({ optional: true }))
    addition_balcony?: boolean,
    @Query('addition_washingMachine', new ParseBoolPipe({ optional: true }))
    addition_washingMachine?: boolean,
    @Query('addition_waterHeater', new ParseBoolPipe({ optional: true }))
    addition_waterHeater?: boolean,
    @Query('addition_wardrobe', new ParseBoolPipe({ optional: true }))
    addition_wardrobe?: boolean,
    @Query('addition_security', new ParseBoolPipe({ optional: true }))
    addition_security?: boolean,
    @Query('addition_pet', new ParseBoolPipe({ optional: true }))
    addition_pet?: boolean,
    @Query('addition_electricBike', new ParseBoolPipe({ optional: true }))
    addition_electricBike?: boolean,
    @Query('addition_attic', new ParseBoolPipe({ optional: true }))
    addition_attic?: boolean,
    @Query('addition_fridge', new ParseBoolPipe({ optional: true }))
    addition_fridge?: boolean,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.roomService.findAll(
      roomID,
      provinceCode,
      districtCode,
      wardCode,
      houseID,
      minPrice,
      maxPrice,
      isHot,
      isEmpty,
      name,
      ID_desc_cursor,
      updateAt_desc_cursor ? new Date(updateAt_desc_cursor) : undefined,
      price_asc_cursor,
      order_type,
      requestorRoleIDs,
      {
        addition_moveInTime,
        addition_roomType,
        addition_toilet,
        addition_position,
        addition_gateLock,
        addition_dryingYard,
        addition_activityHours,
        addition_numberOfVehicles,
        addition_parkingSpace,
        addition_area,
        addition_numberOfPeoples,
        addition_deposit,
        addition_depositReplenishmentTime,
        addition_kitchenShelf,
        addition_bed,
        addition_sharedOwner,
        addition_airConditioner,
        addition_sharedWashingMachine,
        addition_window,
        addition_tv,
        addition_dishWasher,
        addition_mattress,
        addition_elevator,
        addition_skylight,
        addition_balcony,
        addition_washingMachine,
        addition_waterHeater,
        addition_wardrobe,
        addition_security,
        addition_pet,
        addition_electricBike,
        addition_attic,
        addition_fridge,
      },
      streetID,
    );
  }
  @Get('inactive')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadRoomDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'roomID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID', new ParseIntPipe({ optional: true }))
    offsetID: number = 0,
    @Query('roomID', new ParseIntPipe({ optional: true })) roomID: number,
  ) {
    return await this.roomService.findInactiveAll(roomID, offsetID);
  }
  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: CreateResponseRoomDTO })
  async create(@Req() request: Request, @Body() dto: CreateRoomDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.roomService.create(requestorID, dto);
  }
  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async update(@Req() request: Request, @Body() dto: UpdateRoomDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.roomService.update(requestorRoleIDs, requestorID, dto);
  }

  @Post(':roomID/images')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @UseInterceptors(FilesInterceptor('files'))
  @Post('upload')
  @ApiOkResponse({ type: [UploadResponseImageDTO] })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  async upload(
    @UploadedFiles(new FileTypeValidationPipe())
    files: Array<Express.Multer.File>,
    @Param('roomID', ParseIntPipe) roomID: number,
  ) {
    //console.log('@Controller: \n', files);
    return await this.roomImageService.upload(
      roomID,
      files.map((file) => extname(file.originalname).slice(1)),
      files,
    );
  }

  @Delete(':roomID')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async softDelete(
    @Req() request: Request,
    @Param('roomID', ParseIntPipe) roomID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.roomService.softRemove(requestorRoleIDs, requestorID, roomID);
  }
  @Delete('hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async hardDelete(@Body(RoomIDsCheckPipe) dto: HardDeleteAndRecoverRoomDTO) {
    await this.roomService.hardRemove(dto.roomIDs);
  }
  @Post('recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(@Body(RoomIDsCheckPipe) dto: HardDeleteAndRecoverRoomDTO) {
    await this.roomService.recover(dto.roomIDs);
  }

  @Delete(':roomID/images')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async imageSoftDelete(
    @Req() request: Request,
    @Param('roomID', ParseIntPipe) roomID: number,
    @Body(ImageNamesCheckPipe) dto: DeleteImagesDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.roomImageService.softDelete(
      requestorRoleIDs,
      requestorID,
      roomID,
      dto.imageNames,
    );
  }
  @Delete(':roomID/images/hard-delete')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async imageHardDelete(
    @Param('roomID', ParseIntPipe) roomID: number,
    @Body(ImageNamesCheckPipe) dto: DeleteImagesDTO,
  ) {
    await this.roomImageService.hardDelete(roomID, dto.imageNames);
  }

  @Post(':roomID/images/recover')
  @UseGuards(AuthGuard)
  @UseGuards(JustSuperAdminRoleGuard)
  @ApiCookieAuth('JWTAuth')
  async imageRecover(
    @Param('roomID', ParseIntPipe) roomID: number,
    @Body(ImageNamesCheckPipe) dto: DeleteImagesDTO,
  ) {
    await this.roomImageService.recover(roomID, dto.imageNames);
  }

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: rooms/autocomplete
   * Trả về danh sách autocomplete cho rooms
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteRoomDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'houseID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.roomService.getAutocomplete(offsetID, houseID);
  }
  /**
   * Endpoint: rooms/max
   * Trả về thông tin max cho rooms
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseRoomDTO })
  @ApiQuery({ name: 'houseID', required: false })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxRoom(
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.roomService.getMaxRoom(houseID);
  }
}
