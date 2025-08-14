import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Role } from './role.model';
import { Expose } from '@nestjs/class-transformer';

@Entity('access_rule')
export class AccessRule {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  resourceID: string;
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  roleID: string;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  readPerm: boolean;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  updatePerm: boolean;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  createPerm: boolean;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  unlinkPerm: boolean;
  @Column('text', { array: true, default: [] })
  @Expose({ groups: ['TO-DTO'] })
  readAttrDTOBlackList: string[];
  @Column('text', { array: true, default: [] })
  @Expose({ groups: ['TO-DTO'] })
  createAttrDTOBlackList: string[];
  @Column('text', { array: true, default: [] })
  @Expose({ groups: ['TO-DTO'] })
  updateAttrDTOBlackList: string[];
  @ManyToOne(() => Role, (role) => role.accessRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleID', referencedColumnName: 'roleID' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  role: Role;
}
