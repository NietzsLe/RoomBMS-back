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
} from 'src/dtos/userDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/notEmptyCheck.pipe';
import { UserService } from 'src/services/user.service';
import {
  RoleIDsCheckPipe,
  UsernamesCheckPipe,
} from './pipes/notDuplicateValue.pipe';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';

@Controller('users')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  @ApiOkResponse({ type: [ReadUserDTO] })
  @ApiQuery({ name: 'username', required: false })
  @ApiQuery({ name: 'name', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID') offsetID: string = '',
    @Query('username') username: string = '',
    @Query('name') name: string = '',
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.userService.findAll(
      username,
      name,
      offsetID,
      requestorRoleIDs,
    );
  }
  @Get('inactive')
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
  async create(@Req() request: Request, @Body() dto: CreateUserDTO) {
    const requestorID = request['resourceRequestUserID'] as string;
    return await this.userService.create(requestorID, dto);
  }
  @Patch()
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
  async recover(@Body(UsernamesCheckPipe) dto: HardDeleteAndRecoverUserDTO) {
    await this.userService.recover(dto.usernames);
  }
}
