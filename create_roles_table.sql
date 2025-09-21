-- ================================================
-- CREATE ROLES TABLE AND UPDATE USER_ROLES
-- ================================================

-- 1. Tạo bảng roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_role_name CHECK (name ~ '^[a-z_]+$') -- Chỉ cho phép lowercase và underscore
);

-- 2. Thêm cột role_id vào user_roles
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- 3. Tạo index cho role_id
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 4. Thêm trigger để update updated_at
CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Thêm RLS policies cho roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view roles" ON roles
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage all roles" ON roles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- 6. Thêm các role mặc định
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access with all permissions'),
('moderator', 'Moderator', 'Content moderation and user management'),
('user', 'User', 'Standard user with basic permissions'),
('guest', 'Guest', 'Limited access for unregistered users')
ON CONFLICT (name) DO NOTHING;

-- 7. Cập nhật user_roles hiện có để link với roles
UPDATE user_roles 
SET role_id = (
    SELECT id FROM roles 
    WHERE roles.name = user_roles.role
)
WHERE role_id IS NULL;

-- 8. Tạo function để migrate existing roles
CREATE OR REPLACE FUNCTION migrate_user_roles()
RETURNS VOID AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Cập nhật tất cả user_roles hiện có
    UPDATE user_roles 
    SET role_id = (
        SELECT id FROM roles 
        WHERE roles.name = user_roles.role
    )
    WHERE role_id IS NULL;
    
    -- Lấy số lượng records đã update
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Log số lượng records đã update
    RAISE NOTICE 'Updated % user_roles records', updated_count;
END;
$$ LANGUAGE plpgsql;

-- 9. Chạy migration
SELECT migrate_user_roles();

-- 10. Xóa function migration (không cần thiết nữa)
DROP FUNCTION migrate_user_roles();

-- 11. Tạo view để dễ dàng query user với roles
CREATE OR REPLACE VIEW user_with_roles AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.avatar_url,
    up.created_at as user_created_at,
    up.last_active,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ur.id,
                'role_id', ur.role_id,
                'role_name', r.name,
                'role_display_name', r.display_name,
                'role_description', r.description,
                'permissions', ur.permissions,
                'assigned_at', ur.assigned_at,
                'expires_at', ur.expires_at,
                'is_active', ur.is_active
            ) ORDER BY ur.assigned_at DESC
        ) FILTER (WHERE ur.id IS NOT NULL),
        '[]'::json
    ) as roles
FROM user_profiles up
LEFT JOIN user_roles ur ON up.id = ur.user_id AND ur.is_active = true
LEFT JOIN roles r ON ur.role_id = r.id
GROUP BY up.id, up.email, up.full_name, up.avatar_url, up.created_at, up.last_active;

-- 12. Tạo indexes cho performance
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_display_name ON roles(display_name);

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Kiểm tra bảng roles
SELECT 'Roles table created' as status, COUNT(*) as count FROM roles;

-- Kiểm tra user_roles với role_id
SELECT 'User roles with role_id' as status, COUNT(*) as count 
FROM user_roles 
WHERE role_id IS NOT NULL;

-- Kiểm tra view
SELECT 'User with roles view' as status, COUNT(*) as count FROM user_with_roles;
