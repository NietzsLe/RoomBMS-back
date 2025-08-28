import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SalerOrmEntity } from '../organization/saler.orm-entity';
import { CollaboratorOrmEntity } from '../organization/collaborator.orm-entity';
import { Appointment } from 'src/models/appointment.model';
import { Team } from 'src/models/team.model';
import { PerformancePeriodOrmEntity } from '../finance/period/performance-period.orm-entity';

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
  @ManyToOne(() => SalerOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeSalerID' })
  madeSaler: SalerOrmEntity;

  /**
   * Người tạo (Collaborator)
   */
  @ManyToOne(() => CollaboratorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorID' })
  madeCollaborator: CollaboratorOrmEntity;

  /**
   * Người tiếp nhận (Saler)
   */
  @ManyToOne(() => SalerOrmEntity, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerID' })
  takenOverSaler: SalerOrmEntity;

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
