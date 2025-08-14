import { Injectable } from '@nestjs/common';
import { IDepositAgreementRevenueStrategy } from '../strategies/deposit-agreement-revenue-strategy.interface';
import { DepositAgreementRevenueStrategy } from '../strategies/deposit-agreement-revenue-strategy';

/*
┌────────────────────────────────────────────┐
│  FACTORY: DepositAgreementRevenueStrategyFactory │
│  Mục đích: Chọn strategy tính toán revenue từ amount│
└────────────────────────────────────────────┘
*/
@Injectable()
export class DepositAgreementRevenueStrategyFactory {
  static getStrategy(): IDepositAgreementRevenueStrategy {
    // 📝 TODO(user): Có thể mở rộng chọn strategy theo biến môi trường
    return new DepositAgreementRevenueStrategy();
  }
}
