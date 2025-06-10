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
import { compareHash, hashText } from './helper';

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
        user,
      )),
      account: UserMapper.EntityToReadWithAccessRightDTO(user),
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
    user.hashedAccessTokens = [];
    user.hashedRefreshTokens = [];
    console.log('@Service Change Password', user);
    await this.usersRepository.update(username, user);
    return {
      ...(await this.refreshTokenByPayload(user.username, RoleIDs, user)),
      account: UserMapper.EntityToReadWithAccessRightDTO(user),
    };
  }

  async refreshToken(refreshToken: string) {
    let payload: TokenPayload;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken.split(' ')[1], {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      console.log('@Service: ', refreshToken.split(' ')[1]);
    } catch {
      throw new UnauthorizedException();
    }

    const user = await this.usersRepository.findOne({
      where: {
        username: payload.username,
      },
      select: {
        username: true,
        isDisabled: true,
        expiryTime: true,
        hashedRefreshTokens: true,
        hashedAccessTokens: true,
      },
      relations: { roles: true },
    });
    let tokenIdx = -1;
    if (!user)
      throw new HttpException(
        `user:${payload.username} is inactive or has been disabled`,
        HttpStatus.NOT_FOUND,
      );
    else if (user.isDisabled == true)
      throw new HttpException(
        `user:${payload.username} has been disabled`,
        HttpStatus.LOCKED,
      );
    else if (user.expiryTime && user.expiryTime <= new Date())
      throw new HttpException(
        `user:${payload.username} acccount was exprired`,
        HttpStatus.NOT_ACCEPTABLE,
      );
    else if (!user.hashedRefreshTokens) throw new UnauthorizedException();
    else if (user.hashedRefreshTokens) {
      for (let idx = 0; idx < user.hashedRefreshTokens.length; idx++)
        if (
          compareHash('Bearer ' + refreshToken, user.hashedRefreshTokens[idx])
        ) {
          tokenIdx = idx;
          break;
        }
      if (tokenIdx == -1) throw new UnauthorizedException();
    }
    return await this.refreshTokenByPayload(
      payload.username,
      payload.roleIDs,
      user,
      tokenIdx,
    );
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
          hashedAccessTokens: true,
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
    else if (!user.hashedAccessTokens) throw new UnauthorizedException();
    else if (user.hashedAccessTokens) {
      let has = false;
      for (const token of user.hashedAccessTokens)
        if (compareHash('Bearer ' + accessToken, token)) has = true;
      if (!has) throw new UnauthorizedException();
    }

    for (const roleID of roleIDs) {
      if (
        roleID == process.env.SUPER_ADMIN_ROLEID ||
        roleID == process.env.ADMIN_ROLEID
      ) {
        request['resourceBlackListAttrs'] = [];
        return true;
      }
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

  private async refreshTokenByPayload(
    username: string,
    roleIDs: string[],
    user: User,
    idx: number = -1,
  ) {
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
    console.log('@Service: \n', out);
    const hashes = [hashText(out.refreshToken), hashText(out.accessToken)];
    if (idx == -1) {
      user.hashedRefreshTokens = [
        hashes[0],
        ...(user.hashedRefreshTokens ?? []),
      ].slice(0, 5);
      user.hashedAccessTokens = [
        hashes[1],
        ...(user.hashedAccessTokens ?? []),
      ].slice(0, 5);
    } else {
      if (user.hashedRefreshTokens && user.hashedAccessTokens) {
        user.hashedRefreshTokens[idx] = hashes[0];
        user.hashedAccessTokens[idx] = hashes[1];
      }
    }
    await this.usersRepository.save(user);
    return out;
  }

  async getBlacklist(
    roleIDs: string[],
    resourceID: string,
    perm: PermTypeEnum,
  ) {
    for (const roleID of roleIDs) {
      if (
        roleID == process.env.SUPER_ADMIN_ROLEID ||
        roleID == process.env.ADMIN_ROLEID
      )
        return { canAccess: true, blacklist: [] };
    }
    const perms = {};
    perms[perm] = true;
    const accessRules = await this.accessRulesRepository.find({
      where: { roleID: In(roleIDs), resourceID: resourceID, ...perms },
      select: {
        readAttrDTOBlackList: true,
        updateAttrDTOBlackList: true,
        createAttrDTOBlackList: true,
        roleID: true,
      },
    });
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
        return { canAccess: false, blacklist: [] };
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
      return { canAccess: true, blacklist: Array.from(attrBlackList) };
    } else return { canAccess: false, blacklist: [] };
  }
}
