# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RoomBMS Backend - NestJS application for room/property management system with PostgreSQL database, JWT authentication, role-based access control, and Discord bot integration.

## Development Commands

```bash
# Development
npm run start:dev          # Watch mode with hot reload
npm run start:debug        # Debug mode with watch

# Build & Production
npm run build              # Compile TypeScript
npm run start:prod         # Run production build

# Code Quality
npm run lint               # ESLint with auto-fix
npm run format             # Prettier formatting

# Testing
npm run test               # Run unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # End-to-end tests

# Database (TypeORM)
npm run typeorm:run-migrations                    # Run pending migrations
npm run typeorm:generate-migration --name=<name>  # Generate migration from entities
npm run typeorm:create-migration --name=<name>    # Create empty migration
npm run typeorm:revert-migration                  # Revert last migration
```

## Database Setup

PostgreSQL runs in Docker via `infras/docker-compose.yml`:

```bash
# Start database
docker-compose -f infras/docker-compose.yml up -d

# Stop database
docker-compose -f infras/docker-compose.yml down

# Reset database (delete all data)
docker-compose -f infras/docker-compose.yml down -v
docker-compose -f infras/docker-compose.yml up -d
```

**Connection details:**
- Host: `localhost`
- Port: `5433` (not default 5432 to avoid conflicts)
- Database: `mydb`
- User: `postgres`
- Password: `1`

## Architecture

### Mixed Architecture

This project uses **two architectural patterns**:

#### 1. Flat Layer Structure (most of app)

```
src/
├── controllers/     # HTTP endpoints, guards, validation pipes
├── services/        # Business logic
│   └── constraints/ # Validation & authorization helpers (Constraint, Process)
├── models/          # TypeORM entities
├── dtos/            # Request/response validation (class-validator)
├── mappers/         # Entity ↔ DTO conversion
├── guards/          # Auth guards (AuthGuard, JustSuperAdminRoleGuard)
├── interceptors/    # Global interceptors (cache, blacklist filter)
└── migrations/      # TypeORM migrations
```

#### 2. DDD Module Structure (modules/finance)

`src/modules/finance/` follows Domain-Driven Design:
```
modules/finance/
├── application/usecases/           # Use case classes (create-appointment.usecase.ts, etc.)
├── domain/
│   ├── entities/                   # Domain entities
│   ├── aggregates/                 # Aggregates (deposit-agreement-accounting.aggregate.ts)
│   ├── factories/                  # Factory classes
│   ├── strategies/                 # Strategy pattern implementations
│   └── finance.enum.ts            # Domain enums
├── infrastructure/
│   └── persistence/               # ORM entities (*.orm-entity.ts)
├── finance.facade.ts              # Facade (public API boundary)
└── finance.module.ts
```

### Planned Modular Architecture

The project is being refactored to bounded contexts (see `STEPS.md`):
- **FileModule**: image
- **PropertyModule**: house, room
- **LocationModule**: wardUnit, districtUnit, provinceUnit, street
- **AuthModule**: role, accessRule
- **DiscordModule**: chatGroup
- **LeasingModule**: appointment, depositAgreement, tenant
- **OrganizationModule**: user, team

Target structure:
```
src/
├── modules/              # Bounded contexts
│   ├── auth/
│   ├── property/
│   ├── location/
│   ├── leasing/
│   ├── organization/
│   └── finance/         # Existing DDD structure
├── shared/               # Shared cross-module code
│   ├── contracts/        # Facade interfaces (SPI pattern)
│   ├── dtos/            # Shared DTOs
│   ├── enums/           # Shared enums
│   ├── types/           # Shared types
│   ├── constants/        # Shared constants
│   └── utils/           # Shared utilities
└── libs/                # Shared libraries (logger, config)
```

### Key Patterns

**Constraint/Process Pattern**: Each domain has two helper classes in `services/constraints/`:
- `*Constraint`: Validation logic that throws `HttpException` on failure
- `*Process`: Data transformation/preparation logic

Example: `UserConstraint.UserIsAlive()`, `UserProcess.CreatorIsDefaultManager()`

**Authorization**: 
- Controllers use `@UseGuards(AuthGuard)` for authentication
- `JustSuperAdminRoleGuard` for super admin-only endpoints
- Service layer calls `*Constraint.JustAdminCan*()` methods for fine-grained authorization
- Role IDs stored in env vars: `SUPER_ADMIN_ROLEID`, `ADMIN_ROLEID`

**JWT Authentication**:
- Access tokens in cookies (name: `accessToken` in prod, `Authorization` in dev)
- Refresh tokens for token rotation
- Tokens hashed and stored in User entity (`hashedAccessTokens`, `hashedRefreshTokens`)

### Important Notes

- **TypeORM sync mode**: `synchronize: true` in `app.module.ts` - auto-syncs schema changes (disable in production)
- **Type assertions**: JWT `expiresIn` requires `as any` cast due to `StringValue` type from `ms` package
- **Image uploads**: Stored in `FILE_SYSTEM_PATH` (default: `image-storage/`), served at `IMAGE_LINK_PREFIX`
- **Rate limiting**: Global throttler (1000 req/60s), custom limiter for `/images/rooms` (200 req/30s)
- **Caching**: Global cache interceptor with 1s TTL
- **Discord bot**: Uses Necord module, token in `DISCORD_TOKEN` env var
- **Path aliases**: Use path aliases configured in `tsconfig.json` for cleaner imports (see STEPS.md for planned aliases)

## Coding Standards

See `.github/instructions/for-project.instructions.md` for project-specific standards:
- Clean, readable, maintainable code
- Use best practices
- **No `any` type** in TypeScript code
- Read related libraries: nestjs, typeorm, class-transformer, class-validator, swagger
- Only use popular, well-documented libraries

## Environment Variables

Required in `.env`:
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DATABASE`
- `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- `ACCESS_TOKEN_EXPIRATION_TIME`, `REFRESH_TOKEN_EXPIRATION_TIME` (e.g., '15m', '7d')
- `SUPER_ADMIN_ROLEID`, `ADMIN_ROLEID`
- `CORS_ORIGIN` (comma-separated)
- `PORT` (default: 3000)
- `NODE_ENV` ('dev' or 'prod')
- `DISCORD_TOKEN`
- `FILE_SYSTEM_PATH`, `IMAGE_LINK_PREFIX`

## Common Workflows

**Adding a new entity:**
1. Create model in `src/models/`
2. Create DTO in `src/dtos/`
3. Create mapper in `src/mappers/`
4. Create constraint/process helpers in `src/services/constraints/`
5. Create service in `src/services/`
6. Create controller in `src/controllers/`
7. Register in `app.module.ts` (TypeOrmModule.forFeature, providers, controllers)
8. Generate migration: `npm run typeorm:generate-migration --name=AddEntity`
9. Run migration: `npm run typeorm:run-migrations`

**Adding authorization to an endpoint:**
1. Add `@UseGuards(AuthGuard)` to controller method
2. Extract `requestorRoleIDs` from `request['resourceRequestRoleIDs']`
3. Call appropriate `*Constraint.JustAdminCan*()` method in service layer

## Known Issues

- **Security**: `POST /users` endpoint lacks role assignment validation - any authenticated user can create users with any role (including admin). The `update` method has `JustAdminCanAssignRoles` check but `create` does not.
