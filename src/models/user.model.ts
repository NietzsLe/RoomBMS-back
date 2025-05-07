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
import { Expose, Transform, Type } from '@nestjs/class-transformer';

@Entity('user')
export class User {
  @PrimaryColumn()
  @Expose({ groups: ['TO-DTO'] })
  username: string;
  @Column()
  @Expose({ groups: ['TO-DTO'] })
  name: string;
  @Column({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  team: string;
  @Column({ default: '0365518929' })
  @Expose({ groups: ['TO-DTO'] })
  phoneNumber: string;
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
  @Expose({ groups: ['TO-DTO'] })
  deletedAt: Date | null;
  @CreateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  createAt: Date;
  @UpdateDateColumn({ nullable: true })
  @Expose({ groups: ['TO-DTO'] })
  updateAt: Date;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @Column({ type: String, nullable: true })
  hashedRefreshToken: string | null;
  @Expose({ groups: ['NOT-TO-DTO'] })
  @Column({ type: String, nullable: true })
  hashedAccessToken: string | null;
  @ManyToMany(() => Role, (role) => role.users, {
    onDelete: 'CASCADE',
  })
  @Expose({ name: 'roleIDs', groups: ['TO-DTO'] })
  @Type(() => Role)
  @Transform(
    ({ value }: { value: Role[] }) => value?.map((role: Role) => role.roleID),
    {
      toPlainOnly: true,
    },
  )
  roles: Role[];
  @OneToMany(() => User, (user) => user.manager)
  @Expose({ groups: ['NOT-TO-DTO'] })
  createdUsers: User[];
  @ManyToOne(() => User, (user) => user.createdUsers, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'managerID' })
  @Type(() => User)
  @Expose({ name: 'managerID', groups: ['TO-DTO'] })
  @Transform(({ value }: { value: User }) => value?.username, {
    toPlainOnly: true,
  })
  manager: User | null;
  @OneToMany(() => Appointment, (appointment) => appointment.takenOverUser)
  @Expose({ groups: ['NOT-TO-DTO'] })
  takenOverAppointments: Appointment[];
  @OneToMany(() => Appointment, (appointment) => appointment.madeUser)
  @Expose({ groups: ['NOT-TO-DTO'] })
  madeAppointments: Appointment[];
}
