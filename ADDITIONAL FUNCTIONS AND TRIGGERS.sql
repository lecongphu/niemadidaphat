-- ================================================
-- ADDITIONAL FUNCTIONS AND TRIGGERS FOR USER MANAGEMENT
-- Các function và trigger bổ sung cho quản lý người dùng
-- ================================================

-- ================================================
-- 1. FUNCTIONS FOR USER_PROFILES TABLE
-- ================================================

-- Function để tạo user profile khi user đăng ký
create or replace function public.create_user_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.user_profiles (
    id,                -- khóa chính, trùng với auth.users.id
    email,
    full_name,
    avatar_url,
    provider,
    created_at,
    updated_at,
    last_active
  )
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      'Phật tử'  -- fallback nếu không có tên
    ),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    now(),
    now(),
    now()
  )
  on conflict (id) do nothing;  -- tránh lỗi nếu đã tồn tại
  return new;
end;
$$;


-- Function để cập nhật thông tin login
CREATE OR REPLACE FUNCTION update_user_login_info()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    UPDATE user_profiles 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1,
        last_active = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
end;
$$;

-- Function để validate user profile data
CREATE OR REPLACE FUNCTION validate_user_profile()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    -- Kiểm tra email format
    IF NEW.email IS NOT NULL AND NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
    
    -- Kiểm tra full_name không rỗng
    IF NEW.full_name IS NULL OR LENGTH(TRIM(NEW.full_name)) = 0 THEN
        RAISE EXCEPTION 'Full name cannot be empty';
    END IF;
    
    -- Kiểm tra phone format (nếu có)
    IF NEW.phone IS NOT NULL AND NEW.phone !~ '^\+?[0-9\s\-\(\)]+$' THEN
        RAISE EXCEPTION 'Invalid phone format: %', NEW.phone;
    END IF;
    
    RETURN NEW;
end;
$$;

-- ================================================
-- 2. FUNCTIONS FOR ROLES TABLE
-- ================================================

-- Function để validate role data
CREATE OR REPLACE FUNCTION validate_role()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    -- Kiểm tra name không rỗng và đúng format
    IF NEW.name IS NULL OR LENGTH(TRIM(NEW.name)) = 0 THEN
        RAISE EXCEPTION 'Role name cannot be empty';
    END IF;
    
    -- Kiểm tra display_name không rỗng
    IF NEW.display_name IS NULL OR LENGTH(TRIM(NEW.display_name)) = 0 THEN
        RAISE EXCEPTION 'Role display name cannot be empty';
    END IF;
    
    -- Normalize name to lowercase
    NEW.name = LOWER(TRIM(NEW.name));
    
    RETURN NEW;
end;
$$;

-- Function để kiểm tra role có thể xóa không
CREATE OR REPLACE FUNCTION check_role_deletion()
returns trigger
language plpgsql
set search_path = ''
as $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Kiểm tra có user nào đang sử dụng role này không
    SELECT COUNT(*) INTO user_count
    FROM user_roles 
    WHERE role_id = OLD.id AND is_active = true;
    
    IF user_count > 0 THEN
        RAISE EXCEPTION 'Cannot delete role "%" because it is assigned to % active user(s)', 
            OLD.display_name, user_count;
    END IF;
    
    RETURN OLD;
end;
$$;

-- ================================================
-- 3. FUNCTIONS FOR USER_ROLES TABLE
-- ================================================

-- Function để tự động gán role 'user' cho user mới
CREATE OR REPLACE FUNCTION assign_default_role()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    -- Gán role mặc định nếu tìm thấy
        INSERT INTO user_roles (
            id, 
            assigned_by
        ) VALUES (
            NEW.id, 
            NEW.id
        );
    
    RETURN NEW;
end;
$$;


-- Function để validate user role assignment
CREATE OR REPLACE FUNCTION validate_user_role()
returns trigger
language plpgsql
set search_path = ''
as $$
DECLARE
    role_exists BOOLEAN;
BEGIN
    -- Kiểm tra role_id có tồn tại không (nếu được cung cấp)
    IF NEW.role_id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM roles WHERE id = NEW.role_id) INTO role_exists;
        IF NOT role_exists THEN
            RAISE EXCEPTION 'Role with id % does not exist', NEW.role_id;
        END IF;
    END IF;
    
    -- Kiểm tra expires_at phải lớn hơn hiện tại (nếu có)
    IF NEW.expires_at IS NOT NULL AND NEW.expires_at <= NOW() THEN
        RAISE EXCEPTION 'Role expiration date must be in the future';
    END IF;
    
    -- Sync role name với role_id
    IF NEW.role_id IS NOT NULL THEN
        SELECT name INTO NEW.role FROM roles WHERE id = NEW.role_id;
    END IF;
    
    RETURN NEW;
end;
$$;


-- Function để log role changes
CREATE OR REPLACE FUNCTION log_role_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
DECLARE
    change_type TEXT;
    old_role TEXT;
    new_role TEXT;
BEGIN
    IF TG_OP = 'INSERT' THEN
        change_type = 'ASSIGNED';
        new_role = NEW.role;
        
        -- Log assignment
        RAISE NOTICE 'Role % assigned to user %', new_role, NEW.id;
        
    ELSIF TG_OP = 'UPDATE' THEN
        change_type = 'UPDATED';
        old_role = OLD.role;
        new_role = NEW.role;
        
        -- Log changes
        IF OLD.role != NEW.role THEN
            RAISE NOTICE 'Role changed from % to % for user %', old_role, new_role, NEW.id;
        END IF;
        
        IF OLD.is_active != NEW.is_active THEN
            RAISE NOTICE 'Role % % for user %', 
                new_role, 
                CASE WHEN NEW.is_active THEN 'activated' ELSE 'deactivated' END,
                NEW.id;
        END IF;
        
    ELSIF TG_OP = 'DELETE' THEN
        change_type = 'REMOVED';
        old_role = OLD.role;
        
        -- Log removal
        RAISE NOTICE 'Role % removed from user %', old_role, OLD.id;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
end;
$$;

-- ================================================
-- 4. FUNCTIONS FOR USER_SESSIONS TABLE
-- ================================================

-- Function để validate session data
CREATE OR REPLACE FUNCTION validate_user_session()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    -- Kiểm tra session_token không rỗng
    IF NEW.session_token IS NULL OR LENGTH(TRIM(NEW.session_token)) = 0 THEN
        RAISE EXCEPTION 'Session token cannot be empty';
    END IF;
    
    -- Kiểm tra expires_at phải lớn hơn hiện tại
    IF NEW.expires_at <= NOW() THEN
        RAISE EXCEPTION 'Session expiration date must be in the future';
    END IF;
    
    -- Cập nhật last_activity
    NEW.last_activity = NOW();
    
    RETURN NEW;
end;
$$;

-- Function để cleanup expired sessions tự động
CREATE OR REPLACE FUNCTION cleanup_expired_sessions_trigger()
returns trigger
language plpgsql
set search_path = ''
as $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Xóa các session đã hết hạn
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    IF deleted_count > 0 THEN
        RAISE NOTICE 'Cleaned up % expired sessions', deleted_count;
    END IF;
    
    RETURN NEW;
end;
$$;


-- Function để update user last_active khi có session activity
CREATE OR REPLACE FUNCTION update_user_activity_from_session()
returns trigger
language plpgsql
set search_path = ''
as $$
BEGIN
    -- Cập nhật last_active của user
    UPDATE user_profiles 
    SET last_active = NOW()
    WHERE id = NEW.id;
    
    RETURN NEW;
end;
$$;

-- ================================================
-- 5. UTILITY FUNCTIONS
-- ================================================

-- Function để lấy roles của user
CREATE OR REPLACE FUNCTION get_user_roles(user_uuid UUID)
RETURNS JSON 
language plpgsql
set search_path = ''
AS $$
DECLARE
    result JSON;
BEGIN
    SELECT COALESCE(
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
                'is_active', ur.is_active,
                'assigned_by', ur.assigned_by
            ) ORDER BY ur.assigned_at DESC
        ),
        '[]'::json
    ) INTO result
    FROM user_roles ur
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE ur.id = user_uuid AND ur.is_active = true;
    
    RETURN result;
end;
$$;

-- Function để kiểm tra user có permission không
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN 
language plpgsql
set search_path = ''
AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    -- Kiểm tra trong permissions của user_roles
    SELECT EXISTS(
        SELECT 1 FROM user_roles ur
        WHERE ur.id = user_uuid 
        AND ur.is_active = true
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        AND (
            ur.permissions ? permission_name OR
            ur.role = 'admin' -- Admin có tất cả permissions
        )
    ) INTO has_permission;
    
    RETURN has_permission;
end;
$$;

-- Function để tạo session mới
CREATE OR REPLACE FUNCTION create_user_session(
    p_id UUID,
    p_session_token TEXT,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_device_info JSONB DEFAULT NULL,
    p_expires_hours INTEGER DEFAULT 24
)
RETURNS UUID 
language plpgsql
set search_path = ''
AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO user_sessions (
        id,
        session_token,
        ip_address,
        user_agent,
        device_info,
        expires_at,
        is_active
    ) VALUES (
        p_id,
        p_session_token,
        p_ip_address,
        p_user_agent,
        p_device_info,
        NOW() + (p_expires_hours || ' hours')::INTERVAL,
        true
    ) RETURNING id INTO session_id;
    
    RETURN session_id;
end;
$$;


-- ================================================
-- 6. TRIGGERS SETUP
-- ================================================

-- Triggers for user_profiles
CREATE TRIGGER validate_user_profile_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION validate_user_profile();

CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Triggers for roles
CREATE TRIGGER validate_role_trigger
    BEFORE INSERT OR UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION validate_role();

CREATE TRIGGER check_role_deletion_trigger
    BEFORE DELETE ON roles
    FOR EACH ROW EXECUTE FUNCTION check_role_deletion();

-- Triggers for user_roles
CREATE TRIGGER assign_default_role_trigger
    AFTER INSERT ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION assign_default_role();

CREATE TRIGGER validate_user_role_trigger
    BEFORE INSERT OR UPDATE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION validate_user_role();

CREATE TRIGGER log_role_changes_trigger
    AFTER INSERT OR UPDATE OR DELETE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION log_role_changes();

-- Triggers for user_sessions
CREATE TRIGGER validate_user_session_trigger
    BEFORE INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION validate_user_session();

CREATE TRIGGER update_user_activity_from_session_trigger
    AFTER INSERT OR UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_activity_from_session();

CREATE TRIGGER update_login_info_trigger
    AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_user_login_info();

-- Trigger để cleanup sessions định kỳ (chạy khi có session mới)
CREATE TRIGGER cleanup_sessions_trigger
    AFTER INSERT ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION cleanup_expired_sessions_trigger();

-- ================================================
-- 7. SCHEDULED CLEANUP (Cần cron job hoặc pg_cron extension)
-- ================================================

-- Function để chạy cleanup định kỳ
CREATE OR REPLACE FUNCTION scheduled_cleanup()
RETURNS VOID 
language plpgsql
set search_path = ''
AS $$
DECLARE
    session_count INTEGER;
    inactive_user_count INTEGER;
BEGIN
    -- Cleanup expired sessions
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    GET DIAGNOSTICS session_count = ROW_COUNT;
    
    -- Deactivate inactive user roles (expired)
    UPDATE user_roles 
    SET is_active = false 
    WHERE expires_at < NOW() AND is_active = true;
    GET DIAGNOSTICS inactive_user_count = ROW_COUNT;
    
    -- Log cleanup results
    RAISE NOTICE 'Scheduled cleanup completed: % sessions, % user roles deactivated', 
        session_count, inactive_user_count;
end;
$$;


-- ================================================
-- USAGE EXAMPLES
-- ================================================

/*
-- Tạo session mới
SELECT create_user_session(
    'user-uuid-here'::UUID,
    'session-token-here',
    '192.168.1.1'::INET,
    'Mozilla/5.0...',
    '{"device": "mobile", "os": "iOS"}'::JSONB,
    72 -- expires in 72 hours
);

-- Lấy roles của user
SELECT get_user_roles('user-uuid-here'::UUID);

-- Kiểm tra permission
SELECT user_has_permission('user-uuid-here'::UUID, 'manage_products');

-- Chạy cleanup manual
SELECT scheduled_cleanup();
*/

-- ================================================
-- SUMMARY
-- ================================================
/*
Functions được tạo:
✅ create_user_profile() - Tự động tạo profile khi user đăng ký
✅ update_user_login_info() - Cập nhật thông tin login
✅ validate_user_profile() - Validate dữ liệu user profile
✅ validate_role() - Validate dữ liệu role
✅ check_role_deletion() - Kiểm tra role có thể xóa không
✅ assign_default_role() - Tự động gán role mặc định
✅ validate_user_role() - Validate user role assignment
✅ log_role_changes() - Log thay đổi roles
✅ validate_user_session() - Validate session data
✅ cleanup_expired_sessions_trigger() - Cleanup sessions tự động
✅ update_user_activity_from_session() - Cập nhật user activity
✅ get_user_roles() - Lấy roles của user
✅ user_has_permission() - Kiểm tra permission
✅ create_user_session() - Tạo session mới
✅ scheduled_cleanup() - Cleanup định kỳ

Triggers được tạo:
✅ Auto-create user profile khi đăng ký
✅ Validate dữ liệu trước khi insert/update
✅ Auto-assign default role cho user mới
✅ Log role changes
✅ Update user activity từ sessions
✅ Cleanup expired sessions
✅ Prevent deletion of roles in use
*/