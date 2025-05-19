import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import {
  ReadRoleDTO,
  CreateResponseRoleDTO,
  CreateRoleDTO,
} from 'src/dtos/roleDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/notEmptyCheck.pipe';
import { RoleService } from 'src/services/role.service';
import { Request } from 'express';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';

@Controller('roles')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class RoleController {
  constructor(private roleService: RoleService) {}
  @Get()
  @ApiOkResponse({ type: [ReadRoleDTO] })
  @ApiQuery({ name: 'roleID', required: false })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=2')
  async findAll(
    @Req() request: Request,
    @Query('offsetID') offsetID: string = '',
    @Query('roleID') roleID: string = '',
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    return await this.roleService.findAll(roleID, offsetID, requestorRoleIDs);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Post()
  @ApiOkResponse({ type: CreateResponseRoleDTO })
  async create(@Body() dto: CreateRoleDTO) {
    return await this.roleService.create(dto);
  }
  @UseGuards(JustSuperAdminRoleGuard)
  @Delete('hard-delete/:id')
  async delete_soft(@Param('id', NotEmptyCheckPipe) id: string) {
    await this.roleService.hardRemove(id);
  }
}
