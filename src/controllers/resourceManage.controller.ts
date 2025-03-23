import {
  Body,
  Controller,
  Delete,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth } from '@nestjs/swagger';
import { ResourceManageDTO } from 'src/dtos/resourceManageDTO';
import { AuthGuard } from 'src/guards/auth.guard';
import { JustSuperAdminRoleGuard } from 'src/guards/justAdminRoles.guard';
import { ResourceManageServive } from 'src/services/resourceManage.service';

@Controller('resource-manage')
@UseGuards(AuthGuard)
@ApiCookieAuth('JWTAuth')
export class ResourceManageController {
  constructor(private resourceManageServive: ResourceManageServive) {}
  @Delete('clean')
  @UseGuards(JustSuperAdminRoleGuard)
  async clean(@Body() dto: ResourceManageDTO) {
    if (!dto.startTime && !dto.endTime)
      throw new HttpException(
        'Must have startTime or endTime',
        HttpStatus.BAD_REQUEST,
      );
    return await this.resourceManageServive.clean(
      dto.startTime as Date,
      dto.endTime as Date,
    );
  }
  @Post('recover')
  @UseGuards(JustSuperAdminRoleGuard)
  async recover(@Body() dto: ResourceManageDTO) {
    if (!dto.startTime && !dto.endTime)
      throw new HttpException(
        'Must have startTime or endTime',
        HttpStatus.BAD_REQUEST,
      );
    return await this.resourceManageServive.recover(
      dto.startTime as Date,
      dto.endTime as Date,
    );
  }
}
