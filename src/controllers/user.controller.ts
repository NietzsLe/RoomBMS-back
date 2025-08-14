import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import {
  ReadUserDTO,
  CreateResponseUserDTO,
  CreateUserDTO,
  HardDeleteAndRecoverUserDTO,
  UpdateUserDTO,
  AutocompleteUserDTO,
  MaxResponseUserDTO,
} from 'src/dtos/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/not-empty-check.pipe';
import { UserService } from 'src/services/user.service';
import {
  RoleIDsCheckPipe,
  UsernamesCheckPipe,
} from './pipes/not-duplicate-value.pipe';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadUserDTO] })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'username_cursor', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('username_cursor') username_cursor: string = '',
    @Query('username') username: string = '',
    @Query('name') name: string = '',
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.userService.findAll(
      username,
      name,
      username_cursor,
      requestorRoleIDs,
    );
  }

  @Get('inactive')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [ReadUserDTO] })
  // @UseGuards(JustSuperAdminRoleGuard)
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  async findInactiveAll(
    @Query('offsetID') offsetID: string = '',
    @Query('username') username: string = '',
  ) {
    return await this.userService.findInactiveAll(username, offsetID);
  }

  @ApiOkResponse({ type: CreateResponseUserDTO })
  @Post()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async create(@Req() request: Request, @Body() dto: CreateUserDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.userService.create(requestorID, dto);
  }

  @Patch()
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async update(
    @Req() request: Request,
    @Body(RoleIDsCheckPipe) dto: UpdateUserDTO,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    //console.log('@Controller: \n', requestorRoleIDs);
    await this.userService.update(requestorRoleIDs, requestorID, dto);
  }

  @Delete(':username')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async softDelete(
    @Req() request: Request,
    @Param('username', NotEmptyCheckPipe) username: string,
  ) {
    const requestorID = request['resourceRequestUserID'] as string;
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    await this.userService.softRemove(requestorRoleIDs, requestorID, username);
  }

  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete')
  async hardDelete(@Body(UsernamesCheckPipe) dto: HardDeleteAndRecoverUserDTO) {
    await this.userService.hardRemove(dto.usernames);
  }
  // @UseGuards(JustSuperAdminRoleGuard)
  @Post('recover')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async recover(@Body(UsernamesCheckPipe) dto: HardDeleteAndRecoverUserDTO) {
    await this.userService.recover(dto.usernames);
  }
  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: users/autocomplete
   * Trả về danh sách autocomplete cho users
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteUserDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'type', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Req() request: Request,
    @Query('offsetID', NotEmptyCheckPipe) offsetID: string = '',
    @Query('type') type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    const requestorID = request['resourceRequestUserID'] as string;
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.userService.getUserAutocomplete(
      offsetID,
      requestorID,
      requestorRoleIDs,
      type,
    );
  }
  /**
   * Endpoint: users/max
   * Trả về thông tin max cho users
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: [MaxResponseUserDTO] })
  @Header('Cache-Control', 'max-age=5')
  async getMaxUser() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.userService.getMaxUser();
  }
  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS (TEAMS)    =
  // ===========================================
  /**
   * Endpoint: teams/autocomplete
   * Trả về danh sách autocomplete cho teams
   * Được di chuyển từ SupportServiceController
   */
  // 📝 TODO(assistant): Đảm bảo các endpoint trả về và nhận đủ trường bankAccount, bankName qua DTO. Nếu đã dùng DTO chuẩn thì không cần sửa logic.
}
