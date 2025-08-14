import { Controller, Get, Query, Req, Header, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { NotEmptyCheckPipe } from 'src/controllers/pipes/not-empty-check.pipe';
import { AutocompleteTeamDTO, MaxResponseTeamDTO } from 'src/dtos/user.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { TeamService } from 'src/services/team.service';

@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  // ===========================================
  // =      🔍 AUTOCOMPLETE & MAX ENDPOINTS    =
  // ===========================================
  /**
   * Endpoint: teams/autocomplete
   * Trả về danh sách autocomplete cho teams
   * Được di chuyển từ UserController
   */
  @Get('autocomplete')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [AutocompleteTeamDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'type', required: false })
  @Header('Cache-Control', 'max-age=10')
  async getTeamAutocomplete(
    @Req() request: Request,
    @Query('offsetID', NotEmptyCheckPipe) offsetID: string = '',
    @Query('type') type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    const requestorID = request['resourceRequestUserID'] as string;
    // 💡 NOTE(assistant): Di chuyển từ UserController
    return await this.teamService.getTeamAutocomplete(
      offsetID,
      requestorID,
      requestorRoleIDs,
      type,
    );
  }
  /**
   * Endpoint: teams/max
   * Trả về thông tin max cho teams
   * Được di chuyển từ UserController
   */
  @Get('max')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  @ApiOkResponse({ type: [MaxResponseTeamDTO] })
  @Header('Cache-Control', 'max-age=5')
  async getMaxTeam() {
    // 💡 NOTE(assistant): Di chuyển từ UserController
    return await this.teamService.getMaxTeam();
  }
}
