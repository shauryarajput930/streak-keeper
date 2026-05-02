-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    github_id VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    avatar_url TEXT,
    email VARCHAR(255),
    profile_url TEXT,
    access_token TEXT,
    
    -- Repository Configuration
    repo_config JSONB DEFAULT '{}',
    
    -- Scheduler Configuration  
    scheduler_config JSONB DEFAULT '{"enabled": false, "hour": 9, "minute": 0, "timezone": "UTC", "jitterMin": 15}',
    
    -- Streak Statistics
    stats JSONB DEFAULT '{"currentStreak": 0, "longestStreak": 0, "totalCommits": 0, "totalDaysActive": 0}',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commits Table
CREATE TABLE commits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    github_sha VARCHAR(255),
    date VARCHAR(10) NOT NULL, -- YYYY-MM-DD format
    message TEXT,
    repo VARCHAR(255),
    branch VARCHAR(255),
    triggered_by VARCHAR(10) DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'scheduler')),
    status VARCHAR(10) DEFAULT 'success' CHECK (status IN ('success', 'skipped', 'failed')),
    error_msg TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_github_id ON users(github_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_commits_user_id ON commits(user_id);
CREATE INDEX idx_commits_date ON commits(date);
CREATE INDEX idx_commits_user_date ON commits(user_id, date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE commits ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = github_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = github_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid()::text = github_id);

-- Policies for commits table
CREATE POLICY "Users can view own commits" ON commits FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = commits.user_id AND users.github_id = auth.uid()::text
));
CREATE POLICY "Users can insert own commits" ON commits FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE users.id = commits.user_id AND users.github_id = auth.uid()::text
));
CREATE POLICY "Users can update own commits" ON commits FOR UPDATE USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = commits.user_id AND users.github_id = auth.uid()::text
));

-- Cron Logs Table
CREATE TABLE cron_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    level VARCHAR(10) DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error', 'success')),
    message TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    source VARCHAR(10) DEFAULT 'system' CHECK (source IN ('scheduler', 'manual', 'auth', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cron_logs
CREATE INDEX idx_cron_logs_user_id ON cron_logs(user_id);
CREATE INDEX idx_cron_logs_created_at ON cron_logs(created_at);
CREATE INDEX idx_cron_logs_level ON cron_logs(level);

-- Policies for cron_logs table
CREATE POLICY "Users can view own logs" ON cron_logs FOR SELECT USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = cron_logs.user_id AND users.github_id = auth.uid()::text
));
CREATE POLICY "Users can insert own logs" ON cron_logs FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM users WHERE users.id = cron_logs.user_id AND users.github_id = auth.uid()::text
));
CREATE POLICY "Users can delete own logs" ON cron_logs FOR DELETE USING (EXISTS (
    SELECT 1 FROM users WHERE users.id = cron_logs.user_id AND users.github_id = auth.uid()::text
));

-- Auto-delete logs older than 30 days
CREATE OR REPLACE FUNCTION delete_old_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM cron_logs WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Note: Manual cleanup required - run this function periodically
-- You can create a Supabase Edge Function or use external scheduler

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commits_updated_at BEFORE UPDATE ON commits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
