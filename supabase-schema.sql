-- Supabase Database Schema for Zalo Group Automation

-- 1. Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  scan_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-automation',
  send_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-sent-text-image',
  invite_webhook VARCHAR(500) DEFAULT '/api/webhook/zalo-invite-member',
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_nicks table
CREATE TABLE user_nicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nick_name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create scheduled_posts table
CREATE TABLE scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB,
  image_count INTEGER DEFAULT 0,
  groups JSONB NOT NULL,
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('once', 'weekly')),
  schedule_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  nick_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create saved_posts table
CREATE TABLE saved_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  images JSONB,
  image_count INTEGER DEFAULT 0,
  nick_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create activity_logs table
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_user_nicks_user_id ON user_nicks(user_id);
CREATE INDEX idx_user_nicks_active ON user_nicks(is_active);
CREATE INDEX idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_saved_posts_user_id ON saved_posts(user_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create trigger for users table
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert default admin user (password: admin@123 hashed with bcrypt)
INSERT INTO users (username, password, full_name, status, is_admin) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'active', TRUE);

-- 10. Insert demo user (password: demo123 hashed with bcrypt)
INSERT INTO users (username, password, full_name, status) 
VALUES ('demo', '$2a$10$4X9Hg8Dq5Q2YWVH5oGX6Ruy7xUZJ9Pt8vB2QrC1Xx6KjN3Fg7HtSa', 'Demo User', 'active');

-- 11. Get demo user ID and insert nicks
DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE username = 'demo';
    
    INSERT INTO user_nicks (user_id, nick_name) VALUES
    (demo_user_id, 'test'),
    (demo_user_id, 'Dương Nguyễn'),
    (demo_user_id, 'Đức Phòng'),
    (demo_user_id, 'Khánh Duy');
END $$;

-- 12. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_nicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- 13. Create RLS policies (basic - can be customized)
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);

-- For development, allow all operations (remove in production)
CREATE POLICY "Allow all operations for development" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for user_nicks" ON user_nicks FOR ALL USING (true);
CREATE POLICY "Allow all operations for scheduled_posts" ON scheduled_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations for saved_posts" ON saved_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations for activity_logs" ON activity_logs FOR ALL USING (true); 