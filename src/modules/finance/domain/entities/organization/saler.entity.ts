import { SalerCommissionPolicy } from '../../finance.enum';
import { Employee } from './employee.entity';

export class Saler extends Employee {
  relatedCollaboratorIDs?: string[]; // Danh sách các Collaborator liên quan (nếu có)
  teamID: string; // Liên kết đến Team entity
  commissionPolicy: SalerCommissionPolicy;
  deletedAt?: Date;

  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity Saler
  // ─────────────────────────────────────────────
  constructor(params?: Partial<Saler>) {
    super();
    if (params) {
      Object.assign(this, params);
      this.relatedCollaboratorIDs = params.relatedCollaboratorIDs ?? [];
    } else {
      this.relatedCollaboratorIDs = [];
    }
  }

  static create(params: Partial<Saler>): Saler {
    return new Saler(params);
  }

  update(params: Partial<Saler>): void {
    Object.assign(this, params);
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // ─────────────────────────────────────────────
  // ▶ Method quản lý array relatedCollaboratorIDs
  // ─────────────────────────────────────────────
  addRelatedCollaborator(collaboratorID: string): void {
    // 💡 NOTE(GitHub Copilot): Thêm collaboratorID vào danh sách nếu chưa có
    if (!this.relatedCollaboratorIDs) this.relatedCollaboratorIDs = [];
    if (!this.relatedCollaboratorIDs.includes(collaboratorID)) {
      this.relatedCollaboratorIDs.push(collaboratorID);
    }
  }

  removeRelatedCollaborator(collaboratorID: string): void {
    // 💡 NOTE(GitHub Copilot): Xóa collaboratorID khỏi danh sách
    if (this.relatedCollaboratorIDs) {
      this.relatedCollaboratorIDs = this.relatedCollaboratorIDs.filter(
        (id) => id !== collaboratorID,
      );
    }
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
