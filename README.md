# S3-MRS: Smart Study Space Management and Reservation System

## Tổng quan (Overview)

S3-MRS là hệ thống quản lý và đặt phòng học thông minh, cho phép sinh viên và giảng viên dễ dàng đặt chỗ phòng học cá nhân/nhóm, theo dõi trạng thái phòng học theo thời gian thực, check-in/check-out qua mã QR, và cung cấp báo cáo thống kê chi tiết cho ban quản lý.

_S3-MRS is a smart study space management and reservation system that allows students and lecturers to easily book individual/group study rooms, monitor real-time room status, check-in/check-out via QR codes, and provides detailed statistical reports for administrators._

## Tính năng chính (Key Features)

### Dành cho Sinh viên - Giảng viên

- **Đặt chỗ phòng học**: Tìm kiếm và đặt phòng trống theo khung giờ, kiểm tra trùng lịch
- **Quản lý đặt phòng**: Xem danh sách, hủy, hoặc chỉnh sửa đặt phòng
- **Check-in/Check-out**: Quét mã QR hoặc thực hiện qua ứng dụng
- **Nhận thông báo**: Nhắc nhở trước giờ sử dụng, thông báo khi sắp hết giờ
- **Tự động hủy phòng**: Hệ thống tự động hủy nếu không check-in sau 30 phút

### Dành cho Ban quản lý

- **Quản lý phòng học**: Thêm, xóa, cập nhật thông tin phòng và thiết bị
- **Báo cáo thống kê**: Phân tích lượt đặt, tỷ lệ sử dụng, khung giờ cao điểm
- **Quản lý quyền đặt phòng**: Phân quyền, ưu tiên cho các nhóm người dùng
- **Quản lý đặt phòng**: Tìm kiếm, lọc, cưỡng chế hủy đặt phòng

### Dành cho IT và Kỹ thuật viên

- **Quản lý tài khoản**: Tạo/sửa/xóa tài khoản nội bộ, phân quyền
- **Giám sát hệ thống**: Theo dõi trạng thái thiết bị, cảnh báo lỗi

## Công nghệ sử dụng (Technology Stack)

### Backend

- **Node.js** + **Express.js**: RESTful API framework
- **Sequelize ORM**: Tương tác với cơ sở dữ liệu
- **JWT**: Xác thực và phân quyền người dùng
- **Scheduler**: Tự động hóa các tác vụ (hủy đặt phòng, check-out)

### Frontend

- **React**: Xây dựng giao diện người dùng
- **TypeScript**: Đảm bảo type-safety
- **Tailwind CSS**: Styling framework
- **Recharts**: Hiển thị biểu đồ, báo cáo thống kê
- **Vite**: Công cụ build hiệu suất cao

### Database

- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ

### Xác thực (Authentication)

- **HCMUT_SSO**: Single Sign-On tích hợp hệ thống của trường
- **OAuth2/OpenID**: Chuẩn xác thực

## Cấu trúc thư mục (Project Structure)

```
S3-MRS/
├── backend/                 # Backend source code
│   ├── src/                 # Source files
│   │   ├── config/          # Configuration files (database, etc.)
│   │   ├── controllers/     # API controllers
│   │   ├── middleware/      # Middleware functions
│   │   ├── models/          # Database models
│   │   ├── repositories/    # Data access layer
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── test/                # Test files
│
├── frontend/                # Frontend source code
│   ├── src/                 # Source files
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API services
│   │   └── styles/          # CSS/Tailwind styles
│   └── public/              # Static files
│
└── docs/                    # Documentation
```

## Hướng dẫn cài đặt (Installation)

### Yêu cầu (Requirements)

- Node.js (v14+)
- MySQL (v5.7+)
- npm/yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Cấu hình thông tin database và JWT trong file .env
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Cấu hình API endpoint trong file .env
npm run dev
```

## Thông tin nhóm phát triển (Development Team)

**Giảng viên hướng dẫn**: Trần Trương Tuấn Phát

**Nhóm**:

- Doãn Phương Hùng Cường - 2310381
- Nguyễn Thanh Liêm - 2111637
- Nguyễn Tiến Đăng Khoa - 1832026
- Trương Thành Tâm - 2213045
- Võ Lê Sinh - 2212927
- Nguyễn Hà Sơn - 2212942

## Giấy phép (License)

MIT License
