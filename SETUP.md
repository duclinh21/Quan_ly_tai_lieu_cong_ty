# Hướng dẫn Cấu hình và Chạy DMS

## Bước 1: Cấu hình Database

1. Tạo database MySQL:
```sql
CREATE DATABASE dms_db;
```

2. Cập nhật file `backend/.env` với thông tin database của bạn:
```env
DATABASE_URL="mysql://root:your_password@localhost:3306/dms_db?schema=public"
```

Thay `root` và `your_password` bằng username và password MySQL của bạn.

## Bước 2: Cấu hình Cloudinary (Tùy chọn - cho file storage)

1. Đăng ký tài khoản tại https://cloudinary.com/
2. Lấy thông tin từ Dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. Cập nhật trong `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## Bước 3: Cấu hình JWT Secret

Tạo một chuỗi bí mật ngẫu nhiên (ít nhất 32 ký tự) và cập nhật trong `backend/.env`:
```env
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
```

## Bước 4: Chạy Migrations

Sau khi cấu hình database, chạy migrations:

```bash
cd backend
npx prisma migrate dev --name init
```

## Bước 5: Chạy Servers

### Backend (Port 8081):
```bash
cd backend
npm run dev
```

### Frontend (Port 3000):
```bash
cd frontend
npm run dev
```

## Truy cập ứng dụng

- Frontend: http://localhost:3000
- Backend API: http://localhost:8081/api

## Tạo tài khoản đầu tiên

Bạn cần tạo Roles trước khi đăng ký user. Có thể sử dụng Prisma Studio:

```bash
cd backend
npx prisma studio
```

Hoặc chạy SQL trực tiếp:
```sql
INSERT INTO roles (id, name, description, created_at, updated_at) 
VALUES (UUID(), 'admin', 'Administrator', NOW(), NOW());
INSERT INTO roles (id, name, description, created_at, updated_at) 
VALUES (UUID(), 'user', 'Regular User', NOW(), NOW());
```

## Lưu ý

- Đảm bảo MySQL đang chạy
- Đảm bảo port 3000 và 8081 không bị chiếm dụng
- Nếu không dùng Cloudinary, bạn có thể tạm thời bỏ qua, nhưng tính năng upload file sẽ không hoạt động

