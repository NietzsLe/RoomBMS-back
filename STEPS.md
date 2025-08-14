# Sửa tên file

[x] Đã hoàn thành

# Gom tất cả các bản liên quan vào chung service và controller

[x] Đã hoàn thành

# Cập nhật và kiểm tra phía frontend

[x] Đã hoàn thành

# Tạo các orm

hãy tạo entity commission-payout với classname CommissionOrmEntityPayout. Có các thuộc tính sau: id là khóa chính, liên kết đến một user 1-n, liên kết đến

Hãy tạo entity performance-record với classname PerformanceRecordOrmEntity với các thuộc tính sau: period liên kết đến PerformancePeriodOrmEntity đại diện cho kì tính hiệu suất; các trường số cho doanh số như revenue (doanh số của đối tượng), salerRevenue (doanh số các saler thuộc về đối tượng), madeCollaboratorRevenue (doanh số các collaborator thuộc về đối tượng); các trường số lượng cuộc hẹn như appointmentCount (Tổng số cuộc hẹn), madeAppointmentCount (Số cuộc hẹn đối tượng tạo), takenOverApoointmentCount (Số cuộc hẹn đối tượng nhận); các trường về số lượng cọc như depositAgreementCount (Số lượng cọc đã tạo), activeDepositAgreementCount (Số lượng cọc có hiệu lực), cancelledDepositAgreementCount (Số lượng cọc bị hủy); trường objectType kiểu enum chỉ định kiểu đối tượng của bản ghi này gồm COMPANY, TEAM, SALER, COLLABORATOR; các trường liên kết team có liên kết nếu kiểu đối tượng làm team, saler có liên kết nếu kiểu đối tượng làm saler, collaborator có liên kết nếu kiểu đối tượng làm collaborator.

Tính revenue bằng price\*commissionPer/100 (đây là kết quả revenue). Sau đó trừ đi 80.000. Tiếp tục tính madeCollaboratorRevenue (đây là madeCollaboratorRevenue) và trừ nó khỏi tổng theo công thức sau:

- price <= 2tr5: madeCollaboratorRevenue là 270.000 và trừ số này khỏi tổng doanh số.
- 2tr5< price <= 4tr: madeCollaboratorRevenue là 450.000 và trừ số này khỏi tổng doanh số.
- 4tr< price <= 5tr: madeCollaboratorRevenue là 675.000 và trừ số này khỏi tổng doanh số.
- 5tr< price <= 6tr: madeCollaboratorRevenue là 900.000 và trừ số này khỏi tổng doanh số.
- 6tr< price <= 7tr: madeCollaboratorRevenue là 1.125.000 và trừ số này khỏi tổng doanh số.
- 7tr< price <= 8tr: madeCollaboratorRevenue là 1.350.000 và trừ số này khỏi tổng doanh số.
- 8tr< price <= 9tr: madeCollaboratorRevenue là 1.575.000 và trừ số này khỏi tổng doanh số.
- 9tr< price <= 10tr: madeCollaboratorRevenue là 1.800.000 và trừ số này khỏi tổng doanh số.
- price lớn hơn 10tr: madeCollaboratorRevenue là 2.025.000 và trừ số này khỏi tổng doanh số.

Số còn lại chia đôi cho takenOverSalerRevenue và madeSalerRevenue

Hãy chỉnh sửa lại các route theo phân cấp tính năng sau, mỗi feature cha chứa một layout riêng thêm vào top-level layout, ở mỗi page bạn cần tạo một giao diện thông báo cho người dùng rằng tính năng đang được phát triển và đề xuất người dùng chuyển về giao diện trang chủ (overview). Top-level layout nên cho phép điều hướng đến các tính năng theo nhóm, có nút thông báo và tài khoản (có thể chọn hồ sơ hoặc đăng xuất). Đối với mobile thì hiển thị như một drawer bên tay phải. Đối với máy tính thì hiển thị các nhóm tính năng ở thanh header trên. Bạn phải dùng tiếng việt cho hiển thị:

- accounting
  - employee
  - income
  - overview
  - payout
  - receivable
  - performance
- identity
  - profile
  - auth
    - login
    - change-password
  - account
  - permission
- leasing
  - agreement
  - appointment
  - tenant
  - posting
  - work-planning
- organization
  - collaborator
  - saler
  - team
- overview
- performance
  - agreement-signing
  - appointment-booking
  - overview
  - posting
- property
  - house
  - room
  - house-owner

export enum PerformancePeriodType {
MONTH = 'MONTH',
WEEK = 'WEEK',
}

export class PerformancePeriod {
code: string; // Mã kỳ đánh giá. Ví dụ: W12-2025 (tuần 12, năm 2025) hay T12-2025 (tháng 12, năm 2025)
type: PerformancePeriodType; // Sử dụng PerformancePeriodType enum ở domain layer
startDate: Date;
endDate: Date;
}

export class CompanyPerformance {
id: number;
periodCode: PerformancePeriod;
revenue?: number;
salerRevenue?: number;
collaboratorRevenue?: number;
madeBySalerAppointmentCount?: number;
madeByCollaboratorAppointmentCount?: number;
takenOverAppointmentCount?: number;
depositAgreementCount?: number;
activeDepositAgreementCount?: number;
cancelledDepositAgreementCount?: number;
objectType: PerformanceRecordObjectType;
}
export class SalerPerformance {
id: number;
periodCode: PerformancePeriod;
revenue?: number;
salerRevenue?: number;
collaboratorRevenue?: number;
madeBySalerAppointmentCount?: number;
madeByCollaboratorAppointmentCount?: number;
takenOverAppointmentCount?: number;
depositAgreementCount?: number;
activeDepositAgreementCount?: number;
cancelledDepositAgreementCount?: number;
objectType: PerformanceRecordObjectType;
salerID?: string;
}
export class CollaboratorPerformance {
id: number;
periodCode: PerformancePeriod;
revenue?: number;
salerRevenue?: number;
collaboratorRevenue?: number;
madeBySalerAppointmentCount?: number;
madeByCollaboratorAppointmentCount?: number;
takenOverAppointmentCount?: number;
depositAgreementCount?: number;
activeDepositAgreementCount?: number;
cancelledDepositAgreementCount?: number;
objectType: PerformanceRecordObjectType;
collaboratorID?: string;
}
export class SalerPerformance {
id: number;
periodCode: PerformancePeriod;
revenue?: number;
salerRevenue?: number;
collaboratorRevenue?: number;
madeBySalerAppointmentCount?: number;
madeByCollaboratorAppointmentCount?: number;
takenOverAppointmentCount?: number;
depositAgreementCount?: number;
activeDepositAgreementCount?: number;
cancelledDepositAgreementCount?: number;
objectType: PerformanceRecordObjectType;
teamID?: string;
salerID?: string;
collaboratorID?: string;
}
