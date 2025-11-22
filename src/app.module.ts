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
import { AccessRule } from './models/access-rule.model';
import { RoleController } from './controllers/role.controller';
import { AccessRuleController } from './controllers/access-rule.controller';
import { AccessRuleService } from './services/access-rule.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { MulterModule } from '@nestjs/platform-express';

import { RoomImageService } from './services/room-image.service';
import { Image } from './models/image.model';
import { Room } from './models/room.model';
import { Street } from './models/street.model';
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
} from './services/constraints/access-rule.helper';
import { Tenant } from './models/tenant.model';
import { House } from './models/house.model';
import { DepositAgreement } from './models/deposit-agreement.model';
import { Appointment } from './models/appointment.model';
import { AdministrativeUnit } from './models/administrative-unit.model';
import { WardUnit } from './models/ward-unit.model';
import { DistrictUnit } from './models/district-unit.model';
import { ProvinceUnit } from './models/province-unit.model';
import {
  DepositAgreementConstraint,
  DepositAgreementProcess,
} from './services/constraints/deposit-agreement.helper';
import {
  AppointmentConstraint,
  AppointmentProcess,
} from './services/constraints/appointment.helper';
import {
  RoomImageConstraint,
  RoomImageProcess,
} from './services/constraints/room-image.helper';
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
} from './services/constraints/administrative-unit.helper';
import { RoomService } from './services/room.service';
import { StreetService } from './services/street.service';
import { AppointmentService } from './services/appointment.service';
import { DepositAgreementService } from './services/deposit-agreement.service';
import { HouseService } from './services/house.service';
import { AdministrativeUnitService } from './services/administrative-unit.service';
import { TenantService } from './services/tenant.service';
import { BlackListFilterInterceptors } from './interceptors/black-list-filter.interceptor';
import { AppointmentController } from './controllers/appointment.controller';
import { DepositAgreementController } from './controllers/deposit-agreement.controller';
import { HouseController } from './controllers/house.controller';
import { StreetController } from './controllers/street.controller';
import { TenantController } from './controllers/tenant.controller';
import { AdministrativeUnitController } from './controllers/administrative-unit.controller';
import { ChatGroup } from './models/chat-group.model';
// import { TelegramBotService } from './services/telegramBot.service';
import { Team } from './models/team.model';
import { TeamController } from './controllers/team.controller';
import { TeamService } from './services/team.service';
import { NecordModule } from 'necord';
import { IntentsBitField } from 'discord.js';
import { DiscordService } from './services/discord-bot.service';
import {
  StreetConstraint,
  StreetProcess,
} from './services/constraints/street.helper';

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
      entities: [
        __dirname + '/models/**/*{.ts,.js}',
        __dirname +
          '/modules/**/infrastructure/persistence/**/*{.orm-entity.ts,.orm-entity.js}',
      ],
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
      Street,
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
    CacheModule.register({ ttl: 1000, isGlobal: true }),
    MulterModule.register({
      limits: {
        fileSize:
          +(process.env.UPLOAD_MAXSIZE ?? '1024') *
          +(process.env.UPLOAD_MAXSIZE ?? '1024'),
        files: +(process.env.UPLOAD_NUMBERS ?? '5'),
      },
    }),
    NecordModule.forRoot({
      token: process.env.DISCORD_TOKEN ?? '',
      intents: [
        IntentsBitField.Flags.DirectMessages, // Nếu cần đọc nội dung tin nhắn
      ],
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
    StreetController,
    TenantController,
    AdministrativeUnitController,
    TeamController,
  ],
  providers: [
    StreetService,
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
    TeamService,
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
    StreetConstraint,
    StreetProcess,
    AdministrativeUnitConstraint,
    AdministrativeUnitProcess,
    DiscordService,
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
