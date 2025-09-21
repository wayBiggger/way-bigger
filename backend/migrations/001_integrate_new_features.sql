-- WAY BIGGER Database Migration: Integrate New Features
-- This migration adds all new features while maintaining existing data integrity

-- ==============================================
-- 1. GAMIFICATION SYSTEM ENHANCEMENTS
-- ==============================================

-- Update existing user_progress table to match new schema
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS skill_points JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS unlocked_features JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS last_active_date TIMESTAMP DEFAULT NOW();

-- Create badges table (if not exists)
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common',
    xp_reward INTEGER DEFAULT 0,
    requirements JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_badges table (if not exists)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    earned_date TIMESTAMP DEFAULT NOW(),
    is_featured BOOLEAN DEFAULT false,
    UNIQUE(user_progress_id, badge_id)
);

-- Create xp_transactions table (if not exists)
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    source VARCHAR(50) NOT NULL,
    description TEXT,
    transaction_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create streak_history table (if not exists)
CREATE TABLE IF NOT EXISTS streak_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
    streak_date DATE NOT NULL,
    activities JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_progress_id, streak_date)
);

-- Create unlockable_features table (if not exists)
CREATE TABLE IF NOT EXISTS unlockable_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    requirements JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create leaderboards table (if not exists)
CREATE TABLE IF NOT EXISTS leaderboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    period VARCHAR(20) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    rank INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create skill_trees table (if not exists)
CREATE TABLE IF NOT EXISTS skill_trees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create skill_nodes table (if not exists)
CREATE TABLE IF NOT EXISTS skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_tree_id UUID REFERENCES skill_trees(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    xp_cost INTEGER DEFAULT 0,
    prerequisites JSONB DEFAULT '[]',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_skill_nodes table (if not exists)
CREATE TABLE IF NOT EXISTS user_skill_nodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
    skill_node_id UUID REFERENCES skill_nodes(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_progress_id, skill_node_id)
);

-- Create achievements table (if not exists)
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    category VARCHAR(50) NOT NULL,
    requirements JSONB NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_achievements table (if not exists)
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_progress_id UUID REFERENCES user_progress(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_progress_id, achievement_id)
);

-- ==============================================
-- 2. MENTORSHIP SYSTEM
-- ==============================================

-- Create mentorship_contexts table (if not exists)
CREATE TABLE IF NOT EXISTS mentorship_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mentor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    context_type VARCHAR(50) NOT NULL,
    context_data JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create mentorship_sessions table (if not exists)
CREATE TABLE IF NOT EXISTS mentorship_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    context_id UUID REFERENCES mentorship_contexts(id) ON DELETE CASCADE,
    session_type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    scheduled_at TIMESTAMP,
    duration_minutes INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    session_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create learning_style_profiles table (if not exists)
CREATE TABLE IF NOT EXISTS learning_style_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    visual_score INTEGER DEFAULT 0,
    auditory_score INTEGER DEFAULT 0,
    kinesthetic_score INTEGER DEFAULT 0,
    reading_score INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create mentorship_resources table (if not exists)
CREATE TABLE IF NOT EXISTS mentorship_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL,
    content_url TEXT,
    content_data JSONB DEFAULT '{}',
    difficulty_level VARCHAR(20),
    tags JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create proactive_interventions table (if not exists)
CREATE TABLE IF NOT EXISTS proactive_interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    intervention_type VARCHAR(50) NOT NULL,
    trigger_conditions JSONB NOT NULL,
    action_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    triggered_at TIMESTAMP,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 3. COLLABORATION SYSTEM
-- ==============================================

-- Create team_projects table (if not exists)
CREATE TABLE IF NOT EXISTS team_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty_level VARCHAR(20) NOT NULL,
    max_team_size INTEGER DEFAULT 5,
    min_team_size INTEGER DEFAULT 2,
    is_public BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create project_participants table (if not exists)
CREATE TABLE IF NOT EXISTS project_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create collaboration_sessions table (if not exists)
CREATE TABLE IF NOT EXISTS collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    session_name VARCHAR(200),
    status VARCHAR(20) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    session_data JSONB DEFAULT '{}'
);

-- Create project_files table (if not exists)
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    content_hash VARCHAR(64),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create file_changes table (if not exists)
CREATE TABLE IF NOT EXISTS file_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    change_type VARCHAR(20) NOT NULL,
    change_data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create cursor_positions table (if not exists)
CREATE TABLE IF NOT EXISTS cursor_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES project_participants(id) ON DELETE CASCADE,
    file_id UUID REFERENCES project_files(id) ON DELETE CASCADE,
    line_number INTEGER,
    column_number INTEGER,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create chat_messages table (if not exists)
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text',
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create team_invitations table (if not exists)
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create collaboration_stats table (if not exists)
CREATE TABLE IF NOT EXISTS collaboration_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES team_projects(id) ON DELETE CASCADE,
    stats_type VARCHAR(50) NOT NULL,
    stats_data JSONB NOT NULL,
    period_start TIMESTAMP NOT NULL,
    period_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 4. INDUSTRY CHALLENGES SYSTEM
-- ==============================================

-- Create industry_challenges table
CREATE TABLE IF NOT EXISTS industry_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    company VARCHAR(100),
    industry VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    duration_days INTEGER,
    prize_amount DECIMAL(10,2),
    requirements JSONB NOT NULL,
    evaluation_criteria JSONB NOT NULL,
    submission_deadline TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES industry_challenges(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id),
    status VARCHAR(20) DEFAULT 'registered',
    registered_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    UNIQUE(challenge_id, user_id)
);

-- Create challenge_submissions table
CREATE TABLE IF NOT EXISTS challenge_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID REFERENCES industry_challenges(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES challenge_participants(id) ON DELETE CASCADE,
    submission_data JSONB NOT NULL,
    file_urls JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'submitted',
    score DECIMAL(5,2),
    feedback TEXT,
    submitted_at TIMESTAMP DEFAULT NOW(),
    evaluated_at TIMESTAMP
);

-- ==============================================
-- 5. PORTFOLIO SYSTEM ENHANCEMENTS
-- ==============================================

-- Create portfolio_templates table
CREATE TABLE IF NOT EXISTS portfolio_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    template_data JSONB NOT NULL,
    preview_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_portfolios table
CREATE TABLE IF NOT EXISTS user_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID REFERENCES portfolio_templates(id),
    portfolio_data JSONB NOT NULL,
    is_public BOOLEAN DEFAULT true,
    custom_domain VARCHAR(100),
    last_generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create portfolio_projects table
CREATE TABLE IF NOT EXISTS portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    custom_description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 6. FILE SYSTEM STORAGE
-- ==============================================

-- Create file_storage table
CREATE TABLE IF NOT EXISTS file_storage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50),
    file_size BIGINT,
    mime_type VARCHAR(100),
    storage_provider VARCHAR(20) DEFAULT 'local',
    storage_url TEXT,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 7. MONACO EDITOR RESTRICTIONS
-- ==============================================

-- Create editor_restrictions table
CREATE TABLE IF NOT EXISTS editor_restrictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    restriction_type VARCHAR(50) NOT NULL,
    restriction_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ==============================================
-- 8. INDEXES FOR PERFORMANCE
-- ==============================================

-- Gamification indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_progress_id ON user_badges(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_progress_id ON xp_transactions(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category_period ON leaderboards(category, period);

-- Mentorship indexes
CREATE INDEX IF NOT EXISTS idx_mentorship_contexts_user_id ON mentorship_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_mentorship_sessions_context_id ON mentorship_sessions(context_id);

-- Collaboration indexes
CREATE INDEX IF NOT EXISTS idx_team_projects_created_by ON team_projects(created_by);
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_project_id ON collaboration_sessions(project_id);

-- Industry challenges indexes
CREATE INDEX IF NOT EXISTS idx_industry_challenges_status ON industry_challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_is_public ON user_portfolios(is_public);

-- File storage indexes
CREATE INDEX IF NOT EXISTS idx_file_storage_user_id ON file_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_file_storage_is_public ON file_storage(is_public);

-- ==============================================
-- 9. SEED DATA FOR NEW FEATURES
-- ==============================================

-- Insert default badges
INSERT INTO badges (name, description, icon, category, rarity, xp_reward, requirements) VALUES
('First Steps', 'Complete your first project', '🎯', 'milestone', 'common', 100, '{"projects_completed": 1}'),
('Code Warrior', 'Complete 10 projects', '⚔️', 'milestone', 'rare', 500, '{"projects_completed": 10}'),
('Streak Master', 'Maintain a 7-day streak', '🔥', 'consistency', 'uncommon', 200, '{"streak_days": 7}'),
('Team Player', 'Join your first team project', '👥', 'collaboration', 'common', 150, '{"team_projects_joined": 1}'),
('Mentor', 'Help 5 other users', '🎓', 'mentorship', 'rare', 300, '{"users_helped": 5}')
ON CONFLICT (name) DO NOTHING;

-- Insert default unlockable features
INSERT INTO unlockable_features (name, description, requirements) VALUES
('collaboration', 'Real-time collaboration features', '{"level": 3, "projects_completed": 5}'),
('mentoring', 'Access to mentorship system', '{"level": 10, "projects_completed": 15}'),
('industry_challenges', 'Industry challenge participation', '{"level": 5, "projects_completed": 10}'),
('advanced_portfolio', 'Advanced portfolio customization', '{"level": 8, "projects_completed": 12}')
ON CONFLICT (name) DO NOTHING;

-- Insert default skill trees
INSERT INTO skill_trees (name, description, category) VALUES
('Web Development', 'Full-stack web development skills', 'web-dev'),
('Data Science', 'Data analysis and machine learning', 'data-science'),
('Mobile Development', 'iOS and Android development', 'mobile'),
('AI/ML', 'Artificial Intelligence and Machine Learning', 'ai-ml')
ON CONFLICT DO NOTHING;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, requirements, reward_xp) VALUES
('Early Bird', 'Complete your first project within 24 hours', '🐦', 'speed', '{"first_project_time": 86400}', 100),
('Perfectionist', 'Get 100% score on 5 projects', '💎', 'quality', '{"perfect_scores": 5}', 250),
('Social Butterfly', 'Participate in 10 team projects', '🦋', 'collaboration', '{"team_projects": 10}', 300),
('Knowledge Seeker', 'Complete 5 different skill tracks', '🔍', 'learning', '{"tracks_completed": 5}', 200)
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- 10. UPDATE EXISTING TABLES
-- ==============================================

-- Add new columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS portfolio_public_url VARCHAR(200),
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{}';

-- Add new columns to existing projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS industry_category VARCHAR(50),
ADD COLUMN IF NOT EXISTS collaboration_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS file_restrictions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS challenge_id UUID REFERENCES industry_challenges(id);

-- ==============================================
-- 11. CREATE VIEWS FOR COMMON QUERIES
-- ==============================================

-- User progress summary view
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT 
    up.user_id,
    u.username,
    u.full_name,
    up.level,
    up.total_xp,
    up.current_streak,
    up.longest_streak,
    COUNT(ub.id) as badges_count,
    COUNT(ua.id) as achievements_count,
    up.unlocked_features
FROM user_progress up
JOIN users u ON up.user_id = u.id
LEFT JOIN user_badges ub ON up.id = ub.user_progress_id
LEFT JOIN user_achievements ua ON up.id = ua.user_progress_id
GROUP BY up.user_id, u.username, u.full_name, up.level, up.total_xp, up.current_streak, up.longest_streak, up.unlocked_features;

-- Active collaboration sessions view
CREATE OR REPLACE VIEW active_collaboration_sessions AS
SELECT 
    cs.id,
    cs.project_id,
    tp.name as project_name,
    cs.session_name,
    cs.started_at,
    COUNT(pp.user_id) as participant_count
FROM collaboration_sessions cs
JOIN team_projects tp ON cs.project_id = tp.id
LEFT JOIN project_participants pp ON tp.id = pp.project_id AND pp.status = 'active'
WHERE cs.status = 'active'
GROUP BY cs.id, cs.project_id, tp.name, cs.session_name, cs.started_at;

-- ==============================================
-- 12. GRANT PERMISSIONS
-- ==============================================

-- Grant necessary permissions to application user
-- (Adjust based on your actual database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO waybigger_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO waybigger_app;

COMMIT;
