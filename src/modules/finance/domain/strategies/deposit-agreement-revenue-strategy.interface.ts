import { DepositAgreementStatus } from 'src/shared/contract/leasing/leasing.enum';

/*
┌────────────────────────────────────────────┐
│  INTERFACE: IDepositAgreementRevenueStrategy│
│  Mục đích: Định nghĩa contract cho strategy │
│  tính toán revenue từ amount                │
└────────────────────────────────────────────┘
*/
export interface DepositAgreementRevenueData {
  price?: number;
  commissionPer?: number;
  cancelFee?: number;
  status: DepositAgreementStatus;
  // 📝 TODO(user): Bổ sung các trường cần thiết
}

export interface DepositAgreementRevenueResult {
  revenue: number;
  madeSalerRevenue: number;
  madeCollaboratorRevenue: number;
  takenOverSalerRevenue: number;
}

export interface IDepositAgreementRevenueStrategy {
  process(data: unknown): DepositAgreementRevenueResult;
}
