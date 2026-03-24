# 🐾 Pet Web - Nền Tảng Quản Lý Thú Cưng Toàn Diện

<div align="center">

![Pet Web Banner](https://img.shields.io/badge/Pet%20Web-v1.0.0-brightgreen?style=for-the-badge)
![.NET](https://img.shields.io/badge/.NET-8.0-purple?style=for-the-badge&logo=dotnet)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red?style=for-the-badge&logo=microsoftsqlserver)

**Pet Web** là nền tảng web quản lý thú cưng toàn diện, cung cấp dịch vụ đặt lịch hẹn, mua sắm sản phẩm thú cưng, theo dõi hồ sơ sức khỏe và nhiều tính năng tiện ích khác.

</div>

---

## 📋 Mục Lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)
- [Cấu hình môi trường](#-cấu-hình-môi-trường)
- [Chạy dự án](#-chạy-dự-án)
- [API Documentation](#-api-documentation)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Đóng góp](#-đóng-góp)

---

## 🌟 Giới thiệu

**Pet Web** là một ứng dụng web full-stack được xây dựng để phục vụ nhu cầu quản lý và chăm sóc thú cưng. Hệ thống hỗ trợ ba vai trò người dùng chính:

| Vai trò | Mô tả |
|---------|-------|
| **Khách hàng** | Đăng ký, quản lý thú cưng, đặt lịch hẹn, mua sắm, xem hồ sơ sức khỏe |
| **Nhân viên** | Quản lý lịch làm việc, xử lý đơn hàng, theo dõi cuộc hẹn |
| **Admin** | Toàn quyền quản lý hệ thống, người dùng, dịch vụ, sản phẩm |

---

## ✨ Tính Năng Nổi Bật

### 👤 Xác thực & Tài khoản
- Đăng ký / Đăng nhập bằng email hoặc Google OAuth
- Quên mật khẩu, reset mật khẩu qua email
- Quản lý hồ sơ cá nhân và ảnh đại diện

### 🐶 Quản lý Thú Cưng
- Thêm, sửa, xóa thông tin thú cưng
- Quản lý ảnh thú cưng
- Theo dõi lịch sử tiêm phòng
- Xem hồ sơ bệnh án điện tử

### 📅 Đặt Lịch Hẹn
- Đặt lịch hẹn theo dịch vụ, nhân viên, ngày giờ
- Theo dõi trạng thái cuộc hẹn (Chờ xác nhận → Đã xác nhận → Hoàn thành)
- Nhân viên và Admin có thể cập nhật kết quả sau khi hoàn thành dịch vụ
- Nhắc nhở lịch hẹn tự động qua email

### 🛒 Mua Sắm
- Duyệt danh mục sản phẩm thú cưng
- Giỏ hàng và thanh toán
- Lịch sử đơn hàng
- Đánh giá sản phẩm

### 💆 Dịch Vụ
- Xem danh sách dịch vụ (tắm, cắt tỉa, khám bệnh, v.v.)
- Bộ lọc theo loại dịch vụ và giá
- Đánh giá và nhận xét dịch vụ

### 📰 Blog
- Đọc bài viết về chăm sóc thú cưng
- Bình luận và tương tác

### 💬 Chat Hỗ trợ
- Chatbot AI tích hợp hỗ trợ 24/7
- Thông báo real-time qua SignalR

### 🔧 Quản Trị (Admin/Staff)
- Dashboard tổng quan
- Quản lý người dùng, nhân viên
- Quản lý dịch vụ và sản phẩm
- Quản lý lịch làm việc nhân viên
- Thống kê đặt lịch và doanh thu

---

## 🛠 Công Nghệ Sử Dụng

### Backend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| ASP.NET Core | 8.0 | Web API Framework |
| Entity Framework Core | 8.x | ORM |
| SQL Server | 2019+ | Database |
| ASP.NET Core Identity | 8.x | Authentication & Authorization |
| JWT Bearer | 8.x | Token-based Auth |
| SignalR | 8.x | Real-time Communication |
| MailKit / SmtpClient | - | Email Service |
| Google OAuth 2.0 | - | Social Login |

### Frontend
| Công nghệ | Phiên bản | Mô tả |
|-----------|-----------|-------|
| React | 18.x | UI Framework |
| React Router DOM | 6.x | Client-side Routing |
| Axios | - | HTTP Client |
| @microsoft/signalr | - | Real-time Client |
| Bootstrap / CSS Modules | - | Styling |

---

## 📁 Cấu Trúc Dự Án

```
Pet-Web/
├── BE_PetWeb_API/                    # Backend - ASP.NET Core Web API
│   └── BE_PetWeb_API/
│       ├── Controllers/              # API Controllers
│       │   ├── AppointmentController.cs
│       │   ├── AuthController.cs
│       │   ├── BlogPostsController.cs
│       │   ├── MedicalRecordsController.cs
│       │   ├── OrdersController.cs
│       │   ├── PetsController.cs
│       │   ├── ProductsController.cs
│       │   ├── ServicesController.cs
│       │   ├── StaffController.cs
│       │   ├── UserController.cs
│       │   └── ...
│       ├── DTOs/                     # Data Transfer Objects
│       ├── Extensions/               # Service Extensions
│       ├── Hubs/                     # SignalR Hubs
│       ├── Middlewares/              # Custom Middlewares
│       ├── Models/                   # Entity Models & DbContext
│       ├── Services/                 # Business Logic Layer
│       │   ├── Interfaces/
│       │   └── Implementations/
│       ├── appsettings.example.json  # Cấu hình mẫu (copy → appsettings.json)
│       └── Program.cs
│
├── pet_web/                          # Frontend - React.js
│   ├── src/
│   │   ├── api/                      # API call helpers
│   │   ├── components/               # Reusable Components
│   │   │   ├── admin/
│   │   │   ├── appointment/
│   │   │   ├── auth/
│   │   │   ├── blog/
│   │   │   ├── common/
│   │   │   ├── pets/
│   │   │   └── profile/
│   │   ├── config/                   # App configuration
│   │   ├── context/                  # React Context (Auth, Cart, ...)
│   │   ├── hooks/                    # Custom Hooks
│   │   ├── pages/                    # Page Components
│   │   │   ├── admin/
│   │   │   ├── blog/
│   │   │   ├── pets/
│   │   │   ├── HomePage.js
│   │   │   ├── ProductsPage.js
│   │   │   ├── ServicesPage.js
│   │   │   ├── CartPage.js
│   │   │   ├── CheckoutPage.js
│   │   │   └── ...
│   │   ├── services/                 # Frontend service layer
│   │   └── utils/                    # Utility functions
│   ├── .env.example                  # Cấu hình môi trường mẫu
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 💻 Yêu Cầu Hệ Thống

- **OS**: Windows 10/11, macOS, Linux
- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **.NET SDK**: 8.0
- **SQL Server**: 2019 hoặc mới hơn (hoặc SQL Server Express)
- **Visual Studio 2022** hoặc **VS Code** (tùy chọn)

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository

```bash
git clone https://github.com/VanDat-nv14/Pet-Web.git
cd Pet-Web
```

### 2. Cài đặt Backend

```bash
cd BE_PetWeb_API/BE_PetWeb_API
```

**Sao chép file cấu hình:**
```bash
# Windows
copy appsettings.example.json appsettings.json

# macOS / Linux
cp appsettings.example.json appsettings.json
```

Mở `appsettings.json` và điền các thông tin cần thiết (xem phần [Cấu hình môi trường](#-cấu-hình-môi-trường)).

**Restore packages:**
```bash
dotnet restore
```

**Tạo Database (chạy migrations nếu có, hoặc dùng script SQL):**
```bash
dotnet ef database update
```

> Nếu không dùng EF Migrations, import file SQL trong thư mục `Scripts/` vào SQL Server.

### 3. Cài đặt Frontend

```bash
cd pet_web
npm install
```

**Sao chép file cấu hình:**
```bash
# Windows
copy .env.example .env.development

# macOS / Linux
cp .env.example .env.development
```

Mở `.env.development` và điền URL API backend.

---

## ⚙️ Cấu Hình Môi Trường

### Backend: `appsettings.json`

```json
{
    "Authentication": {
        "Google": {
            "ClientId": "YOUR_GOOGLE_CLIENT_ID",
            "ClientSecret": "YOUR_GOOGLE_CLIENT_SECRET"
        }
    },
    "EmailSettings": {
        "SmtpServer": "smtp.gmail.com",
        "SmtpPort": 587,
        "Username": "your_email@gmail.com",
        "Password": "YOUR_GMAIL_APP_PASSWORD",
        "FromEmail": "your_email@gmail.com",
        "FromName": "Pet Web Services"
    },
    "ConnectionStrings": {
        "PetWebConnection": "Server=YOUR_SERVER;Database=PetWeb;Integrated Security=True;..."
    },
    "JWT": {
        "Key": "YOUR_SECRET_KEY_MIN_32_CHARS",
        "Issuer": "PetWebAPI",
        "Audience": "PetWebClient",
        "DurationInMinutes": 60
    }
}
```

> **Lưu ý quan trọng:**
> - `Google ClientId/Secret`: Lấy từ [Google Cloud Console](https://console.cloud.google.com/)
> - `Gmail App Password`: Bật 2FA cho Gmail, sau đó tạo App Password tại [myaccount.google.com](https://myaccount.google.com/apppasswords)
> - `JWT Key`: Chuỗi bí mật, tối thiểu 32 ký tự
> - `ConnectionStrings`: Thay `YOUR_SERVER` bằng tên SQL Server instance của bạn

### Frontend: `.env.development`

```env
REACT_APP_API_URL=http://localhost:5181/api
```

---

## ▶️ Chạy Dự Án

### Chạy Backend

```bash
cd BE_PetWeb_API/BE_PetWeb_API
dotnet run
```

API sẽ chạy tại:
- HTTP: `http://localhost:5181`
- HTTPS: `https://localhost:7164`
- Swagger UI: `http://localhost:5181/swagger`

### Chạy Frontend

```bash
cd pet_web
npm start
```

Ứng dụng sẽ chạy tại: `http://localhost:3000`

---

## 📖 API Documentation

Khi backend đang chạy, truy cập Swagger UI để xem toàn bộ API:

```
http://localhost:5181/swagger
```

### Các nhóm API chính:

| Nhóm | Endpoint | Mô tả |
|------|----------|-------|
| Auth | `/api/auth` | Đăng ký, đăng nhập, Google OAuth |
| Users | `/api/user` | Quản lý người dùng |
| Pets | `/api/pets` | Quản lý thú cưng |
| Appointments | `/api/appointment` | Đặt lịch hẹn |
| Services | `/api/services` | Dịch vụ |
| Products | `/api/products` | Sản phẩm |
| Orders | `/api/orders` | Đơn hàng |
| Medical Records | `/api/medicalrecords` | Hồ sơ bệnh án |
| Blog | `/api/blogposts` | Bài viết |
| Staff | `/api/staff` | Nhân viên |
| Calendar | `/api/calendar` | Lịch làm việc |
| Reminders | `/api/reminders` | Nhắc nhở |
| Password | `/api/password` | Đổi/Reset mật khẩu |

---

## 👤 Tài Khoản Mặc Định

Sau khi setup, tài khoản Admin được tạo bằng endpoint:

```
POST /api/adminsetup/create-admin
```

Hoặc chạy script PowerShell (xem hướng dẫn riêng).

> **Lưu ý**: Thay đổi mật khẩu mặc định ngay sau khi đăng nhập lần đầu.

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
3. Commit thay đổi: `git commit -m "feat: thêm tính năng X"`
4. Push lên branch: `git push origin feature/ten-tinh-nang`
5. Tạo Pull Request

---

## 📄 License

Dự án được phát triển cho mục đích học tập và nghiên cứu.

---

<div align="center">
Made with ❤️ by the Pet Web Team
</div>
