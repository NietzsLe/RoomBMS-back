// ===== IMPORTS =====
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  JoinColumn,
  Unique,
  DeleteDateColumn,
} from 'typeorm'; // 📦 TypeORM decorators
import { User } from './user.model'; // 👤 User entity
import { Team } from './team.model'; // 👥 Team entity
import { DepositAgreement } from './depositAgreement.model'; // 💼 DepositAgreement entity
import { PeriodType, RoleTier } from '../helper'; // 📅 Enum for period type, 🏷️ Enum for role tier

// ===== MODEL DEFINITION =====
/**
 * 📊 PerformancePerPeriod
 * Stores performance metrics for a unit (collaborator, saler, team, company) by period (week/month).
 * - Uniqueness: (periodName, username) or (periodName, teamID) must be unique.
 * - Links to related deposit agreements, user, and team.
 */
@Entity()
@Unique(['periodName', 'username'])
@Unique(['periodName', 'teamID'])
export class PerformancePerPeriod {
  @PrimaryGeneratedColumn() performanceID: number; // 🔑 PK
  @Column({ type: 'enum', enum: PeriodType }) periodType: PeriodType; // 📅 Period type
  @Column({ type: 'varchar', length: 20 }) periodName: string; // 🏷️ Period name (e.g. '2025-W27', '2025-07')
  @Column({ type: 'enum', enum: RoleTier }) roleTier: RoleTier; // 🏷️ Role tier (collaborator, saler, team, company)
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  @JoinColumn({ name: 'username' })
  user?: User; // 👤 Related user (cascade soft delete)
  @ManyToOne(() => Team, {
    nullable: true,
    onDelete: 'CASCADE',
    cascade: ['soft-remove'],
  })
  @JoinColumn({ name: 'teamID' })
  team?: Team; // 👥 Related team (cascade soft delete)
  @Column({ type: 'bigint', default: 0 }) totalRevenue: number; // 💵 Total revenue
  @Column({ type: 'bigint', default: 0 }) collaboratorTotalRevenue: number; // 🤝 Collaborator revenue
  @Column({ type: 'bigint', default: 0 }) salerTotalRevenue: number; // 🧑‍💼 Saler revenue
  @Column({ type: 'int', default: 0 }) collaboratorAppointmentCount: number; // 📅 Collaborator appointments
  @Column({ type: 'int', default: 0 }) salerMadeAppointmentCount: number; // 🧑‍💼 Saler made appointments
  @Column({ type: 'int', default: 0 }) salerTookOverAppointmentCount: number; // 🧑‍💼 Saler took over appointments
  @Column({ type: 'int', default: 0 }) depositAgreementCount: number; // 💼 Deposit agreements
  @Column({ type: 'int', default: 0 }) cancelledDepositAgreementCount: number; // ❌ Cancelled deposit agreements
  @ManyToMany(() => DepositAgreement)
  @JoinTable()
  depositAgreements: DepositAgreement[]; // 💼 Related deposit agreements
  @CreateDateColumn() createdAt: Date; // 🕒 Created at
  @UpdateDateColumn() updatedAt: Date; // 🕒 Updated at
  @DeleteDateColumn() deletedAt?: Date | null; // 🗑️ Soft delete timestamp
}
