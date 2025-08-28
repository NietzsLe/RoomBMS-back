import { AgreementReceipt } from '../receipt/agreement-receipt.entity';
import { Commission } from '../payout-source/commission.entity';
import { AgreementReceiptStatus } from '../../finance.enum';

export class DepositAgreementAccounting {
  id: number;
  periodCode: string;
  madeTeamID?: number;
  takenOverTeamID?: number;
  madeSalerID?: number;
  madeCollaboratorID?: number;
  takenOverSalerID?: number;
  madeSalerCommission?: Commission;
  madeCollaboratorCommission?: Commission;
  takenOverSalerCommission?: Commission;
  agreementReceipt?: AgreementReceipt;
  revenue: number;
  madeSalerRevenue?: number;
  madeCollaboratorRevenue?: number;
  takenOverSalerRevenue?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity DepositAgreementAccounting
  // ─────────────────────────────────────────────
  constructor(params?: Partial<DepositAgreementAccounting>) {
    if (params) {
      // 🛡️ Validate: Nếu madeCollaboratorID có thì madeSalerID phải có
      if (params.madeCollaboratorID && !params.madeSalerID) {
        throw new Error(
          `Không thể khởi tạo DepositAgreementAccounting: Nếu madeCollaboratorID có thì madeSalerID phải có (id: ${params.id ?? 'chưa có'})`,
        );
      }
      Object.assign(this, params);
      this.createdAt = params.createdAt ?? new Date();
      this.updatedAt = params.updatedAt ?? new Date();
    }
  }

  static create(
    params: Partial<DepositAgreementAccounting>,
  ): DepositAgreementAccounting {
    // 🛡️ Validate: Nếu madeCollaboratorID có thì madeSalerID phải có
    if (params.madeCollaboratorID && !params.madeSalerID) {
      throw new Error(
        `Không thể tạo DepositAgreementAccounting: Nếu madeCollaboratorID có thì madeSalerID phải có (id: ${params.id ?? 'chưa có'})`,
      );
    }
    return new DepositAgreementAccounting(params);
  }

  update(params: Partial<DepositAgreementAccounting>): void {
    // 🔒 Không được update khi entity đã bị xóa
    if (this.deletedAt) {
      // BUG(GitHub Copilot): Không thể cập nhật đối tượng đã bị xóa, định danh rõ ràng và kiểu đối tượng
      throw new Error(
        `Không thể cập nhật đối tượng đã bị xóa [DepositAgreementAccounting] (id: ${this.id})`,
      );
    }
    // 🚫 Không cho phép update nếu agreementReceipt đã thu hoặc bị hủy
    const agreementStatus = this.agreementReceipt?.status;
    if (agreementStatus === AgreementReceiptStatus.COLLECTED) {
      throw new Error(
        `Không được phép cập nhật đối tượng [DepositAgreementAccounting] khi agreementReceipt đã thu hoặc bị hủy (id: ${this.id})`,
      );
    }
    // 🚫 Không cho phép update các trường đặc biệt
    const forbiddenFields = [
      'madeTeamID',
      'takenOverTeamID',
      'madeSalerID',
      'madeCollaboratorID',
      'takenOverSalerID',
    ];
    for (const field of forbiddenFields) {
      if (params && field in params) {
        // 🛑 Không cho phép cập nhật trường đặc biệt
        throw new Error(
          `Không được phép cập nhật trường '${field}' cho đối tượng [DepositAgreementAccounting] (id: ${this.id})`,
        );
      }
    }
    Object.assign(this, params);
    this.updatedAt = new Date();
  }

  restore(): void {
    // 💡 NOTE(GitHub Copilot): Khôi phục entity, bỏ trạng thái xóa
    this.deletedAt = undefined;
    this.updatedAt = new Date();
  }

  delete(): void {
    // 💡 NOTE(GitHub Copilot): Xóa mềm entity, gán deletedAt
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
