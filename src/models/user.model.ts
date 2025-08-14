import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToMany,
  OneToMany,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.model';
import { Appointment } from './appointment.model';
import { Expose, Type } from '@nestjs/class-transformer';
import { Team } from './team.model';

@Entity('user')
export class User {
  @PrimaryColumn()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  username: string;
  @Column()
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  name: string;
  @Column({ default: '0365518929' })
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  phoneNumber: string;
  /**
   * Số tài khoản ngân hàng của người dùng
   */
  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  bankAccount: string;
  /**
   * Tên ngân hàng mà người dùng sử dụng
   */
  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  bankName: string;

  @Column()
  @Expose({ groups: ['NOT-TO-DTO'] })
  hashedPassword: string;
  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  expiryTime: Date;
  @Column({ default: false })
  @Expose({ groups: ['TO-DTO'] })
  isDisabled: boolean;
  @DeleteDateColumn()
  @Expose({ groups: ['NOT-TO-DTO'] })
  deletedAt: Date | null;
  @CreateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date;
  @UpdateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @Column({ type: String, nullable: true, array: true })
  hashedRefreshTokens: string[] | null;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @Column({ type: String, nullable: true, array: true })
  hashedAccessTokens: string[] | null;
  @ManyToOne(() => Team, (team) => team.members, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'teamID' })
  @Type(() => Team)
  @Expose({
    groups: ['NOT-TO-DTO'],
  })
  team: Team | null;
  @ManyToMany(() => Role, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  @Expose({
    groups: ['TO-DTO'],
  })
  @Type(() => Role)
  roles: Role[];

  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'managerID' })
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  @Type(() => User)
  manager: User | null;
  @OneToMany(() => Appointment, (appointment) => appointment.takenOverUser)
  @Expose({ groups: ['NOT-TO-DTO'] })
  takenOverAppointments: Appointment[];

  @OneToMany(() => Appointment, (appointment) => appointment.madeUser)
  @Expose({ groups: ['NOT-TO-DTO'] })
  madeAppointments: Appointment[];

  /**
   * 👤 Leader of the user (usually the team leader)
   * - Relation: Many users can have the same leader
   * - Nullable, onDelete: SET NULL
   */
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'leaderID' })
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  @Type(() => User)
  leader: User | null;

  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  leaderID() {
    if (this.leader?.username) return this.leader.username;
    return undefined;
  }
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  managerID() {
    if (this.manager?.username) return this.manager.username;
    return undefined;
  }

  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  teamID() {
    if (this.team?.teamID) return this.team.teamID;
    return undefined;
  }
  @Expose({
    groups: ['TO-DTO', 'TO-APPOINTMENT-DTO', 'TO-DEPOSITAGREEMENT-DTO'],
  })
  roleIDs() {
    if (this.roles) return this.roles.map((role: Role) => role.roleID);
    return undefined;
  }
}
