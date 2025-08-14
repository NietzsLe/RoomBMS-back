import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, FindOptionsWhere } from 'typeorm';
import { Team } from 'src/models/team.model';
import { AutocompleteTeamDTO, MaxResponseTeamDTO } from 'src/dtos/user.dto';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  async getMaxTeam() {
    const query = this.teamRepository
      .createQueryBuilder('entity')
      .select('MAX(entity.teamID)', 'teamID');
    const dto = (await query.getRawOne()) as MaxResponseTeamDTO;
    return dto;
  }

  async getTeamAutocomplete(
    offsetID: string,
    requestorID: string,
    requestorRoleIDs: string[],
    type: string = 'related',
  ) {
    let isAdmin = false;
    for (const roleID of requestorRoleIDs) {
      if (
        roleID == process.env.SUPER_ADMIN_ROLEID ||
        roleID == process.env.ADMIN_ROLEID ||
        roleID == process.env.APPOINTMENT_ADMIN_ROLEID
      ) {
        isAdmin = true;
        break;
      }
    }
    let where: FindOptionsWhere<Team>[] | FindOptionsWhere<Team> = [
      { teamID: MoreThan(offsetID) },
    ];
    if (!isAdmin && type !== 'all') {
      where = [
        { leader: { username: requestorID }, teamID: MoreThan(offsetID) },
      ];
    }
    if (type === 'all') {
      where = [{ teamID: MoreThan(offsetID) }];
    }
    const teams = await this.teamRepository.find({
      where,
      order: {
        teamID: 'ASC',
      },
      select: { teamID: true },
      take: +(process.env.DEFAULT_SELECT_LIMIT ?? '10'),
    });
    return teams.map((team) => {
      const dto = new AutocompleteTeamDTO();
      dto.teamID = team.teamID;
      return dto;
    });
  }
}
