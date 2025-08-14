import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { PerformancePeriodOrmEntity } from './performance-period.orm-entity';
import { Team } from 'src/models/team.model';
import { PerformanceRecordObjectType } from '../../domain/finance.enum';
import { SalerOrmEntity } from './organization/saler.orm-entity';
import { CollaboratorOrmEntity } from './organization/collaborator.orm-entity';

/*
┌────────────────────────────────────────────┐
│      ENTITY: PerformanceRecordOrmEntity             │
│      Bảng: performance-record              │
│      Mục đích: Lưu trữ dữ liệu hiệu suất   │
└────────────────────────────────────────────┘
*/
@Entity({ name: 'performance-record' })
export class PerformanceRecordOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Kỳ tính hiệu suất
   */
  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'periodCode' })
  period: PerformancePeriodOrmEntity;

  /**
   * Doanh số của đối tượng
   */
  @Column('float', { nullable: true })
  revenue: number;

  /**
   * Doanh số các saler thuộc về đối tượng
   */
  @Column('float', { nullable: true })
  salerRevenue: number;

  /**
   * Doanh số các collaborator thuộc về đối tượng
   */
  @Column('float', { nullable: true })
  collaboratorRevenue: number;

  /**
   * Số cuộc hẹn saler liên quan tạo
   */
  @Column('int', { nullable: true })
  madeBySalerAppointmentCount: number;

  /**
   * Số cuộc hẹn collaborator liên quan tạo
   */
  @Column('int', { nullable: true })
  madeByCollaboratorAppointmentCount: number;

  /**
   * Số cuộc hẹn đối tượng nhận
   */
  @Column('int', { nullable: true })
  takenOverAppointmentCount: number;

  /**
   * Số lượng cọc đã tạo
   */
  @Column('int', { nullable: true })
  depositAgreementCount: number;

  /**
   * Số lượng cọc có hiệu lực
   */
  @Column('int', { nullable: true })
  activeDepositAgreementCount: number;

  /**
   * Số lượng cọc bị hủy
   */
  @Column('int', { nullable: true })
  cancelledDepositAgreementCount: number;

  /**
   * Kiểu đối tượng của bản ghi này
   */
  @Column({
    type: 'enum',
    enum: PerformanceRecordObjectType,
    default: PerformanceRecordObjectType.COMPANY,
  })
  objectType: PerformanceRecordObjectType;

  /**
   * Liên kết team nếu kiểu đối tượng là TEAM
   */
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'teamID' })
  team: Team;

  /**
   * Liên kết saler nếu kiểu đối tượng là SALER
   */
  @ManyToOne(() => SalerOrmEntity, { nullable: true })
  @JoinColumn({ name: 'salerID' })
  saler: SalerOrmEntity;

  /**
   * Liên kết collaborator nếu kiểu đối tượng là COLLABORATOR
   */
  @ManyToOne(() => CollaboratorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'collaboratorID' })
  collaborator: CollaboratorOrmEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
