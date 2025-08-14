export enum AgreementPaymentStatus {
  COLLECTED = 'COLLECTED',
  NOT_COLLECTED = 'NOT_COLLECTED',
}

export enum CommissionPayoutStatus {
  PAID = 'PAID', // Đã chi
  UNPAID = 'UNPAID', // Chưa chi
}

export enum PerformancePeriodType {
  MONTH = 'MONTH',
  WEEK = 'WEEK',
}

export enum PerformanceRecordObjectType {
  COMPANY = 'COMPANY',
  TEAM = 'TEAM',
  SALER = 'SALER',
  COLLABORATOR = 'COLLABORATOR',
}

export enum SalerCommissionPolicy {
  OLD = 'OLD',
  NEW = 'NEW',
}

export enum AdvanceStatus {
  DEDUCTED = 'DEDUCTED',
  NOT_DEDUCTED = 'NOT_DEDUCTED',
}
