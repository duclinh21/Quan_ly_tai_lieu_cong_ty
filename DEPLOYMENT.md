# Hướng dẫn Deploy DMS lên Hosting Miễn phí

## 🚀 Phương án 1: Railway (Recommended - Full Stack)

### Bước 1: Chuẩn bị
1. Đăng ký tài khoản tại [Railway.app](https://railway.app)
2. Connect với GitHub account

### Bước 2: Deploy Backend + Database
1. **Tạo New Project** trên Railway
2. **Deploy from GitHub repo**: chọn repository `Quan_ly_tai_lieu_cong_ty`
3. **Add MySQL Database**:
   - Nhấp "Add Service" → "Database" → "MySQL"
   - Railway sẽ tự tạo database và cung cấp connection string

### Bước 3: Cấu hình Environment Variables
Trong Railway dashboard, thêm các biến môi trường:

```env
DATABASE_URL=mysql://root:password@host:port/railway
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Bước 4: Deploy Frontend lên Vercel
1. Truy cập [Vercel.com](https://vercel.com)
2. **Import Git Repository**
3. **Framework Preset**: Vite
4. **Root Directory**: `frontend`
5. **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   ```

---

## 🚀 Phương án 2: Render (Alternative)

### Backend trên Render
1. Đăng ký [Render.com](https://render.com)
2. **New Web Service** → Connect GitHub
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`

### Database
- Tạo **PostgreSQL Database** miễn phí trên Render
- Cập nhật `DATABASE_URL` trong environment variables

---

## 🚀 Phương án 3: Heroku (Có phí nhưng ổn định)

### Cài đặt Heroku CLI
```bash
# Cài đặt Heroku CLI
npm install -g heroku

# Login
heroku login

# Tạo app
heroku create your-dms-app

# Add MySQL addon
heroku addons:create jawsdb:kitefin

# Deploy
git push heroku main
```

---

## 📋 Checklist Deploy

### ✅ Trước khi deploy:
- [ ] Cập nhật CORS settings trong backend
- [ ] Cấu hình production database
- [ ] Set up environment variables
- [ ] Test API endpoints
- [ ] Build frontend production

### ✅ Sau khi deploy:
- [ ] Chạy database migrations
- [ ] Seed initial data (roles, departments)
- [ ] Test authentication flow
- [ ] Test file upload functionality
- [ ] Kiểm tra HTTPS certificates

---

## 🔧 Troubleshooting

### Lỗi Database Connection
```bash
# Chạy migrations trên production
npx prisma migrate deploy
npx prisma generate
```

### Lỗi CORS
Cập nhật `backend/server.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));
```

### Lỗi File Upload
- Kiểm tra Cloudinary credentials
- Đảm bảo file size limits phù hợp với hosting platform

---

## 💰 Chi phí ước tính

| Platform | Frontend | Backend | Database | Total/tháng |
|----------|----------|---------|----------|-------------|
| Railway + Vercel | Free | $5 | Included | $5 |
| Render | Free | Free* | Free | $0 |
| Heroku | - | $7 | $9 | $16 |

*Render free tier có giới hạn 750 giờ/tháng và sleep sau 15 phút không hoạt động.

---

## 🌐 Domain tùy chỉnh (Optional)

### Miễn phí:
- Freenom (.tk, .ml, .ga)
- GitHub Student Pack (1 năm .me domain)

### Trả phí:
- Namecheap, GoDaddy (.com ~$12/năm)
- Cloudflare Domain (~$8/năm)
