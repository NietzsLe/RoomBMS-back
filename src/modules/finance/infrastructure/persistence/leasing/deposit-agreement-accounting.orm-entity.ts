import {
  Entity,
  PrimaryColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { DepositAgreement } from 'src/models/deposit-agreement.model';
import { Team } from 'src/models/team.model';
import { User } from 'src/models/user.model';
import { CommissionOrmEntity } from '../payout/commission.orm-entity';
import { AgreementPaymentOrmEntity } from '../agreement-payment.orm-entity';
import { PerformancePeriodOrmEntity } from '../performance-period.orm-entity';

@Entity({ name: 'deposit-agreement-accounting' })
export class DepositAgreementAccountingOrmEntity {
  @PrimaryColumn()
  id: number;

  @OneToOne(() => DepositAgreement)
  @JoinColumn({ name: 'id' })
  depositAgreement: DepositAgreement;

  /**
   * Kỳ tính hiệu suất
   */
  @ManyToOne(() => PerformancePeriodOrmEntity, { nullable: false })
  @JoinColumn({ name: 'periodCode' })
  period: PerformancePeriodOrmEntity;

  // 1-n: madeTeam
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'madeTeamID' })
  madeTeam: Team;

  // 1-n: takenOverTeam
  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'takenOverTeamID' })
  takenOverTeam: Team;

  // 1-n: madeSaler
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'madeSalerID' })
  madeSaler: User;

  // 1-n: madeCollaborator
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorID' })
  madeCollaborator: User;

  // 1-n: takenOverSaler
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerID' })
  takenOverSaler: User;

  // 1-1: madeSalerCommissionOrmEntity
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeSalerCommissionOrmEntityID' })
  madeSalerCommissionOrmEntity: CommissionOrmEntity;

  // 1-1: madeCollaboratorCommissionOrmEntity
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorCommissionOrmEntityID' })
  madeCollaboratorCommissionOrmEntity: CommissionOrmEntity;

  // 1-1: takenOverSalerCommissionOrmEntity
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerCommissionOrmEntityID' })
  takenOverSalerCommissionOrmEntity: CommissionOrmEntity;

  // 1-1: agreementPayment
  @OneToOne(() => AgreementPaymentOrmEntity, { nullable: true })
  @JoinColumn({ name: 'agreementPaymentID' })
  agreementPayment: AgreementPaymentOrmEntity;

  // Revenue fields
  @Column('numeric', { nullable: true })
  revenue: number;

  @Column('numeric', { nullable: true })
  madeSalerRevenue: number;

  @Column('numeric', { nullable: true })
  madeCollaboratorRevenue: number;

  @Column('numeric', { nullable: true })
  takenOverSalerRevenue: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
