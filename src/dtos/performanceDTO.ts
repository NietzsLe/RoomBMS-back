import { PeriodType } from 'src/models/helper';
import { ReadDepositAgreementDTO } from './depositAgreementDTO';
import { ReadTeamDTO, ReadUserDTO } from './userDTO';

export class SalerRevenueDTO {
  collaboratorTotalRevenue: number;
  salerTotalRevenue: number;
}
export class CollaboratorRevenueDTO {
  collaboratorTotalRevenue: number;
}

export class PerformancePeriodDTO {
  periodType: PeriodType; // 🏷️ Use enum PeriodType for type safety
  periodName: string;
}

export class PerformanceBasicInfoDTO {
  period: PerformancePeriodDTO;
}

/**
 * 📝 CompanyPerformanceBasicInfoDTO is calculated by aggregating all PerformancePerPeriod records for the company tier in the given period.
 * - totalRevenue: Sum of totalRevenue from all PerformancePerPeriod where roleTier = COMPANY
 * - collaboratorTotalRevenue: Sum of collaboratorTotalRevenue from all PerformancePerPeriod where roleTier = COMPANY
 * - salerTotalRevenue: Sum of salerTotalRevenue from all PerformancePerPeriod where roleTier = COMPANY
 * - appointmentCount: Sum of all appointment counts (collaborator + saler) from PerformancePerPeriod where roleTier = COMPANY
 * - ... (other fields: sum or aggregate from company-level PerformancePerPeriod)
 */
export class CompanyPerformanceBasicInfoDTO extends PerformanceBasicInfoDTO {
  totalRevenue: number;
  collaboratorTotalRevenue: number;
  salerTotalRevenue: number;
  appointmentCount: number;
  collaboratorAppointmentCount: number;
  salerMadeAppointmentCount: number;
  salerTookOverAppointmentCount: number;
  depositAgreementCount: number;
  cancelledDepositAgreementCount: number;
}

/**
 * 📝 TeamPerformanceBasicInfoDTO is calculated by aggregating all PerformancePerPeriod records for a team in the given period.
 * - totalRevenue: Sum of totalRevenue from all PerformancePerPeriod where roleTier = TEAM and teamID = target team
 * - collaboratorTotalRevenue: Sum of collaboratorTotalRevenue from all PerformancePerPeriod where roleTier = TEAM and teamID = target team
 * - ... (other fields: sum or aggregate from team-level PerformancePerPeriod)
 */
export class TeamPerformanceBasicInfoDTO extends PerformanceBasicInfoDTO {
  totalRevenue: number;
  collaboratorTotalRevenue: number;
  salerTotalRevenue: number;
  appointmentCount: number;
  collaboratorAppointmentCount: number;
  salerMadeAppointmentCount: number;
  salerTookOverAppointmentCount: number;
  depositAgreementCount: number;
  cancelledDepositAgreementCount: number;
}
/**
 * 📝 SalerPerformanceBasicInfoDTO is calculated by aggregating all PerformancePerPeriod records for a saler in the given period.
 * - collaboratorTotalRevenue: Sum of collaboratorTotalRevenue from all PerformancePerPeriod where roleTier = SALER and user = target saler
 * - ... (other fields: sum or aggregate from saler-level PerformancePerPeriod)
 */
export class SalerPerformanceBasicInfoDTO extends PerformanceBasicInfoDTO {
  collaboratorTotalRevenue: number;
  salerTotalRevenue: number;
  collaboratorAppointmentCount: number;
  salerMadeAppointmentCount: number;
  salerTookOverAppointmentCount: number;
  depositAgreementCount: number;
  cancelledDepositAgreementCount: number;
}
/**
 * 📝 CollaboratorPerformanceBasicInfoDTO is calculated by aggregating all PerformancePerPeriod records for a collaborator in the given period.
 * - collaboratorTotalRevenue: Sum of collaboratorTotalRevenue from all PerformancePerPeriod where roleTier = COLLABORATOR and user = target collaborator
 * - ... (other fields: sum or aggregate from collaborator-level PerformancePerPeriod)
 */
export class CollaboratorPerformanceBasicInfoDTO extends PerformanceBasicInfoDTO {
  collaboratorTotalRevenue: number;
  collaboratorAppointmentCount: number;
  depositAgreementCount: number;
  cancelledDepositAgreementCount: number;
}

export class CompanyPerformanceDTO {
  topTeamPerformance: TeamPerformanceDTO;
  topSalerPerformance: SalerPerformanceDTO;
  topCollaboratorPerformance: CollaboratorPerformanceDTO;
  basicInfo: CompanyPerformanceBasicInfoDTO;
  prevBasicInfo: CompanyPerformanceBasicInfoDTO;
  depositAgreements: ReadDepositAgreementDTO[];
  teamPerformances: TeamPerformanceDTO[];
  statistics: CompanyPerformanceBasicInfoDTO[];
}

export class TeamPerformanceDTO {
  team: ReadTeamDTO;
  topSalerPerformance: SalerPerformanceDTO;
  topCollaboratorPerformance: CollaboratorPerformanceDTO;
  basicInfo: TeamPerformanceBasicInfoDTO;
  prevBasicInfo: TeamPerformanceBasicInfoDTO;
  depositAgreements: ReadDepositAgreementDTO[];
  salerPerformances: SalerPerformanceDTO[];
  statistics: TeamPerformanceBasicInfoDTO[];
}

export class SalerPerformanceDTO {
  saler: ReadUserDTO;
  topCollaboratorPerformance: CollaboratorPerformanceDTO;
  basicInfo: SalerPerformanceBasicInfoDTO;
  prevBasicInfo: SalerPerformanceBasicInfoDTO;
  collaboratorPerformances: CollaboratorPerformanceDTO[];
  depositAgreements: ReadDepositAgreementDTO[];
  statistics: SalerPerformanceBasicInfoDTO[];
}

export class CollaboratorPerformanceDTO {
  collaborator: ReadUserDTO;
  basicInfo: CollaboratorPerformanceBasicInfoDTO;
  prevBasicInfo: CollaboratorPerformanceBasicInfoDTO;
  depositAgreements: ReadDepositAgreementDTO[];
  statistics: CollaboratorPerformanceBasicInfoDTO[];
}
