import {
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { AccessRule } from './accessRule.model';
import { User } from './user.model';

import { Expose } from '@nestjs/class-transformer';

@Entity('role')
export class Role {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  roleID: string;
  @OneToMany(() => AccessRule, (accessRule) => accessRule.role)
  @Expose({ groups: ['NOT-TO-DTO'] })
  accessRules: AccessRule[];
  @Expose({ groups: ['NOT-TO-DTO'] })
  @ManyToMany(() => User, (user) => user.roles, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'role_user_rel', // Tên bảng trung gian
    joinColumn: {
      name: 'roleID', // Tên cột khóa ngoại trong bảng trung gian cho bảng Student
      referencedColumnName: 'roleID', // Cột tham chiếu trong bảng Student
    },
    inverseJoinColumn: {
      name: 'username', // Tên cột khóa ngoại trong bảng trung gian cho bảng Course
      referencedColumnName: 'username', // Cột tham chiếu trong bảng Course
    },
  })
  users: User[];
}
