export class Team {
  id: string; // Khóa chính
  leaderID: string; // ID của người đứng đầu team
  salerIDs?: string[]; // Danh sách ID của các thành viên trong team
  deletedAt?: Date;

  // ─────────────────────────────────────────────
  // ▶ Method quản lý entity Team
  // ─────────────────────────────────────────────
  constructor(params?: Partial<Team>) {
    if (params) {
      Object.assign(this, params);
      this.salerIDs = params.salerIDs ?? [];
    } else {
      this.salerIDs = [];
    }
  }

  static create(params: Partial<Team>): Team {
    return new Team(params);
  }

  update(params: Partial<Team>): void {
    Object.assign(this, params);
  }

  isDeleted(): boolean {
    return !!this.deletedAt;
  }

  // ─────────────────────────────────────────────
  // ▶ Method quản lý array salerIDs
  // ─────────────────────────────────────────────
  addSaler(salerID: string): void {
    // 💡 NOTE(GitHub Copilot): Thêm salerID vào danh sách nếu chưa có
    if (!this.salerIDs) this.salerIDs = [];
    if (!this.salerIDs.includes(salerID)) {
      this.salerIDs.push(salerID);
    }
  }

  removeSaler(salerID: string): void {
    // 💡 NOTE(GitHub Copilot): Xóa salerID khỏi danh sách
    if (this.salerIDs) {
      this.salerIDs = this.salerIDs.filter((id) => id !== salerID);
    }
  }

  // 📝 TODO(user): Bổ sung các logic nghiệp vụ nếu cần
}
