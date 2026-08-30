# Hướng Dẫn Sử Dụng Google OAuth

## ✅ Đã Hoàn Thành

Tôi đã tích hợp Google OAuth vào màn hình login hiện có của bạn. Bây giờ nút "Sign in with Google" (biểu tượng Chrome) sẽ hoạt động với OAuth thật.

## 🔧 Cách Hoạt Động

1. **Màn Hình Login**: Khi chưa đăng nhập, bạn sẽ thấy màn hình login đẹp với các tùy chọn:
   - Đăng nhập bằng email/password (mock)
   - **Đăng nhập bằng Google** (OAuth thật) ← Nút này đã được tích hợp!
   - Đăng nhập bằng GitHub (coming soon)
   - Đăng nhập bằng Phone (coming soon)

2. **Khi Click Nút Google**:
   - Frontend chuyển hướng đến: `http://localhost:3001/auth/google`
   - Backend xử lý OAuth với Google
   - Google hiển thị màn hình chọn tài khoản
   - Sau khi chọn, Google redirect về backend
   - Backend tạo JWT token và redirect về frontend với token
   - Frontend tự động lưu token và đăng nhập

## 🚀 Cách Test

### Bước 1: Truy cập ứng dụng
```
http://localhost:3000
```

### Bước 2: Click nút Google
Trên màn hình login, tìm phần "Or continue with" và click vào nút có biểu tượng Chrome (nút đầu tiên trong 3 nút social login).

### Bước 3: Chọn tài khoản Google
Google sẽ hiển thị màn hình chọn tài khoản. Chọn tài khoản bạn muốn sử dụng.

### Bước 4: Tự động đăng nhập
Sau khi Google xác thực, bạn sẽ được tự động đăng nhập và chuyển đến dashboard.

## 🔍 Kiểm Tra Kết Nối

### 1. Kiểm tra Backend logs
```bash
docker-compose logs -f backend
```

Bạn sẽ thấy:
- `GET /auth/google` - Khi click nút Google
- `GET /auth/google/callback` - Khi Google redirect về
- Socket.IO connection - Khi đăng nhập thành công

### 2. Kiểm tra Browser DevTools
- **Network tab**: Xem request đến `/auth/google`
- **Application tab → Local Storage**: Xem `auth_token` và `auth_user`
- **Network tab → WS**: Xem Socket.IO connection với auth token

## ⚠️ Lưu Ý Quan Trọng

### Google OAuth Credentials
Đảm bảo bạn đã cấu hình đúng trong Google Cloud Console:

1. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3001
   ```

2. **Authorized redirect URIs**:
   ```
   http://localhost:3001/auth/google/callback
   ```

3. **Client ID** trong file `.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=951771661102-vckfceo5k4r9cf2t4uovtqgohbhcd2vh.apps.googleusercontent.com
   ```

4. **Client Secret** trong `backend/.env` và root `.env`:
   ```
   GOOGLE_CLIENT_SECRET=your-secret-here
   ```

## 🐛 Troubleshooting

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại Authorized redirect URIs trong Google Cloud Console
- Phải là chính xác: `http://localhost:3001/auth/google/callback`

### Không redirect về frontend
- Kiểm tra `FRONTEND_URL` trong `backend/.env` = `http://localhost:3000`
- Kiểm tra backend logs xem có lỗi không

### Token không được lưu
- Mở DevTools → Console xem có lỗi JavaScript không
- Kiểm tra Network tab xem callback có trả về token không

### Socket.IO không kết nối
- Kiểm tra token đã được lưu trong localStorage chưa
- Xem backend logs có nhận được Socket.IO connection không

## 📝 Luồng Hoàn Chỉnh

```
1. User click "Google" button
   ↓
2. Frontend: window.location.href = 'http://localhost:3001/auth/google'
   ↓
3. Backend: Redirect to Google OAuth
   ↓
4. Google: User chọn tài khoản
   ↓
5. Google: Redirect to http://localhost:3001/auth/google/callback
   ↓
6. Backend: 
   - Validate với Google
   - Tạo/update user trong database
   - Generate JWT token
   - Redirect to http://localhost:3000/?token=xxx&user=xxx
   ↓
7. Frontend (main.tsx):
   - Parse URL parameters
   - Call login(token, user)
   - Lưu vào localStorage
   - Connect Socket.IO với token
   - Clean up URL
   ↓
8. App.tsx: Hiển thị dashboard (user đã authenticated)
```

## ✨ Tính Năng Đã Tích Hợp

- ✅ Google OAuth button trong màn hình login hiện có
- ✅ Tự động xử lý OAuth callback
- ✅ Lưu token vào localStorage
- ✅ Tự động kết nối Socket.IO với authentication
- ✅ Giữ nguyên UI/UX của màn hình login gốc
- ✅ Không cần tạo màn hình login mới

## 🎯 Kết Quả

Bây giờ bạn có thể:
1. Sử dụng màn hình login đẹp có sẵn
2. Click nút Google để đăng nhập thật
3. Tự động được chuyển đến dashboard sau khi đăng nhập
4. Token được lưu và Socket.IO tự động kết nối
5. Refresh page vẫn giữ trạng thái đăng nhập

Hãy thử test ngay bằng cách truy cập http://localhost:3000 và click nút Google! 🚀
