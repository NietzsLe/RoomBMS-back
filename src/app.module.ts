import { Module } from '@nestjs/common';
// import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/auth.service';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { AuthController } from './controllers/auth.controller';
import { RoleService } from './services/role.service';
import { User } from './models/user.model';
import { Role } from './models/role.model';
import { AccessRule } from './models/accessRule.model';
import { RoleController } from './controllers/role.controller';
import { AccessRuleController } from './controllers/accessRule.controller';
import { AccessRuleService } from './services/accessRule.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { MulterModule } from '@nestjs/platform-express';

import { RoomImageService } from './services/roomImage.service';
import { Image } from './models/image.model';
import { Room } from './models/room.model';
import { RoomController } from './controllers/room.controller';
import {
  UserConstraint,
  UserProcess,
} from './services/constraints/user.helper';
import {
  RoleConstraint,
  RoleProcess,
} from './services/constraints/role.helper';
import {
  AccessRuleConstraint,
  AccessRuleProcess,
} from './services/constraints/accessRule.helper';
import { Tenant } from './models/tenant.model';
import { House } from './models/house.model';
import { DepositAgreement } from './models/depositAgreement.model';
import { Appointment } from './models/appointment.model';
import { AdministrativeUnit } from './models/administrativeUnit.model';
import { WardUnit } from './models/wardUnit.model';
import { DistrictUnit } from './models/districtUnit.model';
import { ProvinceUnit } from './models/provinceUnit.model';
import {
  DepositAgreementConstraint,
  DepositAgreementProcess,
} from './services/constraints/depositAgreement.helper';
import {
  AppointmentConstraint,
  AppointmentProcess,
} from './services/constraints/appointment.helper';
import {
  RoomImageConstraint,
  RoomImageProcess,
} from './services/constraints/roomImage.helper';
import {
  RoomConstraint,
  RoomProcess,
} from './services/constraints/room.helper';
import {
  HouseConstraint,
  HouseProcess,
} from './services/constraints/house.helper';
import {
  TenantConstraint,
  TenantProcess,
} from './services/constraints/tenant.helper';
import {
  AdministrativeUnitConstraint,
  AdministrativeUnitProcess,
} from './services/constraints/administrativeUnit.helper';
import { RoomService } from './services/room.service';
import { AppointmentService } from './services/appointment.service';
import { DepositAgreementService } from './services/depositAgreement.service';
import { HouseService } from './services/house.service';
import { AdministrativeUnitService } from './services/administrativeUnit.service';
import { TenantService } from './services/tenant.service';
import { BlackListFilterInterceptors } from './interceptors/blackListFilter.interceptor';
import { AppointmentController } from './controllers/appointment.controller';
import { DepositAgreementController } from './controllers/depositAgreement.controller';
import { HouseController } from './controllers/house.controller';
import { TenantController } from './controllers/tenant.controller';
import { AdministrativeUnitController } from './controllers/administrativeUnit.controller';
import { ResourceManageServive } from './services/resourceManage.service';
import { ResourceManageController } from './controllers/resourceManage.controller';
import { SupportServiceController } from './controllers/supportService.controller';
import { ChatGroup } from './models/chatGroup.model';
import { TelegramBotService } from './services/telegramBot.service';
import { Team } from './models/team.model';

@Module({
  imports: [
    ConfigModule.forRoot(), // Tải biến môi trường
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      entities: [__dirname + '/models/**/*{.ts,.js}'],
      synchronize: true, // Đặt thành false trong môi trường sản xuất
    }),
    JwtModule.register({
      global: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
      AccessRule,
      Image,
      Room,
      Tenant,
      House,
      DepositAgreement,
      Appointment,
      AdministrativeUnit,
      WardUnit,
      DistrictUnit,
      ProvinceUnit,
      ChatGroup,
      Team,
    ]),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 60000,
          limit: 1000,
        },
      ],
    }),
    CacheModule.register({ ttl: 10000, isGlobal: true }),
    MulterModule.register({
      limits: {
        fileSize:
          +(process.env.UPLOAD_MAXSIZE ?? '1024') *
          +(process.env.UPLOAD_MAXSIZE ?? '1024'),
        files: +(process.env.UPLOAD_NUMBERS ?? '5'),
      },
    }),
  ],
  controllers: [
    UserController,
    AuthController,
    RoleController,
    AccessRuleController,
    RoomController,
    AppointmentController,
    DepositAgreementController,
    HouseController,
    TenantController,
    AdministrativeUnitController,
    ResourceManageController,
    SupportServiceController,
  ],
  providers: [
    UserService,
    AuthService,
    RoleService,
    RoomImageService,
    AccessRuleService,
    RoomService,
    AppointmentService,
    DepositAgreementService,
    HouseService,
    RoomService,
    AdministrativeUnitService,
    TenantService,
    UserConstraint,
    UserProcess,
    RoleConstraint,
    RoleProcess,
    AccessRuleConstraint,
    AccessRuleProcess,
    DepositAgreementConstraint,
    DepositAgreementProcess,
    AppointmentConstraint,
    AppointmentProcess,
    RoomImageConstraint,
    RoomImageProcess,
    RoomConstraint,
    RoomProcess,
    HouseConstraint,
    HouseProcess,
    TenantConstraint,
    TenantProcess,
    AdministrativeUnitConstraint,
    AdministrativeUnitProcess,
    ResourceManageServive,
    TelegramBotService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: BlackListFilterInterceptors,
    },
  ],
})
export class AppModule {}
