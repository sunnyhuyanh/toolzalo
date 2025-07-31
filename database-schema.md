# Database Schema - Zalo Group Automation

## Overview
Đây là cấu trúc database được đề xuất cho hệ thống quản lý người dùng Zalo Group Automation.

## Tables

### 1. users
Bảng lưu thông tin người dùng hệ thống

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| username | VARCHAR(50) | Tên đăng nhập | UNIQUE, NOT NULL |
| password | VARCHAR(255) | Mật khẩu (đã hash) | NOT NULL |
| full_name | VARCHAR(100) | Họ tên đầy đủ | NULL |
| status | ENUM('active', 'blocked') | Trạng thái tài khoản | DEFAULT 'active' |
| is_admin | BOOLEAN | Có phải admin không | DEFAULT FALSE |
| created_at | TIMESTAMP | Thời gian tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Thời gian cập nhật | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

### 2. user_webhooks
Bảng lưu cấu hình webhook cho từng user

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| user_id | UUID/INT | Foreign key to users | FOREIGN KEY, NOT NULL |
| scan_webhook | VARCHAR(500) | Webhook quét nhóm | NOT NULL |
| send_webhook | VARCHAR(500) | Webhook gửi tin nhắn | NOT NULL |
| invite_webhook | VARCHAR(500) | Webhook mời thành viên | NOT NULL |
| created_at | TIMESTAMP | Thời gian tạo | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | Thời gian cập nhật | DEFAULT CURRENT_TIMESTAMP ON UPDATE |

### 3. user_nicks
Bảng lưu danh sách nick Zalo của từng user

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| user_id | UUID/INT | Foreign key to users | FOREIGN KEY, NOT NULL |
| nick_name | VARCHAR(100) | Tên nick Zalo | NOT NULL |
| is_active | BOOLEAN | Nick còn hoạt động không | DEFAULT TRUE |
| created_at | TIMESTAMP | Thời gian tạo | DEFAULT CURRENT_TIMESTAMP |

### 4. scheduled_posts
Bảng lưu các bài đăng đã lên lịch

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| user_id | UUID/INT | Foreign key to users | FOREIGN KEY, NOT NULL |
| content | TEXT | Nội dung bài đăng | NOT NULL |
| images | JSON | Danh sách ảnh (base64) | NULL |
| image_count | INT | Số lượng ảnh | DEFAULT 0 |
| groups | JSON | Danh sách nhóm sẽ đăng | NOT NULL |
| schedule_type | ENUM('once', 'weekly') | Loại lịch đăng | NOT NULL |
| schedule_data | JSON | Dữ liệu lịch đăng | NOT NULL |
| status | ENUM('pending', 'completed', 'failed') | Trạng thái | DEFAULT 'pending' |
| nick_name | VARCHAR(100) | Nick Zalo sẽ đăng | NOT NULL |
| created_at | TIMESTAMP | Thời gian tạo | DEFAULT CURRENT_TIMESTAMP |

### 5. saved_posts
Bảng lưu các bài viết để tái sử dụng

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| user_id | UUID/INT | Foreign key to users | FOREIGN KEY, NOT NULL |
| content | TEXT | Nội dung bài viết | NOT NULL |
| images | JSON | Danh sách ảnh (base64) | NULL |
| image_count | INT | Số lượng ảnh | DEFAULT 0 |
| nick_name | VARCHAR(100) | Nick Zalo đã tạo | NOT NULL |
| created_at | TIMESTAMP | Thời gian tạo | DEFAULT CURRENT_TIMESTAMP |

### 6. activity_logs
Bảng lưu lịch sử hoạt động

| Column | Type | Description | Constraints |
|--------|------|-------------|-------------|
| id | UUID/INT | Primary key | PRIMARY KEY, AUTO_INCREMENT |
| user_id | UUID/INT | Foreign key to users | FOREIGN KEY, NOT NULL |
| action | VARCHAR(100) | Loại hành động | NOT NULL |
| details | JSON | Chi tiết hành động | NULL |
| ip_address | VARCHAR(45) | IP address | NULL |
| user_agent | VARCHAR(500) | User agent | NULL |
| created_at | TIMESTAMP | Thời gian | DEFAULT CURRENT_TIMESTAMP |

## Indexes

```sql
-- Users table
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);

-- User webhooks
CREATE INDEX idx_user_webhooks_user_id ON user_webhooks(user_id);

-- User nicks
CREATE INDEX idx_user_nicks_user_id ON user_nicks(user_id);
CREATE INDEX idx_user_nicks_active ON user_nicks(is_active);

-- Scheduled posts
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);

-- Saved posts
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);

-- Activity logs
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);
```

## Sample Data

```sql
-- Insert admin user
INSERT INTO users (username, password, full_name, status, is_admin) 
VALUES ('admin', '$2a$10$...', 'Administrator', 'active', TRUE);

-- Insert sample user
INSERT INTO users (username, password, full_name, status) 
VALUES ('demo', '$2a$10$...', 'Demo User', 'active');

-- Insert webhooks for user
INSERT INTO user_webhooks (user_id, scan_webhook, send_webhook, invite_webhook)
VALUES (2, '/api/webhook/zalo-automation', '/api/webhook/zalo-sent-text-image', '/api/webhook/zalo-invite-member');

-- Insert nicks for user
INSERT INTO user_nicks (user_id, nick_name) 
VALUES 
  (2, 'test'),
  (2, 'Dương Nguyễn'),
  (2, 'Đức Phòng'),
  (2, 'Khánh Duy');
```

## Notes

1. **Password Security**: Mật khẩu phải được hash bằng bcrypt hoặc argon2 trước khi lưu
2. **API Keys**: Có thể thêm bảng api_keys để quản lý API authentication
3. **Rate Limiting**: Nên thêm cơ chế rate limiting cho các webhook
4. **Backup**: Nên backup database định kỳ, đặc biệt là bảng scheduled_posts
5. **Image Storage**: Trong production, nên lưu ảnh vào object storage (S3, etc.) thay vì base64 trong database 