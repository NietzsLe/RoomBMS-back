import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Expose } from '@nestjs/class-transformer';
import { User } from './user.model';

@Entity('team')
export class Team {
  @PrimaryColumn()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  teamID: string;
  @Column({ default: false })
  @Expose({ groups: ['TO-DTO'] })
  isDisabled: boolean;
  @DeleteDateColumn()
  @Expose({ groups: ['TO-DTO'] })
  deletedAt: Date | null;
  @CreateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date;
  @UpdateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date;
  @OneToOne(() => User)
  @JoinColumn({ name: 'leaderID' })
  @Expose({ groups: ['NOT-TO-DTO'] })
  leader: User;
  @OneToMany(() => User, (user) => user.team)
  @Expose({ groups: ['NOT-TO-DTO'] })
  members: User[];
}
