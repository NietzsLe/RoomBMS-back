import { BankType } from '../bank-type.entity';

export class Employee {
  id: string; // Khóa chính
  name: string; // Tên nhân viên
  bankAccountNumber?: string; // Số tài khoản ngân hàng
  bankAccountName?: string; // Tên tài khoản ngân hàng
  bankType?: BankType; // Loại ngân hàng liên kết (có thể có hoặc không)
}
