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
import { SalerOrmEntity } from '../organization/saler.orm-entity';
import { CollaboratorOrmEntity } from '../organization/collaborator.orm-entity';
import { CommissionOrmEntity } from '../finance/payout-source/commission.orm-entity';
import { PerformancePeriodOrmEntity } from '../finance/period/performance-period.orm-entity';
import { AgreementReceiptOrmEntity } from '../finance/receipt/agreement-receipt.orm-entity';

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
  @ManyToOne(() => SalerOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeSalerID' })
  madeSaler: SalerOrmEntity;

  // 1-n: madeCollaborator
  @ManyToOne(() => CollaboratorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorID' })
  madeCollaborator: CollaboratorOrmEntity;

  // 1-n: takenOverSaler
  @ManyToOne(() => SalerOrmEntity, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerID' })
  takenOverSaler: SalerOrmEntity;

  // 1-1: madeSalerCommission
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeSalerCommissionID' })
  madeSalerCommission: CommissionOrmEntity;

  // 1-1: madeCollaboratorCommission
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'madeCollaboratorCommissionID' })
  madeCollaboratorCommission: CommissionOrmEntity;

  // 1-1: takenOverSalerCommission
  @OneToOne(() => CommissionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'takenOverSalerCommissionID' })
  takenOverSalerCommission: CommissionOrmEntity;

  // 1-1: agreementReceipt
  @OneToOne(() => AgreementReceiptOrmEntity, { nullable: true })
  @JoinColumn({ name: 'agreementReceiptID' })
  agreementReceipt: AgreementReceiptOrmEntity;

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
