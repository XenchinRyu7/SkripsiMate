-- SkripsiMate Database Schema v2
-- Additional tables for pricing, coupons, and collaboration

-- ============================================
-- PRICING & SUBSCRIPTIONS
-- ============================================

-- User subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'trial')) DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Limits based on plan
  max_projects INTEGER NOT NULL DEFAULT 5,
  max_nodes_per_project INTEGER NOT NULL DEFAULT 500,
  max_team_members INTEGER NOT NULL DEFAULT 1,
  api_requests_limit INTEGER NOT NULL DEFAULT 1000,
  
  UNIQUE(user_id)
);

-- Coupon codes table (for judges and early access)
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
  duration_months INTEGER NOT NULL DEFAULT 1,
  max_redemptions INTEGER DEFAULT 1,
  current_redemptions INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_by TEXT, -- admin user_id
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupon redemptions history
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES coupon_codes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  subscription_id UUID REFERENCES user_subscriptions(id),
  
  UNIQUE(coupon_id, user_id)
);

-- ============================================
-- COLLABORATION SYSTEM
-- ============================================

-- Project members table (owner + collaborators)
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')) DEFAULT 'viewer',
  invited_by TEXT, -- user_id of inviter
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'removed')) DEFAULT 'pending',
  
  UNIQUE(project_id, user_id)
);

-- Collaboration invitations
CREATE TABLE IF NOT EXISTS collaboration_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  inviter_id TEXT NOT NULL,
  invitee_email TEXT NOT NULL,
  invitee_id TEXT, -- populated when invite is accepted
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')) DEFAULT 'viewer',
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined', 'expired')) DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

-- ============================================
-- ADMIN SYSTEM
-- ============================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')) DEFAULT 'admin',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- USAGE TRACKING
-- ============================================

-- API usage tracking (for rate limiting)
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_api_usage_user_date ON api_usage(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupon_codes(code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON collaboration_invites(token) WHERE status = 'pending';

-- ============================================
-- RLS POLICIES (Add to existing ones)
-- ============================================

-- User subscriptions: users can only see their own
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON user_subscriptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Coupon codes: everyone can read active codes
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON coupon_codes
  FOR SELECT USING (is_active = TRUE AND (expires_at IS NULL OR expires_at > NOW()));

-- Redemptions: users can only see their own
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own redemptions" ON coupon_redemptions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Project members: users can see members of their projects
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()::text
    )
  );

-- Collaboration invites: users can see invites for their projects or to them
ALTER TABLE collaboration_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant invites" ON collaboration_invites
  FOR SELECT USING (
    inviter_id = auth.uid()::text OR 
    invitee_id = auth.uid()::text OR
    invitee_email = auth.jwt()->>'email'
  );

-- Admin tables: only admins can access (we'll handle this in API)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins access admin tables" ON admin_users
  FOR ALL USING (
    user_id IN (SELECT user_id FROM admin_users WHERE user_id = auth.uid()::text)
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = check_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check subscription status
CREATE OR REPLACE FUNCTION check_user_subscription(check_user_id TEXT)
RETURNS TABLE (
  plan TEXT,
  status TEXT,
  is_active BOOLEAN,
  max_projects INTEGER,
  max_nodes_per_project INTEGER,
  max_team_members INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.plan,
    us.status,
    (us.status = 'active' AND us.current_period_end > NOW()) as is_active,
    us.max_projects,
    us.max_nodes_per_project,
    us.max_team_members
  FROM user_subscriptions us
  WHERE us.user_id = check_user_id;
  
  -- Return free plan if no subscription found
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'free'::TEXT, 
      'active'::TEXT, 
      TRUE, 
      999999, 
      999999, 
      1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to redeem coupon
CREATE OR REPLACE FUNCTION redeem_coupon(
  coupon_code_input TEXT,
  user_id_input TEXT
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  subscription_id UUID
) AS $$
DECLARE
  v_coupon_id UUID;
  v_plan TEXT;
  v_duration INTEGER;
  v_max_redemptions INTEGER;
  v_current_redemptions INTEGER;
  v_subscription_id UUID;
BEGIN
  -- Check if coupon exists and is valid
  SELECT id, plan, duration_months, max_redemptions, current_redemptions
  INTO v_coupon_id, v_plan, v_duration, v_max_redemptions, v_current_redemptions
  FROM coupon_codes
  WHERE code = coupon_code_input
    AND is_active = TRUE
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_redemptions IS NULL OR current_redemptions < max_redemptions);
  
  IF v_coupon_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Invalid or expired coupon code'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Check if already redeemed by this user
  IF EXISTS (SELECT 1 FROM coupon_redemptions WHERE coupon_id = v_coupon_id AND user_id = user_id_input) THEN
    RETURN QUERY SELECT FALSE, 'Coupon already redeemed'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Create or update subscription
  INSERT INTO user_subscriptions (
    user_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    max_projects,
    max_nodes_per_project,
    max_team_members,
    api_requests_limit
  ) VALUES (
    user_id_input,
    v_plan,
    'active',
    NOW(),
    NOW() + (v_duration || ' months')::INTERVAL,
    CASE v_plan
      WHEN 'starter' THEN 5
      WHEN 'pro' THEN 999999
      WHEN 'enterprise' THEN 999999
      ELSE 5
    END,
    CASE v_plan
      WHEN 'starter' THEN 500
      WHEN 'pro' THEN 5000
      WHEN 'enterprise' THEN 999999
      ELSE 500
    END,
    CASE v_plan
      WHEN 'starter' THEN 1
      WHEN 'pro' THEN 3
      WHEN 'enterprise' THEN 999999
      ELSE 1
    END,
    CASE v_plan
      WHEN 'starter' THEN 1000
      WHEN 'pro' THEN 10000
      WHEN 'enterprise' THEN 999999
      ELSE 1000
    END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan = EXCLUDED.plan,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    updated_at = NOW()
  RETURNING id INTO v_subscription_id;
  
  -- Record redemption
  INSERT INTO coupon_redemptions (coupon_id, user_id, subscription_id)
  VALUES (v_coupon_id, user_id_input, v_subscription_id);
  
  -- Update coupon redemption count
  UPDATE coupon_codes
  SET current_redemptions = current_redemptions + 1
  WHERE id = v_coupon_id;
  
  RETURN QUERY SELECT TRUE, 'Coupon redeemed successfully!'::TEXT, v_subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Initial Setup)
-- ============================================

-- Create initial admin (replace with your Firebase UID)
-- INSERT INTO admin_users (user_id, email, role, permissions)
-- VALUES ('YOUR_FIREBASE_UID', 'your@email.com', 'super_admin', '["all"]'::jsonb);

-- Create sample coupons for judges
-- INSERT INTO coupon_codes (code, description, plan, duration_months, max_redemptions)
-- VALUES 
--   ('JUDGE2024', 'Hackathon Judge Access', 'pro', 3, 10),
--   ('EARLYBIRD', 'Early Access PRO', 'pro', 1, 50);

