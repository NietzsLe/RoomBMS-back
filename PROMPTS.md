Project này nên được phân thành nhiều module. Các module sẽ quản lý các resource sau:

1. FileModule: image
2. PropertyModule: house, room
3. LocationModule: wardUnit, districtUnit, provinceUnit, street, administrativeUnit
4. AuthModule: role, accessRule
5. DiscordModule: chatGroup
6. LeasingModule: appointment, depositAgreement, tenant
7. OrganizationModule: user, team

Bạn hãy refactor lại dự án để phân chia làm các module này. Bạn cần review qua toàn bộ project trước khi thực hiện.

Hãy tạo alias cho dự án để import dễ dàng hơn

Cập nhật các file của dự án để dùng alias

Các dto và mapper cần chuyển vào các module

0339234878
0383318202
0345200626

libs/
contracts/
organization/
dto/
user.dto.ts
team.dto.ts
facade/
organization.facade.interface.ts
adapters/
organization/
organization.facade.rest.ts

apps/
organization/
src/
user/
user.service.ts
facade/
organization.facade.ts
organization.module.ts

leasing/
src/
appointment/
appointment.service.ts

Project này nên được phân thành nhiều module. Các module sẽ quản lý các resource sau:

1. FileModule: image
2. PropertyModule: house, room
3. LocationModule: wardUnit, districtUnit, provinceUnit, street, administrativeUnit
4. AuthModule: role, accessRule
5. DiscordModule: chatGroup
6. LeasingModule: appointment, depositAgreement, tenant
7. OrganizationModule: user, team

Trước hết bạn hãy tạo một cấu trúc thư mục riêng

src/
├── modules/ # Các bounded context
│ ├── auth/
│ │ ├── models/
│ │ ├── services/
│ │ ├── facades/ # Chỉ export public API
| | ├── dtos/
| | ├── enums/
| | ├── utils/
| | └── types/
│ ├── property/
│ │ └── ...
│ └── leasing/
│ └── ...
│
├── shared/ # Tất cả thành phần dùng chung
│ ├── contracts/ # interface facade (giống SPI) export service cần thiết cho các module khác sử dụng, các facade của các module phải hiện thực các interface này để hiện thực Dependency injection
│ │ ├── user.facade.interface.ts
│ │ └── ...
│ ├── dtos/ # Chứa các dto mà được dùng ở nhiều module
│ │ └── user/
│ │ ├── user.dto.ts
│ │ └── user-view.dto.ts
│ ├── enums/ # Chứa các enums dùng chung giữa nhiều module
│ │ └── user-role.enum.ts
│ ├── types/ # Chứa type dùng chung giữa nhiều module
│ │ └── pagination-options.interface.ts
│ ├── constants/ # Chứa các giá trị hằng số (constants) được dùng chung giữa nhiều module
│ │ └── tenant-constants.ts
│ └── utils/ # Chứa các hàm tiện ích dùng chung nhiều module
│ ├── date.utils.ts
│ ├── string.utils.ts
│ └── tenant-constants.ts
│
├── libs/ # Optional: các lib chung, logger, config...
│ └── database/
│ └── connection-manager.service.ts
│
├── main.ts
└── app.module.ts

Tạo 3 model có các thông tin:
SubjectPerformance model:
subjectPerformanceID:
subjectType: Đại diện cho kiểu chủ thể của Performance này VD: Saler, Collaborator, Team, Company
salerID: liên kết đến user model, chỉ có giá trị nếu subjectType là Saler
collaboratorID: liên kết đến user model, chỉ có giá trị nếu subjectType là Collaborator
teamID: liên kết đến team model, chỉ có giá trị nếu subjectType là Team # nếu subjectType là Company thì không cần một trường liên kết thêm
periodCode: liên kết đến StatisticalPeriod model, đại diện cho khoảng thời gian mà record được tính trên
deletedAt:
createAt:
updateAt:
revenue: Doanh số trong khoảng thời gian này của subject
totalAppointmentCount: Tổng số cuộc hẹn
madeAppointmentCount: Số cuộc hẹn đã tạo (chỉ có giá trị với subjectType là Saler, Collaborator, Team)
takenOverAppointmentCount: Số cuộc hẹn đã nhận (chỉ có giá trị với subjectType là Saler, Team)
depositAgreementAccountings: Liên kết đến danh sách các phần mở rộng kế toán của các DepositAgreement liên quan, có tên là DepositAgreementAccountingOrmEntity model
-----> Trong đó subjectPerformanceID là khóa chính

StatisticalPeriod model:
periodCode: là mã của khung thời gian. Ví dụ: 07-2025, W24-2025
periodType: là kiểu của khung thời gian (month hay week)
startDate:
enđate:
-----> Trong đó periodCode là khóa chính

DepositAgreementAccountingOrmEntity là phần mở rộng cho tính năng kế toán của DepositAgreement:
depositAgreementID: liên kết đến DepositAgreement và cũng là khóa chính
totalRevenue: Doanh số tổng
madeSalerRevenue: Doanh số tính cho madeSaler
takenOverSalerRevenue: Doanh số tính cho takenOverSaler
collaboratorRevenue: Doanh số tính cho collaborator
-----> Trong đó depositAgreementID là khóa chính

SubjectPerformanceService cần có các method sau:

1. Method dùng để reset tất cả bản ghi cho SubjectPerformance từ dữ liệu về Appointment và DepositAgreement đã có. Các bước tính toán như sau:

   - Bước 1: Tính toán các PeriodCode
     - Bước 1.1: Lấy tất cả PeriodCode theo cả 2 type: month và week. Đầu tiên bạn tổng hợp tất cả PeriodCode từ Appointment Table, bằng cách xét trường appointmentTime. Sau đó tạo các StatisticalPeriod và lưu vào DB. Tiếp theo bạn tổng hợp tất cả PeriodCode từ DepositAgreement Table, bằng cách xét trường depositDeliverDate. Sau đó tạo các StatisticalPeriod và lưu vào DB.
   - Bước 2: Tính toán các SubjectPerformance từ các appointment. Bạn phải tính toán theo batch. Một batch khoảng 100 appointment record.Các

   - Bước 2: Tính toán các SubjectPerformance từ các depositAgreement

Trong DepositAgreementService cần tạo thêm method sau:

1. Method dùng để tạo các phần mở rộng kế toán cho các depositAgreement mà chưa có depositAgreementAccounting.
2. Method để sinh depostiAgreementAcoounting từ deposiAgreemtment theo phương pháp sau:

- Bạn tính tổng doanh số từ: Nếu cọc có trạng thái là hủy thì tính từ cancelFee. Nếu cọc vẫn active thì tính từ price\*commissionPer/100 + bonus
- Sau đó trừ bạn sẽ trừ các chi phí phụ như tiền admin, lấy phòng, hình ảnh là 80.000. Tuy nhiên nếu active thì mới trừ, còn cọc bị hủy thì không trừ. chi phí này lưu vào column additionCost nếu có
- Tiếp theo bạn trừ hoa hồng của Collaborator. Nếu cọc bị hủy thì không cần trừ ở bước này (Nếu madeUser của appointment liên kết có roles là "ctv" còn không thì không cần làm bước này) theo công thức sau:

  - price <= 2tr5: collaboratorRevenue là 270.000 và trừ số này khỏi tổng doanh số.
  - 2tr5< price <= 4tr: collaboratorRevenue là 450.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 4tr< price <= 5tr: collaboratorRevenue là 675.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 5tr< price <= 6tr: collaboratorRevenue là 900.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 6tr< price <= 7tr: collaboratorRevenue là 1.125.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 7tr< price <= 8tr: collaboratorRevenue là 1.350.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 8tr< price <= 9tr: collaboratorRevenue là 1.575.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - 9tr< price <= 10tr: collaboratorRevenue là 1.800.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu
  - price lớn hơn 10tr: collaboratorRevenue là 2.025.000 và trừ số này khỏi tổng doanh số. Tách 10% của collaboratorRevenue thành technologyCost, collaboratorRevenue chỉ giữ 90% của ban đầu

- Tiếp theo, từ phần doanh số còn lại chia 2 phần là lưu vào madeSalerRevenue và takenOverSalerRevenue.

Thêm các column:

- topSalerPerformance: liên kết đến các SubjectPerformance có subjectType là Saler (chỉ trong SubjectPerformance có subjectType là Team hoặc Company thì trường này mới khác null)
- topCollaboratorPerformance: liên kết đến các SubjectPerformance có subjectType là Collaborator (chỉ trong SubjectPerformance có subjectType là Saler hoặc Team hoặc Company thì trường này mới khác null)
- topTeamPerformance: liên kết đến các SubjectPerformance có subjectType là Team (chỉ trong SubjectPerformance có subjectType là Company thì trường này mới khác null)

Đọc kỹ tài liệu nestjs và typeorm thêm vào SubjectPerformanceService các method sau:

1. Method dùng để khởi tạo tất cả bản ghi cho SubjectPerformance từ dữ liệu về Appointment và DepositAgreement đã có. Các bước tính toán như sau:

- Bước 1: Tính toán StatisticalPeriod từ các appointment. Việc tính toán được thực hiện theo batch cho đến khi duyệt qua toàn bộ table. Một batch có kích thước 100 record. Ở mỗi batch duyệt qua từng appointment và thực hiện tính toán theo 2 periodType:

  - Bước 1.1: Tính toán cho periodType là month. Lặp lại việc này cho mỗi batch: - Bước 1.1.1: Tính danh sách StatisticalPeriod: - Dựa trên appointmentTime để tính PeriodCode, VD: 07-2025(01/07-31/07) đại diện cho tháng 7 năm 2025, W23-2025(02/06-08/06) đại diện cho tuần 23 của năm 2025. - Dựa trên appointmentTime để tính toán startDate, endDate của tháng hay tuần. - Tính toán xong lưu vào DB - Bước 1.1.2: Khởi tạo - Bước 1.1.2: Tính danh sách
    Lần lượt tín toán cho 4 loại subjectType liên quan đến appointment
  - Bước 1.2: Tính toán cho periodType là week

  - Bước 1.1: Tính toán StatisticalPeriod.

  Mỗi appointment tính toán cho cả 2 loại PeriodType: month, week. Các bước tính: - Dựa trên appointmentTime để tính PeriodCode, VD: 07-2025(01/07-31/07) đại diện cho tháng 7 năm 2025, W23-2025(02/06-08/06) đại diện cho tuần 23 của năm 2025. - Dựa trên appointmentTime để tính toán startDate, endDate của tháng hay tuần. - Tính toán xong lưu vào DB

  - Bước 1.2: Tính toán SubjectPerformance. Mỗi appointment tính toán cho cả 2 loại PeriodType và cả 4 loại subjectType kết hợp với nhau là 8 biến thể:
    - Bước 1.2.1: Tính toán 2 loại PeriodType

- Bước 2: Tính toán StatisticalPeriod và SubjectPerformance từ các depositAgreement Việc tính toán được thực hiện theo batch cho đến khi duyệt qua toàn bộ table. Một batch có kích thước 100 record

- Bước 1: Tính toán StatisticalPeriod từ các appointment. Việc tính toán được thực hiện theo batch cho đến khi duyệt qua toàn bộ table. Một batch có kích thước 100 record. Ở mỗi batch duyệt qua từng appointment và thực hiện tính toán theo 2 periodType:
  - Bước 1.1: Tính toán cho periodType là month. Lặp lại việc này cho mỗi batch:
    - Bước 1.1.1: Tính danh sách StatisticalPeriod:
      - Dựa trên appointmentTime để tính PeriodCode, VD: 07-2025(01/07-31/07) đại diện cho tháng 7 năm 2025, W23-2025(02/06-08/06) đại diện cho tuần 23 của năm 2025.
      - Dựa trên appointmentTime để tính toán startDate, endDate của tháng hay tuần.
  - Bước 1.2: Tính toán cho periodType là week. Tính toán tương tự như bước 1.1.
  - Bước 1.3: Lưu các kết quả tính toán vào DB
- Bước 2: Tính toán StatisticalPeriod từ các depositAgreement. Việc tính toán được thực hiện theo batch cho đến khi duyệt qua toàn bộ table. Một batch có kích thước 100 record. Ở mỗi batch duyệt qua từng depositAgreement và thực hiện tính toán theo 2 periodType:
  - Bước 2.1: Tính toán cho periodType là month. Lặp lại việc này cho mỗi batch:
    - Bước 2.1.1: Tính danh sách StatisticalPeriod:
      - Dựa trên depositDeliverDate để tính PeriodCode, VD: 07-2025(01/07-31/07) đại diện cho tháng 7 năm 2025, W23-2025(02/06-08/06) đại diện cho tuần 23 của năm 2025.
      - Dựa trên depositDeliverDate để tính toán startDate, endDate của tháng hay tuần.
  - Bước 1.2: Tính toán cho periodType là week. Tính toán tương tự như bước 2.1.
  - Bước 2.3: Lưu các kết quả tính toán vào DB
- Bước 3: Khởi tạo các bản ghi SubjectPerformance cho toàn bộ user dựa trên các StatisticalPeriod đã tính toán. Ở bước này thực hiện việc tính toán theo batch và có 2 vòng lặp: vòng lặp ngoài cùng là duyệt qua danh sách StatisticalPeriod của DB với mỗi batch 100 record. vòng lặp ở trong là duyệt qua user với mỗi batch 100 record. Lần lượt khởi tạo SubjectPerformance theo cách sau:
  - subjectType: nếu user có role là "ctv" (Collaborator) thì subjectType là Collaborator, còn không thì là Saler
  - revenue: null nếu user là Collaborator, 0 nếu là Saler
  - income: 0
  - totalAppointmentCount: 0
  - madeCollaboratorAppointmentCount: 0
  - madeSalerAppointmentCount: null nếu user là Collaborator, 0 nếu là Saler
  - takenOverSalerAppointmentCount: null nếu user là Collaborator, 0 nếu là Saler
  - topSalerPerformance: null
  - topCollaboratorPerformance: null
  - topTeamPerformance: null
  - saler: null nếu user là Collaborator, là user đang xét nếu user là Saler
  - collaborator: null nếu user là Saler, là user đang xét nếu user là Collaborator
  - team: null
  - period: là StatisticalPeriod đang xét
  - depositAgreementAccountings:[]
- Bước 4: Khởi tạo các bản ghi SubjectPerformance cho toàn bộ team dựa trên các StatisticalPeriod đã tính toán. Ở bước này thực hiện việc tính toán theo batch và có 2 vòng lặp: vòng lặp ngoài cùng là duyệt qua danh sách StatisticalPeriod của DB với mỗi batch 100 record. vòng lặp ở trong là duyệt qua team với mỗi batch 100 record. Lần lượt khởi tạo SubjectPerformance theo cách sau:
  - subjectType: là Team
  - revenue: 0
  - income: 0
  - totalAppointmentCount: 0
  - madeCollaboratorAppointmentCount: 0
  - madeSalerAppointmentCount: 0
  - takenOverSalerAppointmentCount: 0
  - topSalerPerformance: null
  - topCollaboratorPerformance: null
  - topTeamPerformance: null
  - saler: null
  - collaborator: null
  - team: là Team đang xét
  - period: là StatisticalPeriod đang xét
  - depositAgreementAccountings:[]
- Bước 5: Khởi tạo các bản ghi SubjectPerformance cho toàn bộ company dựa trên các StatisticalPeriod đã tính toán. Ở bước này thực hiện việc tính toán theo batch duyệt qua danh sách StatisticalPeriod của DB với mỗi batch 100 record. Lần lượt khởi tạo SubjectPerformance theo cách sau:
  - subjectType: là Company
  - revenue: 0
  - income: 0
  - totalAppointmentCount: 0
  - madeCollaboratorAppointmentCount: 0
  - madeSalerAppointmentCount: 0
  - takenOverSalerAppointmentCount: 0
  - topSalerPerformance: null
  - topCollaboratorPerformance: null
  - topTeamPerformance: null
  - saler: null
  - collaborator: null
  - team: null
  - period: là StatisticalPeriod đang xét
  - depositAgreementAccountings:[]

Hãy tạo một model có tên AppointmentAccounting. Model là phần mở rộng của appointment và có các column sau:

- appointmentID: liên kết đến appointment và đây cũng là khóa chính
- madeSaler: liên kết đến user
- madeTeam: liên kết đến team
- takenOverTeam: liên kết đến team

---
