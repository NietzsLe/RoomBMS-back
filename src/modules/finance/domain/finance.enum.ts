export enum AccruedItemStatus {
  PENDING = 'PENDING', // Chờ phân bổ
  ALLOCATED = 'ALLOCATED', // Đã phân bổ đủ
  SETTLED = 'SETTLED', // Đã quyết toán đủ
}
export enum AccruedItemProcessStatus {
  UNPROCESSED = 'UNPROCESSED', // Chưa xử lý
  PROCESSED = 'PROCESSED', // Đã xử lý (toàn bộ amount đã chia và payout đã paid)
}
export enum AccruedItemCategory {
  EXPENSE = 'EXPENSE', // Khoản chi
  DEDUCTION = 'DEDUCTION', // Khoản khấu trừ
}

export enum AccruedItemSourceType {
  COMMISSION = 'COMMISSION',
  VIOLATION = 'VIOLATION',
  ADVANCE_SALARY = 'ADVANCE_SALARY',
}
export enum AccruedItemType {
  EXPENSE = 'EXPENSE', // Chi
  DEDUCTION = 'DEDUCTION', // Khấu trừ
}
export enum CommissionPayoutPeriodType {
  PAYROLL = 'PAYROLL', // Trả lương cuối tháng
  SALE_COMMISSION = 'SALE_COMMISSION', // Trả hoa hồng sale
  COLLABORATOR_COMMISSION = 'COLLABORATOR_COMMISSION', // Trả hoa hồng cộng tác viên
}

export enum AdvanceSalaryStatus {
  PENDING = 'PENDING', // Chưa chi
  PAID = 'PAID', // Đã chi
  DEDUCTED = 'DEDUCTED', // Đã khấu trừ
}

export enum AgreementReceiptStatus {
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
