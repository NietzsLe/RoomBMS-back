import { classToPlain, plainToClass } from '@nestjs/class-transformer';

import {
  AccessRuleWithoutRoleDTO,
  ReadUserWithAccessRightDTO,
  CreateUserDTO,
  UpdateUserDTO,
  ReadUserDTO,
} from 'src/dtos/userDTO';
import { User } from 'src/models/user.model';
import { AccessRuleMapper } from './accessRule.mapper';

function mergeAccessRuleMap(
  map1: Map<string, AccessRuleWithoutRoleDTO>,
  map2: Map<string, AccessRuleWithoutRoleDTO>,
): Map<string, AccessRuleWithoutRoleDTO> {
  const out = new Map<string, AccessRuleWithoutRoleDTO>();
  for (const [key, value] of map1) {
    if (map2.has(key)) {
      const map2Item = map2.get(key) as AccessRuleWithoutRoleDTO;
      if (map2Item.unlinkPerm != value.unlinkPerm) {
        if (!value.unlinkPerm) {
          value.unlinkPerm = true;
        }
      } else if (!map2Item.unlinkPerm) {
        value.unlinkPerm = false;
      } else {
        value.unlinkPerm = true;
      }
      // just split
      if (map2Item.readPerm != value.readPerm) {
        if (!value.readPerm) {
          value.readPerm = true;
          value.readAttrDTOBlackList = map2Item.readAttrDTOBlackList;
        }
      } else if (!map2Item.readPerm) {
        value.readPerm = false;
      } else {
        value.readPerm = true;
        const set = new Set([
          ...value.readAttrDTOBlackList.filter((item) => {
            const set2 = new Set(map2Item.readAttrDTOBlackList);
            return set2.has(item);
          }),
        ]);
        value.readAttrDTOBlackList = Array.from(set);
      }
      // just split
      if (map2Item.updatePerm != value.updatePerm) {
        if (!value.updatePerm) {
          value.updatePerm = true;
          value.updateAttrDTOBlackList = map2Item.updateAttrDTOBlackList;
        }
      } else if (!map2Item.updatePerm) {
        value.updatePerm = false;
      } else {
        value.updatePerm = true;
        const set = new Set([
          ...value.updateAttrDTOBlackList.filter((item) => {
            const set2 = new Set(map2Item.updateAttrDTOBlackList);
            return set2.has(item);
          }),
        ]);
        value.updateAttrDTOBlackList = Array.from(set);
      }
      // just split
      if (map2Item.createPerm != value.createPerm) {
        if (!value.createPerm) {
          value.createPerm = true;
          value.createAttrDTOBlackList = map2Item.createAttrDTOBlackList;
        }
      } else if (!map2Item.createPerm) {
        value.createPerm = false;
      } else {
        value.createPerm = true;
        const set = new Set([
          ...value.createAttrDTOBlackList.filter((item) => {
            const set2 = new Set(map2Item.createAttrDTOBlackList);
            return set2.has(item);
          }),
        ]);
        value.createAttrDTOBlackList = Array.from(set);
      }
      out.set(key, value);
      map2.delete(key);
    } else {
      out.set(key, value);
    }
  }
  for (const [key, value] of map2) {
    out.set(key, value);
  }
  return out;
}

export class UserMapper {
  // Chuyển đổi từ CreateAppointmentDTO sang Appointment entity
  static DTOToEntity(userDTO: CreateUserDTO | UpdateUserDTO) {
    const plainObj = classToPlain(userDTO);
    // console.log('@Mapper: \n', plainObj);
    return plainToClass(User, plainObj, {
      groups: ['TO-DTO', 'NOT-TO-DTO'],
      excludeExtraneousValues: true,
    });
  }

  static EntityToReadDTO(user: User) {
    const plainObj = classToPlain(user, {
      groups: ['TO-DTO'],
    });
    //console.log('@Mapper: \n', plainObj);
    return plainObj;
  }
  static EntityToReadForAppointmentDTO(user: User) {
    const plainObj = classToPlain(user, {
      groups: ['TO-APPOINTMENT-DTO'],
    });
    // console.log('@Mapper: \n', plainObj);
    return plainToClass(ReadUserDTO, plainObj);
  }

  static EntityToReadWithAccessRightDTO(user: User) {
    const plainObj = classToPlain(user, {
      groups: ['TO-DTO'],
    });
    let accessRuleMap = new Map<string, AccessRuleWithoutRoleDTO>();
    for (const role of user.roles ?? []) {
      const tempAccessRuleMap = new Map<string, AccessRuleWithoutRoleDTO>(
        role.accessRules.map((item) => {
          const accessRule = AccessRuleMapper.EntityToReadDTO(item);
          delete accessRule.roleID;
          return [
            accessRule.resourceID,
            accessRule as AccessRuleWithoutRoleDTO,
          ];
        }),
      );
      accessRuleMap = mergeAccessRuleMap(accessRuleMap, tempAccessRuleMap);
    }
    plainObj.accessRights = [...accessRuleMap].map((item) => item[1]);
    // console.log('@Mapper: \n', plainObj);
    const dto = plainToClass(ReadUserWithAccessRightDTO, plainObj, {
      excludeExtraneousValues: true,
    });
    // console.log('@Mapper: ', dto);
    return dto;
  }
}
