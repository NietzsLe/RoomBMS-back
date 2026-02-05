import { isString } from '@nestjs/class-validator';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import {
  AuthService,
  HttpMethodToPerm,
  TokenPayload,
} from 'src/services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    request['requestGuardStartTime'] = Date.now();
    const jwt: string = this.extractToken(request);
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(jwt, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch {
      throw new UnauthorizedException();
    }
    if (
      payload.roleIDs.includes(process.env.SUPER_ADMIN_ROLEID ?? 'super-admin')
    ) {
      request['resourceRequestRoleIDs'] = [process.env.SUPER_ADMIN_ROLEID];
      request['resourceRequestUserID'] = payload.username;
      request['resourceBlackListAttrs'] = [];
      return true;
    }
    // 💡 We're assigning the payload to the request object here
    // so that we can access it in our route handlers
    const controller = context.getClass();
    const handler = context.getHandler();
    let tailPath = this.reflector
      .get<string>('path', handler)
      .replace(/:[a-zA-Z0-9_-]+(\/:[a-zA-Z0-9_-]+)*$/, '')
      .replace(/\/$/, '');
    tailPath = tailPath == '' ? '' : '/' + tailPath;
    const resourceID: string =
      this.reflector.get<string>('path', controller) + tailPath;

    const perm = HttpMethodToPerm(request.method);

    // console.log('@Guard: \n', resourceID);
    const result = await this.authService.checkAuthorization(
      request,
      payload.username,
      payload.roleIDs,
      resourceID,
      perm,
      jwt,
    );
    request['resourceRequestRoleIDs'] = payload.roleIDs;
    request['resourceRequestUserID'] = payload.username;
    return result;
  }

  private extractToken(request: Request) {
    if (process.env.NODE_ENV == 'dev') {
      const jwt = isString(request.headers['authorization'])
        ? request.headers['authorization']
        : undefined;
      // console.log('@Guard: \n', request.headers);
      if (!jwt)
        throw new HttpException(
          'Missing authentication token',
          HttpStatus.UNAUTHORIZED,
        );
      return jwt.split(' ')[1];
    } else {
      const jwt = isString(request.cookies['accessToken'])
        ? request.cookies['accessToken']
        : undefined;
      if (!jwt)
        throw new HttpException(
          'Missing authentication token',
          HttpStatus.UNAUTHORIZED,
        );
      return jwt.split(' ')[1];
    }
  }
}
