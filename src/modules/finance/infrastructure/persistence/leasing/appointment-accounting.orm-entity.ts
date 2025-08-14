import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from 'src/models/user.model';
import { Appointment } from 'src/models/appointment.model';
import { Team } from 'src/models/team.model';
import { PerformancePeriodOrmEntity } from '../performance-period.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: AppointmentAccounting         │
│      Bảng: appointment-accounting          │
│      Mục đích: Kế toán cho appointment     │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'appointment-accounting' })
export class AppointmentAccountingOrmEntity {
  /**
   * Khóa chính, liên kết đến Appointment
   */
  @PrimaryColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Appointment, { nullable: false })
  @JoinColumn({ name: 'id' })
  appointment: Appointment;

  /**
   * Kỳ tính hiệu suất
   */
  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'periodCode' })
  period: PerformancePeriodOrmEntity;

  /**
   * Người tạo (Saler)
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'madeSalerID' })
  madeSaler: User;

  /**
   * Người tạo (Collaborator)
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorID' })
  madeCollaborator: User;

  /**
   * Người tiếp nhận (Saler)
   */
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerID' })
  takenOverSaler: User;

  /**
   * Team tạo
   */
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'madeTeamID' })
  madeTeam: Team;

  /**
   * Team tiếp nhận
   */
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'takenOverTeamID' })
  takenOverTeam: Team;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
