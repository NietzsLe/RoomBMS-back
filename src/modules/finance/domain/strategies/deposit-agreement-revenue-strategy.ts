import { Injectable } from '@nestjs/common';
import {
  IDepositAgreementRevenueStrategy,
  DepositAgreementRevenueData,
  DepositAgreementRevenueResult,
} from './deposit-agreement-revenue-strategy.interface';
import { DepositAgreementStatus } from 'src/models/helper';

/*
┌────────────────────────────────────────────┐
│  STRATEGY: DepositAgreementRevenueStrategy │
│  Mục đích: Tính toán revenue từ amount     │
└────────────────────────────────────────────┘
*/
@Injectable()
export class DepositAgreementRevenueStrategy
  implements IDepositAgreementRevenueStrategy
{
  process(data: DepositAgreementRevenueData): DepositAgreementRevenueResult {
    // 💡 NOTE(GitHub Copilot): Tính revenue cho từng đối tượng dựa trên status
    if (data.status === DepositAgreementStatus.CANCELLED) {
      if (typeof data.cancelFee !== 'number') {
        throw new Error(
          'Dữ liệu không hợp lệ: cancelFee phải có khi status là cancelled',
        );
      }
      const revenue = data.cancelFee;
      const madeCollaboratorRevenue = 0;
      const madeSalerRevenue = revenue / 2;
      const takenOverSalerRevenue = revenue / 2;
      return {
        revenue,
        madeSalerRevenue,
        madeCollaboratorRevenue,
        takenOverSalerRevenue,
      };
    }
    // Trường hợp active
    if (
      typeof data.price !== 'number' ||
      typeof data.commissionPer !== 'number'
    ) {
      throw new Error('Dữ liệu không hợp lệ để tính revenue');
    }
    // Tính tổng revenue
    const revenue = (data.price * data.commissionPer) / 100;
    let remain = revenue - 80000;
    // Xác định madeCollaboratorRevenue
    let madeCollaboratorRevenue = 0;
    if (data.price <= 2500000) {
      madeCollaboratorRevenue = 270000;
    } else if (data.price <= 4000000) {
      madeCollaboratorRevenue = 450000;
    } else if (data.price <= 5000000) {
      madeCollaboratorRevenue = 675000;
    } else if (data.price <= 6000000) {
      madeCollaboratorRevenue = 900000;
    } else if (data.price <= 7000000) {
      madeCollaboratorRevenue = 1125000;
    } else if (data.price <= 8000000) {
      madeCollaboratorRevenue = 1350000;
    } else if (data.price <= 9000000) {
      madeCollaboratorRevenue = 1575000;
    } else if (data.price <= 10000000) {
      madeCollaboratorRevenue = 1800000;
    } else {
      madeCollaboratorRevenue = 2025000;
    }
    // Trừ madeCollaboratorRevenue khỏi tổng revenue
    remain = revenue - madeCollaboratorRevenue;
    // Chia đôi phần còn lại
    const madeSalerRevenue = remain / 2;
    const takenOverSalerRevenue = remain / 2;
    return {
      revenue,
      madeSalerRevenue,
      madeCollaboratorRevenue,
      takenOverSalerRevenue,
    };
  }
}
