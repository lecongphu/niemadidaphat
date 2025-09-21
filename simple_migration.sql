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
