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
import { FindRoomQueryDTO } from 'src/dtos/roomDTO';

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
  async findAll(@Req() request: Request, @Query() query: FindRoomQueryDTO) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    // Chuyển undefined/null về undefined để truyền đúng kiểu number | undefined
    return await this.roomService.findAll(
      query.roomID,
      query.provinceCode,
      query.districtCode,
      query.wardCode,
      query.houseID,
      query.minPrice,
      query.maxPrice,
      query.isHot,
      query.isEmpty,
      query.name,
      query.ID_desc_cursor,
      query.updateAt_desc_cursor,
      query.price_asc_cursor,
      query.order_type,
      requestorRoleIDs,
      query,
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
