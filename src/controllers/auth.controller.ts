import { isString } from '@nestjs/class-validator';
import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import { Throttle } from '@nestjs/throttler';
import { CookieOptions, Request, Response } from 'express';
import { ChangePassworDTO, SignInDTO } from 'src/dtos/auth.dto';
import { AuthService } from 'src/services/auth.service';

@Controller('auth')
export class AuthController {
  cookieSecurityOption: CookieOptions;
  constructor(private authService: AuthService) {
    this.cookieSecurityOption = {
      httpOnly: process.env.COOKIE_HTTP_ONLY == 'true',
      sameSite: ['strict', 'lax', 'none'].includes(
        process.env.COOKIE_SAME_SITE ?? '',
      )
        ? (process.env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none')
        : 'none',
      secure: process.env.COOKIE_SECURE == 'true',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE ?? '0', 10) || undefined,
    };
  }
  @Throttle({
    short: { limit: 1, ttl: 2000 },
    medium: { limit: 20, ttl: 60000 },
    long: { limit: 70, ttl: 15 * 60000 },
  })
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: SignInDTO,
  ) {
    const tokens = await this.authService.signIn(dto.username, dto.password);
    response.cookie('accessToken', tokens.accessToken, {
      ...this.cookieSecurityOption,
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      path: '/auth/refresh-token',
      ...this.cookieSecurityOption,
    });
    response.json(tokens.account);
  }

  @Post('change-password')
  async changePassword(
    @Res({ passthrough: true }) response: Response,
    @Body() dto: ChangePassworDTO,
  ) {
    const tokens = await this.authService.changePassword(
      dto.username,
      dto.oldPassword,
      dto.newPassword,
    );
    response.cookie('accessToken', tokens.accessToken, {
      ...this.cookieSecurityOption,
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      path: '/auth/refresh-token',
      ...this.cookieSecurityOption,
    });
    response.json(tokens.account);
  }
  @Post('sign-out')
  signOut(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
  }

  @Post('refresh-token')
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    // console.log('@Controller: ', 'refresh');
    const refreshToken = isString(request.cookies['refreshToken'])
      ? request.cookies['refreshToken']
      : undefined;
    if (!refreshToken)
      throw new HttpException('Missing refresh token', HttpStatus.UNAUTHORIZED);

    const tokens = await this.authService.refreshToken(refreshToken);
    response.cookie('accessToken', tokens.accessToken, {
      ...this.cookieSecurityOption,
    });
    response.cookie('refreshToken', tokens.refreshToken, {
      path: '/auth/refresh-token',
      ...this.cookieSecurityOption,
    });
  }
}
