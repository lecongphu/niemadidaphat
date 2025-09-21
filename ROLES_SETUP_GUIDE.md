# Hướng dẫn Setup Bảng Roles

## Vấn đề
Lỗi `PGRST200` xuất hiện vì `authUtils.ts` đang cố gắng join với bảng `roles` không tồn tại.

## Giải pháp
Cần tạo bảng `roles` và cập nhật `user_roles` để có foreign key relationship.

## Các bước thực hiện

### 1. Mở Supabase Dashboard
- Truy cập: https://supabase.com/dashboard
- Chọn project của bạn
- Vào **SQL Editor**

### 2. Chạy SQL Script
Copy và paste script sau vào SQL Editor và chạy:

```sql
-- ================================================
-- SIMPLE MIGRATION SCRIPT
-- ================================================

-- 1. Tạo bảng roles (nếu chưa có)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_role_name CHECK (name ~ '^[a-z_]+$')
);

-- 2. Thêm cột role_id vào user_roles (nếu chưa có)
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- 3. Tạo indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_display_name ON roles(display_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 4. Thêm RLS policies
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
CREATE POLICY "Anyone can view roles" ON roles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage all roles" ON roles;
CREATE POLICY "Service role can manage all roles" ON roles
    FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can manage all roles" ON roles;
CREATE POLICY "Admins can manage all roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- 5. Thêm trigger cho updated_at
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Thêm dữ liệu mặc định
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access with all permissions'),
('moderator', 'Moderator', 'Content moderation and user management'),
('user', 'User', 'Standard user with basic permissions'),
('guest', 'Guest', 'Limited access for unregistered users')
ON CONFLICT (name) DO NOTHING;

-- 7. Cập nhật user_roles hiện có
UPDATE user_roles 
SET role_id = (
    SELECT id FROM roles 
    WHERE roles.name = user_roles.role
)
WHERE role_id IS NULL;

-- 8. Kiểm tra kết quả
SELECT 'Roles created' as status, COUNT(*) as count FROM roles;
SELECT 'User roles updated' as status, COUNT(*) as count FROM user_roles WHERE role_id IS NOT NULL;
SELECT 'User roles without role_id' as status, COUNT(*) as count FROM user_roles WHERE role_id IS NULL;
```

### 3. Kiểm tra kết quả
Sau khi chạy script, bạn sẽ thấy:
- Bảng `roles` được tạo với 4 role mặc định
- Cột `role_id` được thêm vào `user_roles`
- Các user_roles hiện có được link với roles tương ứng

### 4. Test lại ứng dụng
Sau khi setup xong, lỗi `PGRST200` sẽ được giải quyết và `authUtils.ts` sẽ hoạt động bình thường.

## Cấu trúc bảng mới

### Bảng `roles`
- `id`: UUID primary key
- `name`: Tên role (unique)
- `display_name`: Tên hiển thị
- `description`: Mô tả role
- `created_at`, `updated_at`: Timestamps

### Bảng `user_roles` (đã cập nhật)
- Tất cả cột cũ
- `role_id`: Foreign key đến `roles.id` (mới)

## Lưu ý
- Script sử dụng `IF NOT EXISTS` nên an toàn chạy nhiều lần
- Dữ liệu hiện có sẽ được giữ nguyên
- RLS policies được thiết lập để bảo mật
