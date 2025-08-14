import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

@Injectable()
export class JustAdminRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    if (
      (request['resourceRequestRoleIDs'] as Array<string>).includes(
        process.env.ADMIN_ROLEID ?? 'admin',
      ) ||
      (request['resourceRequestRoleIDs'] as Array<string>).includes(
        process.env.SUPER_ADMIN_ROLEID ?? 'super-admin',
      )
    )
      return true;
    return false;
  }
}

@Injectable()
export class JustSuperAdminRoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    if (
      (request['resourceRequestRoleIDs'] as Array<string>).includes(
        process.env.SUPER_ADMIN_ROLEID ?? 'super-admin',
      )
    )
      return true;
    return false;
  }
}
