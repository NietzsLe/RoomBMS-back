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
  AutocompleteRoleDTO,
  MaxResponseRoleDTO,
} from 'src/dtos/role.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/not-empty-check.pipe';
import { RoleService } from 'src/services/role.service';
import { Request } from 'express';
import { JustSuperAdminRoleGuard } from 'src/guards/just-admin-roles.guard';

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

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: roles/autocomplete
   * Trả về danh sách autocomplete cho roles
   * Được di chuyển từ SupportServiceController
   */
  @Get('autocomplete')
  @ApiOkResponse({ type: [AutocompleteRoleDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getAutocomplete(
    @Query('offsetID', NotEmptyCheckPipe) offsetID: string = '',
  ) {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.roleService.getAutocomplete(offsetID);
  }
  /**
   * Endpoint: roles/max
   * Trả về thông tin max cho roles
   * Được di chuyển từ SupportServiceController
   */
  @Get('max')
  @ApiOkResponse({ type: MaxResponseRoleDTO })
  @Header('Cache-Control', 'max-age=5')
  async getMaxRole() {
    // 💡 NOTE(assistant): Di chuyển từ support-service.controller.ts
    return await this.roleService.getMaxRole();
  }
}
