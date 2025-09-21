-- ================================================
-- FIX RLS POLICIES FOR USER PROFILES AND ROLES
-- ================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Service role can manage all roles" ON user_roles;

-- Recreate User Profiles Policies
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON user_profiles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Recreate User Roles Policies
CREATE POLICY "Users can view their own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles" ON user_roles
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can manage all roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- ================================================
-- VERIFY POLICIES
-- ================================================

-- Check if policies are created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'user_roles')
ORDER BY tablename, policyname;
