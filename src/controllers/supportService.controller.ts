import {
  Controller,
  Get,
  Header,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { HouseService } from 'src/services/house.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { AutocompleteHouseDTO, MaxResponseHouseDTO } from 'src/dtos/houseDTO';
import { AutocompleteRoomDTO, MaxResponseRoomDTO } from 'src/dtos/roomDTO';
import {
  AutocompleteTenantDTO,
  MaxResponseTenantDTO,
} from 'src/dtos/tenantDTO';
import {
  AutocompleteAppointmentDTO,
  MaxResponseAppointmentDTO,
} from 'src/dtos/appointmentDTO';
import {
  AutocompleteDepositAgreementDTO,
  MaxResponseDepositAgreementDTO,
} from 'src/dtos/depositAgreementDTO';
import {
  AutocompleteTeamDTO,
  AutocompleteUserDTO,
  MaxResponseTeamDTO,
  MaxResponseUserDTO,
} from 'src/dtos/userDTO';
import { AutocompleteRoleDTO, MaxResponseRoleDTO } from 'src/dtos/roleDTO';
import {
  AutocompleteStreetDTO,
  MaxResponseStreetDTO,
} from 'src/dtos/streetDTO';
import { RoomService } from 'src/services/room.service';
import { RoleService } from 'src/services/role.service';
import { UserService } from 'src/services/user.service';
import { AppointmentService } from 'src/services/appointment.service';
import { DepositAgreementService } from 'src/services/depositAgreement.service';
import { TenantService } from 'src/services/tenant.service';
import { AdministrativeUnitService } from 'src/services/administrativeUnit.service';
import {
  ReadDistrictUnitDTO,
  ReadProvinceUnitDTO,
  ReadWardUnitDTO,
} from 'src/dtos/administrativeUnitDTO';
import { NotEmptyCheckPipe } from './pipes/notEmptyCheck.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { StreetService } from 'src/services/street.service';

@Controller('support-service')
export class SupportServiceController {
  constructor(
    private houseService: HouseService,
    private roomService: RoomService,
    private roleService: RoleService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private depositAgreementService: DepositAgreementService,
    private tenantService: TenantService,
    private administrativeUnitService: AdministrativeUnitService,
    private streetService: StreetService,
  ) {}
  @Get('autocomplete/houses')
  @ApiOkResponse({ type: [AutocompleteHouseDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getHouses(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    console.log('@Controller: autocomplete');
    return await this.houseService.getAutocomplete(offsetID);
  }
  @Get('autocomplete/rooms')
  @ApiOkResponse({ type: [AutocompleteRoomDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'houseID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getRooms(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
    @Query('houseID', new ParseIntPipe({ optional: true })) houseID: number,
  ) {
    console.log('@Controller: autocomplete');
    return await this.roomService.getAutocomplete(offsetID, houseID);
  }
  @Get('autocomplete/tenants')
  @ApiOkResponse({ type: [AutocompleteTenantDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getTenants(
    @Query('offsetID', ParseIntPipe)
    offsetID: number = 0,
  ) {
    console.log('@Controller: autocomplete');
    return await this.tenantService.getAutocomplete(offsetID);
  }
  @Get('autocomplete/appointments')
  @ApiOkResponse({ type: [AutocompleteAppointmentDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getAppointments(@Query('offsetID', ParseIntPipe) offsetID: number = 0) {
    console.log('@Controller: autocomplete');
    return await this.appointmentService.getAutocomplete(offsetID);
  }
  @Get('autocomplete/deposit-agreements')
  @ApiOkResponse({ type: [AutocompleteDepositAgreementDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getDepositAgreements(
    @Query('offsetID', ParseIntPipe) offsetID: number = 0,
  ) {
    console.log('@Controller: autocomplete');
    return await this.depositAgreementService.getAutocomplete(offsetID);
  }
  @Get('autocomplete/users')
  @ApiOkResponse({ type: [AutocompleteUserDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'type', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  @UseGuards(AuthGuard)
  @ApiCookieAuth('JWTAuth')
  async getUsers(
    @Req() request: Request,
    @Query('offsetID', NotEmptyCheckPipe) offsetID: string = '',
    @Query('type') type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    const requestorID = request['resourceRequestUserID'] as string;
    console.log('@Controller: autocomplete');
    return await this.userService.getUserAutocomplete(
      offsetID,
      requestorID,
      requestorRoleIDs,
      type,
    );
  }
  @Get('autocomplete/teams')
  @ApiOkResponse({ type: [AutocompleteTeamDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @ApiQuery({ name: 'type', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getTeams(
    @Req() request: Request,
    @Query('offsetID', NotEmptyCheckPipe) offsetID: string = '',
    @Query('type') type: string,
  ) {
    const requestorRoleIDs = request['resourceRequestRoleIDs'] as string[];
    const requestorID = request['resourceRequestUserID'] as string;
    console.log('@Controller: autocomplete');
    return await this.userService.getTeamAutocomplete(
      offsetID,
      requestorID,
      requestorRoleIDs,
      type,
    );
  }
  @Get('autocomplete/roles')
  @ApiOkResponse({ type: [AutocompleteRoleDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @Header('Cache-Control', 'max-age=10')
  @CacheTTL(10000)
  async getRoles(@Query('offsetID', NotEmptyCheckPipe) offsetID: string = '') {
    console.log('@Controller: autocomplete');
    return await this.roleService.getAutocomplete(offsetID);
  }

  // --- STREET AUTOCOMPLETE ---
  @Get('autocomplete/streets')
  @ApiOkResponse({ type: [AutocompleteStreetDTO] })
  @ApiQuery({ name: 'offsetID', required: false })
  @CacheTTL(10000)
  @Header('Cache-Control', 'max-age=10')
  async getStreets(@Query('offsetID', ParseIntPipe) offsetID: number) {
    // Follows the same pattern as getRooms
    return await this.streetService.getAutocomplete(offsetID);
  }
  @Get('autocomplete/districts')
  @ApiOkResponse({ type: [ReadDistrictUnitDTO] })
  @ApiQuery({ name: 'provinceUnitID', required: false })
  @CacheTTL(5 * 60 * 1000)
  @Header('Cache-Control', 'max-age=360')
  async getDistricts(
    @Query('provinceUnitID', ParseIntPipe) provinceUnitID: number,
  ) {
    console.log('@Controller: autocomplete');
    return await this.administrativeUnitService.getDistrictAutocomplete(
      provinceUnitID,
    );
  }
  @Get('autocomplete/wards')
  @ApiOkResponse({ type: [ReadWardUnitDTO] })
  @ApiQuery({ name: 'districtUnitID', required: false })
  @CacheTTL(5 * 60 * 1000)
  @Header('Cache-Control', 'max-age=360')
  async getWards(
    @Query('districtUnitID', ParseIntPipe) districtUnitID: number,
  ) {
    console.log('@Controller: autocomplete');
    return await this.administrativeUnitService.getWardAutocomplete(
      districtUnitID,
    );
  }
  @Get('autocomplete/provinces')
  @ApiOkResponse({ type: [ReadProvinceUnitDTO] })
  @CacheTTL(5 * 60 * 1000)
  @Header('Cache-Control', 'max-age=360')
  async getProvinces() {
    console.log('@Controller: autocomplete');
    return await this.administrativeUnitService.getProvinceAutocomplete();
  }
  @Get('max/rooms')
  @ApiOkResponse({ type: MaxResponseRoomDTO })
  @ApiQuery({ name: 'houseID', required: false })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxRoom(
    @Query('houseID', new ParseIntPipe({ optional: true }))
    houseID: number,
  ) {
    console.log('@Controller: autocomplete');
    return await this.roomService.getMaxRoom(houseID);
  }

  // --- STREET MAX ---
  @Get('max/streets')
  @ApiOkResponse({ type: MaxResponseStreetDTO })
  @ApiQuery({ name: 'streetID', required: false })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxStreet(
    @Query('streetID', new ParseIntPipe({ optional: true })) streetID: number,
  ) {
    // Follows the same pattern as getMaxRoom
    return await this.streetService.getMaxStreetID(streetID);
  }
  @Get('max/roles')
  @ApiOkResponse({ type: MaxResponseRoleDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxRole() {
    console.log('@Controller: autocomplete');
    return await this.roleService.getMaxRole();
  }
  @Get('max/houses')
  @ApiOkResponse({ type: MaxResponseHouseDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxHouse() {
    console.log('@Controller: autocomplete');
    return await this.houseService.getMaxHouse();
  }
  @Get('max/tenants')
  @ApiOkResponse({ type: MaxResponseTenantDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxTenant() {
    console.log('@Controller: autocomplete');
    return await this.tenantService.getMaxTenant();
  }
  @Get('max/appointments')
  @ApiOkResponse({ type: MaxResponseAppointmentDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxAppointment() {
    console.log('@Controller: autocomplete');
    return await this.appointmentService.getMaxAppointment();
  }
  @Get('max/deposit-agreements')
  @ApiOkResponse({ type: MaxResponseDepositAgreementDTO })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxDepositAgreement() {
    console.log('@Controller: autocomplete');
    return await this.depositAgreementService.getMaxDepositAgreement();
  }
  @Get('max/users')
  @ApiOkResponse({ type: [MaxResponseUserDTO] })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxUser() {
    console.log('@Controller: autocomplete');
    return await this.userService.getMaxUser();
  }
  @Get('max/teams')
  @ApiOkResponse({ type: [MaxResponseTeamDTO] })
  @CacheTTL(5000)
  @Header('Cache-Control', 'max-age=5')
  async getMaxTeam() {
    console.log('@Controller: autocomplete');
    return await this.userService.getMaxTeam();
  }
}
