-- ================================================
-- COMPLETE DATABASE SCHEMA FOR NIEMADIDAPHAT PROJECT
-- Updated: $(date)
-- Includes: Google OAuth Authentication & All Features
-- ================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ================================================

-- User Profiles Table
-- Stores user information from OAuth and manual registration
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,                        -- Profile picture from OAuth provider
    provider TEXT DEFAULT 'google',        -- OAuth provider (google, facebook, etc.)
    phone TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_active TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    login_count INTEGER DEFAULT 0,
    last_login_at TIMESTAMPTZ,
    profile_active BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT valid_provider CHECK (provider IN ('google', 'facebook', 'github', 'email'))
);

-- Roles Table
-- Defines available roles in the system
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_role_name CHECK (name ~ '^[a-z_]+$')
);

-- User Roles Table
-- Manages user permissions and access levels
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user', -- Backward compatibility
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL, -- New foreign key
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_by UUID REFERENCES user_profiles(id),
    
    CONSTRAINT valid_role CHECK (role IN ('admin', 'moderator', 'user', 'guest')),
    UNIQUE(user_id, role),
    UNIQUE(user_id, role_id)
);

-- User Sessions Table
-- Tracks user activity and session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_activity TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- ================================================
-- 2. PRODUCTS & CONTENT MANAGEMENT
-- ================================================

-- Products Table
-- Main content table for audio Buddhist materials
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,              -- URL-friendly identifier
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    translator TEXT,                        -- Dịch kinh (Sanskrit/Pali -> Vietnamese)
    interpreter TEXT,                       -- Chuyển ngữ (Hán văn -> Vietnamese)
    speaker TEXT,                          -- Người giảng
    narrator TEXT,                         -- Người đọc (backward compatibility)
    lecture_date DATE,                     -- Ngày giảng pháp
    duration TEXT NOT NULL,                -- Display format: "2h 30m 45s"
    duration_seconds INTEGER,              -- Storage format: total seconds
    description TEXT NOT NULL,
    cover_url TEXT,                        -- Cover image URL
    pdf_url TEXT,                          -- PDF file URL for reading
    category TEXT,                         -- Content category
    followers_count INTEGER DEFAULT 0,     -- Number of followers
    total_views INTEGER DEFAULT 0,         -- Total view count
    unique_views INTEGER DEFAULT 0,        -- Unique user views
    avg_view_duration NUMERIC(10,2) DEFAULT 0, -- Average view duration in seconds
    last_viewed_at TIMESTAMPTZ,           -- Last time product was viewed
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES user_profiles(id),
    
    CONSTRAINT valid_category CHECK (category IN ('nhan-qua', 'gioi-luat', 'niem-phat', 'kinh-dien', 'luat-tang')),
    CONSTRAINT positive_duration CHECK (duration_seconds >= 0),
    CONSTRAINT positive_counts CHECK (
        followers_count >= 0 AND 
        total_views >= 0 AND 
        unique_views >= 0 AND
        avg_view_duration >= 0
    )
);

-- Chapters Table
-- Individual chapters/episodes within products
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    chapter_id TEXT NOT NULL,              -- Original chapter ID from JSONB
    title TEXT NOT NULL,
    audio_url TEXT,                        -- Audio file URL
    duration_seconds INTEGER,              -- Chapter duration in seconds
    sort_order INTEGER NOT NULL DEFAULT 0, -- Chapter order within product
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT positive_duration CHECK (duration_seconds >= 0),
    CONSTRAINT positive_sort_order CHECK (sort_order >= 0),
    UNIQUE(product_id, chapter_id),
    UNIQUE(product_id, sort_order)
);

-- ================================================
-- 3. USER INTERACTIONS & ANALYTICS
-- ================================================

-- Product Views Table
-- Tracks when users view products for analytics
CREATE TABLE IF NOT EXISTS product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    ip_address INET,                       -- For anonymous tracking
    user_agent TEXT,
    view_duration INTEGER DEFAULT 0,       -- Time spent viewing (seconds)
    chapter_progress JSONB DEFAULT '{}'::jsonb, -- Progress through chapters
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
    
    CONSTRAINT positive_duration CHECK (view_duration >= 0)
);

-- Followers Table
-- Users following specific products for updates
CREATE TABLE IF NOT EXISTS followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    notification_enabled BOOLEAN DEFAULT TRUE,
    
    UNIQUE(product_id, user_id)
);

-- Feedback Table
-- User feedback and suggestions
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message TEXT NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL, -- Optional: feedback for specific product
    contact_email TEXT,                    -- For anonymous feedback
    user_type TEXT DEFAULT 'registered',   -- 'registered' or 'anonymous'
    status TEXT DEFAULT 'pending',         -- 'pending', 'reviewed', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium',        -- 'low', 'medium', 'high', 'urgent'
    category TEXT DEFAULT 'general',       -- 'bug', 'feature', 'content', 'general'
    ip_address INET,
    user_agent TEXT,
    admin_notes TEXT,                      -- Internal notes for admins
    resolved_by UUID REFERENCES user_profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT valid_status CHECK (status IN ('pending', 'reviewed', 'resolved', 'closed')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT valid_category CHECK (category IN ('bug', 'feature', 'content', 'general', 'ui', 'performance')),
    CONSTRAINT valid_user_type CHECK (user_type IN ('registered', 'anonymous'))
);

-- ================================================
-- 4. INDEXES FOR PERFORMANCE
-- ================================================

-- User Profiles Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_provider ON user_profiles(provider);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- Roles Indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_display_name ON roles(display_name);

-- User Roles Indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_is_active ON user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at);

-- User Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON user_sessions(is_active);

-- Products Indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_author ON products(author);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_title_search ON products USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_products_description_search ON products USING gin(to_tsvector('english', description));

-- Chapters Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_product_id ON chapters(product_id);
CREATE INDEX IF NOT EXISTS idx_chapters_sort_order ON chapters(product_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_chapters_chapter_id ON chapters(chapter_id);

-- Product Views Indexes
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_user_id ON product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON product_views(created_at);
CREATE INDEX IF NOT EXISTS idx_product_views_ip ON product_views(ip_address);

-- Followers Indexes
CREATE INDEX IF NOT EXISTS idx_followers_product_id ON followers(product_id);
CREATE INDEX IF NOT EXISTS idx_followers_user_id ON followers(user_id);
CREATE INDEX IF NOT EXISTS idx_followers_created_at ON followers(created_at);

-- Feedback Indexes
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_product_id ON feedback(product_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_priority ON feedback(priority);
CREATE INDEX IF NOT EXISTS idx_feedback_category ON feedback(category);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);

-- ================================================
-- 5. VIEWS FOR COMPLEX QUERIES
-- ================================================

-- User Details View
-- Combines user profile with role information
CREATE OR REPLACE VIEW user_details AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.avatar_url,
    up.provider,
    up.phone,
    up.bio,
    up.created_at as user_created_at,
    up.last_active,
    up.login_count,
    up.last_login_at,
    up.profile_active,
    COALESCE(
        json_agg(
            json_build_object(
                'id', ur.id,
                'role', ur.role,
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
GROUP BY up.id, up.email, up.full_name, up.avatar_url, up.provider, 
         up.phone, up.bio, up.created_at, up.last_active, 
         up.login_count, up.last_login_at, up.profile_active;

-- Product Analytics View
-- Combines product data with analytics
CREATE OR REPLACE VIEW product_analytics AS
SELECT 
    p.*,
    COALESCE(chapter_stats.chapter_count, 0) as chapter_count,
    COALESCE(chapter_stats.total_chapter_duration, 0) as total_chapter_duration,
    COALESCE(view_stats.recent_views_7d, 0) as recent_views_7d,
    COALESCE(view_stats.recent_views_30d, 0) as recent_views_30d,
    COALESCE(view_stats.avg_session_duration, 0) as avg_session_duration
FROM products p
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) as chapter_count,
        COALESCE(SUM(duration_seconds), 0) as total_chapter_duration
    FROM chapters 
    GROUP BY product_id
) chapter_stats ON p.id = chapter_stats.product_id
LEFT JOIN (
    SELECT 
        product_id,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_views_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as recent_views_30d,
        AVG(view_duration) as avg_session_duration
    FROM product_views 
    GROUP BY product_id
) view_stats ON p.id = view_stats.product_id;

-- Chapter Details View
-- Combines chapter data with product information
CREATE OR REPLACE VIEW chapter_details AS
SELECT 
    c.*,
    p.title as product_title,
    p.slug as product_slug,
    p.author as product_author,
    p.category as product_category,
    p.cover_url as product_cover_url
FROM chapters c
JOIN products p ON c.product_id = p.id;

-- ================================================
-- 6. TRIGGERS FOR AUTO-UPDATES
-- ================================================

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at 
    BEFORE UPDATE ON user_roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at 
    BEFORE UPDATE ON chapters 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at 
    BEFORE UPDATE ON feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user last_active
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE user_profiles 
    SET last_active = NOW()
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for user activity tracking
CREATE TRIGGER update_user_activity_on_view 
    AFTER INSERT ON product_views 
    FOR EACH ROW EXECUTE FUNCTION update_user_last_active();

-- Function to update product followers count
CREATE OR REPLACE FUNCTION update_product_followers_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE products 
        SET followers_count = (
            SELECT COUNT(*) FROM followers WHERE product_id = NEW.product_id
        )
        WHERE id = NEW.product_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE products 
        SET followers_count = (
            SELECT COUNT(*) FROM followers WHERE product_id = OLD.product_id
        )
        WHERE id = OLD.product_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for followers count
CREATE TRIGGER update_followers_count_on_insert 
    AFTER INSERT ON followers 
    FOR EACH ROW EXECUTE FUNCTION update_product_followers_count();

CREATE TRIGGER update_followers_count_on_delete 
    AFTER DELETE ON followers 
    FOR EACH ROW EXECUTE FUNCTION update_product_followers_count();

-- ================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
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

-- Roles Policies
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

-- User Roles Policies
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

-- Products Policies (Public read access)
CREATE POLICY "Anyone can view products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_active = true
        )
    );

-- Chapters Policies (Public read access)
CREATE POLICY "Anyone can view chapters" ON chapters
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage chapters" ON chapters
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_active = true
        )
    );

-- Product Views Policies
CREATE POLICY "Users can create product views" ON product_views
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Users can view their own product views" ON product_views
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Followers Policies
CREATE POLICY "Users can manage their own follows" ON followers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all follows" ON followers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin' 
            AND is_active = true
        )
    );

-- Feedback Policies
CREATE POLICY "Users can create feedback" ON feedback
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Users can view their own feedback" ON feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_active = true
        )
    );

CREATE POLICY "Admins can manage all feedback" ON feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator') 
            AND is_active = true
        )
    );

-- ================================================
-- 8. INITIAL DATA SETUP
-- ================================================

-- Insert default roles
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access with all permissions'),
('moderator', 'Moderator', 'Content moderation and user management'),
('user', 'User', 'Standard user with basic permissions'),
('guest', 'Guest', 'Limited access for unregistered users')
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- 9. FUNCTIONS FOR COMMON OPERATIONS
-- ================================================

-- Function to get user with roles
CREATE OR REPLACE FUNCTION get_user_with_roles(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(ud) INTO result
    FROM user_details ud
    WHERE ud.id = user_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = user_uuid 
        AND role = 'admin' 
        AND is_active = true 
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get product analytics
CREATE OR REPLACE FUNCTION get_product_analytics(product_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT row_to_json(pa) INTO result
    FROM product_analytics pa
    WHERE pa.id = product_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- 10. CLEANUP AND MAINTENANCE
-- ================================================

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at < NOW() OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update product statistics
CREATE OR REPLACE FUNCTION update_product_statistics()
RETURNS VOID AS $$
BEGIN
    UPDATE products SET
        total_views = COALESCE((
            SELECT COUNT(*) FROM product_views 
            WHERE product_id = products.id
        ), 0),
        unique_views = COALESCE((
            SELECT COUNT(DISTINCT user_id) FROM product_views 
            WHERE product_id = products.id AND user_id IS NOT NULL
        ), 0),
        avg_view_duration = COALESCE((
            SELECT AVG(view_duration) FROM product_views 
            WHERE product_id = products.id AND view_duration > 0
        ), 0),
        last_viewed_at = (
            SELECT MAX(created_at) FROM product_views 
            WHERE product_id = products.id
        );
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- SCHEMA COMPLETE
-- ================================================

-- Summary:
-- ✅ Authentication with Google OAuth support
-- ✅ User profiles with avatar and provider tracking
-- ✅ Role-based access control
-- ✅ Products and chapters management
-- ✅ User interactions (views, follows, feedback)
-- ✅ Analytics and reporting
-- ✅ Performance indexes
-- ✅ Row Level Security
-- ✅ Triggers for auto-updates
-- ✅ Utility functions
-- ✅ Cleanup and maintenance

COMMIT;
