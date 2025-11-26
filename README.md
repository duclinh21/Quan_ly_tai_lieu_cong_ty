# Document Management System (DMS)

Hệ thống quản lý tài liệu số với các tính năng quản lý tập trung, kiểm soát phiên bản, quản lý quyền truy cập và audit trail.

## Công nghệ sử dụng

### Frontend
- React.js 18
- Ant Design 5
- Tailwind CSS 3
- Vite
- React Router DOM
- Axios

### Backend
- Express.js
- Prisma ORM
- MySQL
- Cloudinary (File Storage)
- JWT Authentication
- bcryptjs

## Cấu trúc dự án

```
btlN11/
├── backend/
│   ├── config/          # Cấu hình database, cloudinary
│   ├── controllers/      # Controllers (MVC)
│   ├── middleware/       # Authentication, upload middleware
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   ├── prisma/           # Prisma schema
│   └── server.js         # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # Context API
│   │   ├── pages/        # Page components
│   │   └── App.jsx       # Main app component
│   └── package.json
└── README.md
```

## Cài đặt và chạy

### Backend

1. Di chuyển vào thư mục backend:
```bash
cd backend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

4. Cấu hình `.env`:
```env
DATABASE_URL="mysql://username:password@localhost:3306/dms_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
PORT=8081
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

5. Tạo database và chạy migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

6. Chạy server:
```bash
npm run dev
```

### Frontend

1. Di chuyển vào thư mục frontend:
```bash
cd frontend
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

## Format API Keys

### Cloudinary Keys

Đăng ký tài khoản tại [Cloudinary](https://cloudinary.com/) và lấy các thông tin sau:

- **CLOUDINARY_CLOUD_NAME**: Tên cloud của bạn (ví dụ: `my-cloud-name`)
- **CLOUDINARY_API_KEY**: API Key từ dashboard (ví dụ: `123456789012345`)
- **CLOUDINARY_API_SECRET**: API Secret từ dashboard (ví dụ: `abcdefghijklmnopqrstuvwxyz123456`)

### JWT Secret

Tạo một chuỗi ngẫu nhiên mạnh cho JWT_SECRET (ít nhất 32 ký tự):
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
```

### Database URL

Format chuẩn cho MySQL:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name?schema=public"
```

Ví dụ:
```env
DATABASE_URL="mysql://root:password123@localhost:3306/dms_db?schema=public"
```

## Tính năng chính

1. **Quản lý Tài liệu Tập trung**: Lưu trữ và quản lý tất cả tài liệu tại một nơi
2. **Phân loại & Cấu trúc**: Tổ chức theo danh mục và phòng ban
3. **Kiểm soát Phiên bản**: Quản lý lịch sử phiên bản và khôi phục
4. **Quản lý Quyền truy cập**: Phân quyền chi tiết theo người dùng, vai trò, phòng ban
5. **Check-in/Check-out**: Ngăn chặn chỉnh sửa đồng thời
6. **Audit Trail**: Ghi lại mọi hành động quan trọng
7. **Tìm kiếm Nâng cao**: Tìm kiếm theo tiêu đề, nội dung, thẻ

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Documents
- `GET /api/documents` - Lấy danh sách tài liệu
- `GET /api/documents/:id` - Lấy chi tiết tài liệu
- `POST /api/documents` - Tải lên tài liệu
- `PUT /api/documents/:id` - Cập nhật tài liệu
- `DELETE /api/documents/:id` - Xóa tài liệu

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Departments
- `GET /api/departments` - Lấy danh sách phòng ban
- `POST /api/departments` - Tạo phòng ban
- `PUT /api/departments/:id` - Cập nhật phòng ban
- `DELETE /api/departments/:id` - Xóa phòng ban

### Versions
- `GET /api/versions/document/:documentId` - Lấy lịch sử phiên bản
- `POST /api/versions/document/:documentId` - Tạo phiên bản mới
- `POST /api/versions/:id/restore` - Khôi phục phiên bản

### Checkouts
- `POST /api/checkouts/:documentId/checkout` - Khóa tài liệu
- `POST /api/checkouts/:documentId/checkin` - Mở khóa tài liệu
- `GET /api/checkouts/:documentId/status` - Kiểm tra trạng thái

### Audit Logs
- `GET /api/audit-logs` - Lấy nhật ký kiểm toán

## Database Schema

Hệ thống sử dụng 10 bảng chính:
1. Users - Người dùng
2. Roles - Vai trò/Chức vụ
3. Documents - Tài liệu/Tệp tin
4. Categories - Danh mục Tài liệu
5. Departments - Phòng ban/Bộ phận
6. Permissions - Quyền truy cập
7. Versions - Lịch sử Phiên bản
8. Checkouts - Khóa chỉnh sửa
9. AuditLogs - Nhật ký Kiểm toán
10. Tags - Thẻ/Từ khóa

## Deployment

### GitHub Repository
Repository này được lưu trữ tại: `https://github.com/duclinh21/Quan_ly_tai_lieu_cong_ty`

### Clone Repository
```bash
git clone https://github.com/duclinh21/Quan_ly_tai_lieu_cong_ty.git
cd Quan_ly_tai_lieu_cong_ty
```

### Cài đặt Dependencies
```bash
# Cài đặt dependencies cho cả frontend và backend
npm install

# Hoặc cài đặt riêng từng phần
cd backend && npm install
cd ../frontend && npm install
```

## Contributing

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## License

MIT

