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
} from 'src/dtos/roomImagesDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { RoomImageService } from 'src/services/roomImage.service';
import { Request } from 'express';
import { RoomService } from 'src/services/room.service';
import {
  ReadRoomDTO,
  CreateResponseRoomDTO,
  CreateRoomDTO,
  HardDeleteAndRecoverRoomDTO,
  UpdateRoomDTO,
} from 'src/dtos/roomDTO';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiOkResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import {
  ImageNamesCheckPipe,
  RoomIDsCheckPipe,
} from './pipes/notDuplicateValue.pipe';
import { FileTypeValidationPipe } from './pipes/roomImage.pipe';

@UseGuards(AuthGuard)
@Controller('rooms')
@ApiCookieAuth('JWTAuth')
export class RoomController {
  constructor(
    private roomImageService: RoomImageService,
    private roomService: RoomService,
  ) {}
  @Get()
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
    );
  }
  // @Get('for-saler')
  // @ApiOkResponse({ type: [ReadRoomDTO] })
  // @ApiQuery({ name: 'roomID', required: false })
  // @ApiQuery({ name: 'offsetID', required: false })
  // @ApiQuery({ name: 'provinceCode', required: false })
  // @ApiQuery({ name: 'districtCode', required: false })
  // @ApiQuery({ name: 'wardCode', required: false })
  // @ApiQuery({ name: 'houseID', required: false })
  // @ApiQuery({ name: 'minPrice', required: false })
  // @ApiQuery({ name: 'maxPrice', required: false })
  // @ApiQuery({ name: 'isHot', required: false })
  // @ApiQuery({ name: 'sortBy', required: false })
  // @ApiQuery({ name: 'name', required: false })
  // @Header('Cache-Control', 'max-age=2')
  // async findAllForSaler(
  //   @Req() request: Request,
  //   @Query('offsetID', new ParseIntPipe({ optional: true }))
  //   offsetID: number = 0,
  //   @Query('roomID', new ParseIntPipe({ optional: true })) roomID: number,
  //   @Query('provinceCode', new ParseIntPipe({ optional: true }))
  //   provinceCode: number,
  //   @Query('districtCode', new ParseIntPipe({ optional: true }))
  //   districtCode: number,
  //   @Query('wardCode', new ParseIntPipe({ optional: true })) wardCode: number,
  //   @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
  //   @Query('minPrice', new ParseIntPipe({ optional: true })) minPrice: number,
  //   @Query('maxPrice', new ParseIntPipe({ optional: true })) maxPrice: number,
  //   @Query('isHot', new ParseBoolPipe({ optional: true })) isHot: boolean,
  //   @Query('sortBy') sortBy: string,
  //   @Query('name') name: string,
  // ) {
  //   const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
  //   return await this.roomService.findAllForSaler(
  //     roomID,
  //     offsetID,
  //     provinceCode,
  //     districtCode,
  //     wardCode,
  //     houseID,
  //     minPrice,
  //     maxPrice,
  //     isHot,
  //     sortBy,
  //     name,
  //     requestorRoleIDs,
  //   );
  // }
  @Get('inactive')
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
  @ApiOkResponse({ type: CreateResponseRoomDTO })
  async create(@Req() request: Request, @Body() dto: CreateRoomDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.roomService.create(requestorID, dto);
  }
  @Patch()
  async update(@Req() request: Request, @Body() dto: UpdateRoomDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.roomService.update(requestorRoleIDs, requestorID, dto);
  }

  @Post(':roomID/images')
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
  async softDelete(
    @Req() request: Request,
    @Param('roomID', ParseIntPipe) roomID: number,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.roomService.softRemove(requestorRoleIDs, requestorID, roomID);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete')
  async hardDelete(@Body(RoomIDsCheckPipe) dto: HardDeleteAndRecoverRoomDTO) {
    await this.roomService.hardRemove(dto.roomIDs);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  async recover(@Body(RoomIDsCheckPipe) dto: HardDeleteAndRecoverRoomDTO) {
    await this.roomService.recover(dto.roomIDs);
  }

  @Delete(':roomID/images')
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
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete(':roomID/images/hard-delete')
  async imageHardDelete(
    @Param('roomID', ParseIntPipe) roomID: number,
    @Body(ImageNamesCheckPipe) dto: DeleteImagesDTO,
  ) {
    await this.roomImageService.hardDelete(roomID, dto.imageNames);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Post(':roomID/images/recover')
  async imageRecover(
    @Param('roomID', ParseIntPipe) roomID: number,
    @Body(ImageNamesCheckPipe) dto: DeleteImagesDTO,
  ) {
    await this.roomImageService.recover(roomID, dto.imageNames);
  }
}
