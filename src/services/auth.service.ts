import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessRule } from 'src/models/accessRule.model';

import { User } from 'src/models/user.model';
import { In, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { UserMapper } from 'src/mappers/user.mapper';

export enum PermTypeEnum {
  READ = 'readPerm',
  UPDATE = 'updatePerm',
  CREATE = 'createPerm',
  UNLINK = 'unlinkPerm',
}

export type TokenPayload = { roleIDs: string[]; username: string };

export function HttpMethodToPerm(method: string) {
  if (method == 'GET') return PermTypeEnum.READ;
  else if (method == 'PATCH') return PermTypeEnum.UPDATE;
  else if (method == 'POST') return PermTypeEnum.CREATE;
  else if (method == 'DELETE') return PermTypeEnum.UNLINK;
  else
    throw new HttpException(
      'Method Not Allowed',
      HttpStatus.METHOD_NOT_ALLOWED,
    );
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AccessRule)
    private accessRulesRepository: Repository<AccessRule>,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    const user = await this.usersRepository.findOne({
      where: {
        username: username,
      },
      relations: {
        roles: { accessRules: true },
        manager: true,
      },
    });
    if (!user) {
      throw new HttpException('username does not exist', HttpStatus.NOT_FOUND);
    } else if (!bcrypt.compareSync(password, user.hashedPassword ?? '')) {
      console.log(user.hashedPassword);
      throw new HttpException(
        'Incorrect password or username',
        HttpStatus.UNAUTHORIZED,
      );
    } else if (user.isDisabled == true)
      throw new HttpException(
        `user:${username} has been disabled`,
        HttpStatus.LOCKED,
      );

    return {
      ...(await this.refreshTokenByPayload(
        user.username,
        (user.roles ?? []).map((role) => role.roleID),
      )),
      account: UserMapper.EntityToBaseWithAccessRightDTO(user),
    };
  }
  async changePassword(
    username: string,
    oldPassword: string,
    newPassword: string,
  ) {
    let user = await this.usersRepository.findOne({
      where: {
        username: username,
      },
      relations: {
        roles: { accessRules: true },
        manager: true,
      },
    });
    if (!user) {
      throw new HttpException('username does not exist', HttpStatus.NOT_FOUND);
    } else if (!bcrypt.compareSync(oldPassword, user.hashedPassword ?? '')) {
      throw new HttpException(
        'Incorrect password or username',
        HttpStatus.UNAUTHORIZED,
      );
    } else if (user.isDisabled == true)
      throw new HttpException(
        `user:${username} has been disabled`,
        HttpStatus.LOCKED,
      );
    else if (user.expiryTime && user.expiryTime <= new Date())
      throw new HttpException(
        `user:${username} acccount was exprired`,
        HttpStatus.FORBIDDEN,
      );
    const saltOrRounds = 10;
    const hash = bcrypt.hashSync(newPassword, saltOrRounds);
    const RoleIDs = (user.roles ?? []).map((role) => role.roleID);
    user = new User();
    user.username = username;
    user.hashedPassword = hash;
    console.log('@Service Change Password', user);
    await this.usersRepository.update(username, user);
    return {
      ...(await this.refreshTokenByPayload(user.username, RoleIDs)),
      account: UserMapper.EntityToBaseWithAccessRightDTO(user),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      console.log('@Service: ', process.env.REFRESH_TOKEN_SECRET);
      const payload: TokenPayload = await this.jwtService.verifyAsync(
        refreshToken.split(' ')[1],
        {
          secret: process.env.REFRESH_TOKEN_SECRET,
        },
      );
      return this.refreshTokenByPayload(payload.username, payload.roleIDs);
    } catch {
      throw new UnauthorizedException();
    }
  }

  async checkAuthorization(
    request: Request,
    username: string,
    roleIDs: string[],
    resourceID: string,
    perm: PermTypeEnum,
    accessToken: string,
  ) {
    const perms = {};
    perms[perm] = true;
    const [user, accessRules] = await Promise.all([
      this.usersRepository.findOne({
        where: {
          username: username,
        },
        select: {
          username: true,
          isDisabled: true,
          expiryTime: true,
          hashedAccessToken: true,
        },
        relations: { roles: true },
      }),
      this.accessRulesRepository.find({
        where: { roleID: In(roleIDs), resourceID: resourceID, ...perms },
        select: {
          readAttrDTOBlackList: true,
          updateAttrDTOBlackList: true,
          createAttrDTOBlackList: true,
          roleID: true,
        },
      }),
    ]);
    if (!user)
      throw new HttpException(
        `user:${username} is inactive or has been disabled`,
        HttpStatus.NOT_FOUND,
      );
    else if (user.isDisabled == true)
      throw new HttpException(
        `user:${username} has been disabled`,
        HttpStatus.LOCKED,
      );
    else if (user.expiryTime && user.expiryTime <= new Date())
      throw new HttpException(
        `user:${username} acccount was exprired`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    else if (
      !user.hashedAccessToken ||
      (user.hashedAccessToken &&
        !bcrypt.compareSync('Bearer ' + accessToken, user.hashedAccessToken))
    ) {
      throw new UnauthorizedException();
    }

    if (accessRules.length != 0) {
      //console.log('@Service: \n', accessRules);
      let attrBlackList: Set<string>;
      if (perm == PermTypeEnum.READ)
        attrBlackList = new Set<string>(accessRules[0].readAttrDTOBlackList);
      else if (perm == PermTypeEnum.CREATE)
        attrBlackList = new Set<string>(accessRules[0].createAttrDTOBlackList);
      else if (perm == PermTypeEnum.UPDATE)
        attrBlackList = new Set<string>(accessRules[0].updateAttrDTOBlackList);
      else {
        request['resourceBlackListAttrs'] = [];
        return true;
      }
      for (let i = 1; i < accessRules.length; i = i + 1) {
        if (attrBlackList.size == 0) break;
        const tempSet = new Set<string>();
        if (perm == PermTypeEnum.READ)
          accessRules[i].readAttrDTOBlackList.forEach((item) => {
            if (attrBlackList.has(item)) tempSet.add(item);
          });
        else if (perm == PermTypeEnum.CREATE)
          accessRules[i].createAttrDTOBlackList.forEach((item) => {
            if (attrBlackList.has(item)) tempSet.add(item);
          });
        else if (perm == PermTypeEnum.UPDATE)
          accessRules[i].updateAttrDTOBlackList.forEach((item) => {
            if (attrBlackList.has(item)) tempSet.add(item);
          });
        attrBlackList = tempSet;
      }
      request['resourceBlackListAttrs'] = Array.from(attrBlackList);
      return true;
    } else return false;
  }

  private async refreshTokenByPayload(username: string, roleIDs: string[]) {
    const refreshPayload = {
      username: username,
      roleIDs: roleIDs,
    };
    const accessPayload = {
      roleIDs: roleIDs,
      username: username,
    };
    const out = {
      accessToken:
        'Bearer ' +
        (await this.jwtService.signAsync(accessPayload, {
          secret: process.env.ACCESS_TOKEN_SECRET,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME,
        })),
      refreshToken:
        'Bearer ' +
        (await this.jwtService.signAsync(refreshPayload, {
          secret: process.env.REFRESH_TOKEN_SECRET,
          expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME,
        })),
    };
    const saltOrRounds = 10;
    const hashes = await Promise.all([
      await bcrypt.hash(out.refreshToken, saltOrRounds),
      await bcrypt.hash(out.accessToken, saltOrRounds),
    ]);
    const updatedUser = new User();
    updatedUser.hashedRefreshToken = hashes[0];
    updatedUser.hashedAccessToken = hashes[1];
    await this.usersRepository.update(username, updatedUser);
    return out;
  }
}
