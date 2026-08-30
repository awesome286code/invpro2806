GitHub Actions không thể tự động đăng nhập được.

Cách tốt nhất và an toàn nhất là Tạo một key mới chuyên dụng cho GitHub Actions không có mật khẩu.

# Bạn hãy chạy 3 lệnh sau trên Terminal Local của bạn:

# Tạo key mới (lưu ý -N "" nghĩa là không mật khẩu):
bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions -N ""

# Copy key mới này lên VPS:
bash
ssh-copy-id -i ~/.ssh/github_actions.pub root@103.200.20.141

# Xem nội dung key private để copy vào GitHub:
bash
cat ~/.ssh/github_actions   

# Sau đó:

# Copy toàn bộ nội dung lệnh cat vừa rồi.

# Vào GitHub Secrets, cập nhật lại VPS_SSH_KEY.

# Re-run job lần nữa là sẽ thành công!