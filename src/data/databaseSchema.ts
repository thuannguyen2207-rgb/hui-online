export const POSTGRES_SCHEMA_SQL = `-- ==============================================================================
-- DATABASE SCHEMA: QUẢN LÝ & CHƠI HỤI TRỰC TUYẾN (POSTGRESQL / SUPABASE)
-- Designed for High Precision Financial Ledger & Realtime Bidding System
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CREATE TYPE ENUMS
CREATE TYPE user_role AS ENUM ('chu_hui', 'hui_vien');
CREATE TYPE cycle_type AS ENUM ('daily', 'weekly', 'monthly', 'custom');
CREATE TYPE fee_type AS ENUM ('percent_payout', 'percent_value', 'fixed_amount');
CREATE TYPE bid_limit_type AS ENUM ('amount', 'percent');
CREATE TYPE tie_break_rule AS ENUM ('earliest', 'random');
CREATE TYPE hui_status AS ENUM ('recruiting', 'active', 'completed', 'cancelled');
CREATE TYPE member_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE round_status AS ENUM ('bidding', 'calculating', 'payment_pending', 'completed');
CREATE TYPE bid_status AS ENUM ('active', 'won', 'lost', 'tied_lost');
CREATE TYPE transaction_status AS ENUM ('unpaid', 'pending_approval', 'confirmed');
CREATE TYPE message_type AS ENUM ('text', 'bid_notice', 'payout_notice', 'payment_proof', 'system_alert');

-- ------------------------------------------------------------------------------
-- TABLE 1: USERS (Người Dùng System)
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'hui_vien',
    avatar TEXT,
    verified BOOLEAN DEFAULT FALSE,
    bank_name VARCHAR(50),
    account_number VARCHAR(50),
    account_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast phone login lookup
CREATE INDEX idx_users_phone ON users(phone);

-- ------------------------------------------------------------------------------
-- TABLE 2: HUI_DAYS (Dây Hụi & Dynamic Configuration)
-- ------------------------------------------------------------------------------
CREATE TABLE hui_days (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    host_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    total_shares INT NOT NULL CHECK (total_shares >= 3), -- N: Tổng số phần hụi
    share_amount NUMERIC(15, 2) NOT NULL CHECK (share_amount > 0), -- V: Giá trị chuẩn
    cycle_type cycle_type NOT NULL DEFAULT 'monthly',
    cycle_days INT DEFAULT 30,
    
    -- Dynamic Fee Configuration (Phí Thảo)
    fee_type fee_type NOT NULL DEFAULT 'percent_value',
    fee_value NUMERIC(15, 2) NOT NULL DEFAULT 0, -- % hoặc VNĐ
    
    -- Dynamic Bid Limits (Trần / Sàn nộp thăm)
    min_bid_type bid_limit_type NOT NULL DEFAULT 'amount',
    min_bid_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    max_bid_type bid_limit_type NOT NULL DEFAULT 'percent',
    max_bid_value NUMERIC(15, 2) NOT NULL DEFAULT 30, -- Mặc định trần 30%
    
    -- Tie Break Rule (Quy tắc xử lý hòa giá)
    tie_break_rule tie_break_rule NOT NULL DEFAULT 'earliest',
    
    start_date DATE NOT NULL,
    current_round INT DEFAULT 1,
    status hui_status DEFAULT 'recruiting',
    invite_code VARCHAR(12) UNIQUE NOT NULL,
    
    -- VietQR Banking config for Host
    bank_name VARCHAR(50) NOT NULL,
    bank_code VARCHAR(20) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_name VARCHAR(100) NOT NULL,
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hui_days_host ON hui_days(host_id);
CREATE INDEX idx_hui_days_invite ON hui_days(invite_code);

-- ------------------------------------------------------------------------------
-- TABLE 3: HUI_MEMBERS (Hội Viên Trong Dây Hụi)
-- ------------------------------------------------------------------------------
CREATE TABLE hui_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hui_day_id UUID NOT NULL REFERENCES hui_days(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    shares_count INT NOT NULL DEFAULT 1 CHECK (shares_count >= 1),
    has_payout BOOLEAN DEFAULT FALSE, -- FALSE = Hụi Sống, TRUE = Hụi Chết
    payout_round INT, -- Kỳ đã hốt
    status member_status DEFAULT 'pending',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hui_day_id, user_id)
);

CREATE INDEX idx_hui_members_day ON hui_members(hui_day_id);
CREATE INDEX idx_hui_members_user ON hui_members(user_id);

-- ------------------------------------------------------------------------------
-- TABLE 4: HUI_ROUNDS (Sổ Hụi Theo Kỳ & Kết Quả Đấu Hụi)
-- ------------------------------------------------------------------------------
CREATE TABLE hui_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hui_day_id UUID NOT NULL REFERENCES hui_days(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    open_date TIMESTAMPTZ NOT NULL,
    bid_close_time TIMESTAMPTZ NOT NULL,
    payment_due_date TIMESTAMPTZ NOT NULL,
    status round_status DEFAULT 'bidding',
    
    winning_bid_amount NUMERIC(15, 2), -- T: Mức tiền đấu giá thắng
    winner_member_id UUID REFERENCES hui_members(id),
    
    -- Calculated Financial Snapshot
    total_dead_shares INT DEFAULT 0,
    total_live_shares INT DEFAULT 0,
    dead_contribution_per_share NUMERIC(15, 2) DEFAULT 0, -- V
    live_contribution_per_share NUMERIC(15, 2) DEFAULT 0, -- V - T
    host_commission NUMERIC(15, 2) DEFAULT 0, -- Phí Thảo
    winner_gross_payout NUMERIC(15, 2) DEFAULT 0, -- Tổng thu gom
    winner_net_payout NUMERIC(15, 2) DEFAULT 0, -- R: Thực nhận người hốt
    
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(hui_day_id, round_number)
);

CREATE INDEX idx_hui_rounds_day ON hui_rounds(hui_day_id);

-- ------------------------------------------------------------------------------
-- TABLE 5: BIDS (Lịch Sử Nộp Thăm / Bỏ Giá Đấu Hụi)
-- ------------------------------------------------------------------------------
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES hui_rounds(id) ON DELETE CASCADE,
    hui_day_id UUID NOT NULL REFERENCES hui_days(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES hui_members(id) ON DELETE CASCADE,
    bid_amount NUMERIC(15, 2) NOT NULL CHECK (bid_amount >= 0), -- T
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status bid_status DEFAULT 'active'
);

CREATE INDEX idx_bids_round ON bids(round_id);
CREATE INDEX idx_bids_member ON bids(member_id);

-- ------------------------------------------------------------------------------
-- TABLE 6: TRANSACTIONS (Giao Dịch Đóng Tiền & VietQR Gạch Nợ)
-- ------------------------------------------------------------------------------
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES hui_rounds(id) ON DELETE CASCADE,
    hui_day_id UUID NOT NULL REFERENCES hui_days(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES hui_members(id) ON DELETE CASCADE,
    shares_count INT NOT NULL DEFAULT 1,
    is_dead_hui BOOLEAN NOT NULL DEFAULT FALSE, -- True: V, False: V - T
    amount_due NUMERIC(15, 2) NOT NULL,
    status transaction_status DEFAULT 'unpaid',
    payment_proof_url TEXT,
    vietqr_code TEXT NOT NULL,
    payment_ref VARCHAR(100) NOT NULL, -- Cú pháp gạch nợ (ví dụ: HUI T3 K1 NGUYENVANA)
    paid_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tx_round ON transactions(round_id);
CREATE INDEX idx_tx_member ON transactions(member_id);
CREATE INDEX idx_tx_ref ON transactions(payment_ref);

-- ------------------------------------------------------------------------------
-- TABLE 7: CHAT_MESSAGES (Nhóm Chat Realtime & Thông Báo System)
-- ------------------------------------------------------------------------------
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hui_day_id UUID NOT NULL REFERENCES hui_days(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(20) NOT NULL, -- chu_hui, hui_vien, system
    message TEXT NOT NULL,
    msg_type message_type DEFAULT 'text',
    extra_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_day ON chat_messages(hui_day_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hui_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE hui_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hui_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Users: Ai cũng đọc thông tin công khai cơ bản, sửa thông tin cá nhân mình
CREATE POLICY "Users can read all user profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Hui Days: Mọi người xem dây hụi công khai/có code, Chủ hụi quản lý dây của mình
CREATE POLICY "Members and public can view active hui days" ON hui_days FOR SELECT USING (true);
CREATE POLICY "Host can insert/update own hui days" ON hui_days FOR ALL USING (auth.uid() = host_id);

-- Hui Members: Xem danh sách hội viên nếu là thành viên/chủ hụi
CREATE POLICY "View members of joined hui" ON hui_members FOR SELECT USING (true);
CREATE POLICY "Users can apply to join" ON hui_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Host can approve or reject members" ON hui_members FOR UPDATE USING (
    EXISTS (SELECT 1 FROM hui_days WHERE id = hui_day_id AND host_id = auth.uid())
);

-- Bids: Đấu hụi bí mật (Chỉ Chủ hụi hoặc chính mình mới xem được giá bỏ thăm đến khi chốt kỳ)
CREATE POLICY "View own bids or host view all bids" ON bids FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM hui_members WHERE id = member_id) OR
    EXISTS (SELECT 1 FROM hui_days WHERE id = hui_day_id AND host_id = auth.uid())
);
CREATE POLICY "Members can submit bids during bidding phase" ON bids FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM hui_members WHERE id = member_id)
);

-- Transactions: Xem & thanh toán tiền đóng kỳ
CREATE POLICY "View transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Members mark paid" ON transactions FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM hui_members WHERE id = member_id) OR
    EXISTS (SELECT 1 FROM hui_days WHERE id = hui_day_id AND host_id = auth.uid())
);

-- Chat: Mọi người trong dây hụi được chat
CREATE POLICY "Chat view & insert for members" ON chat_messages FOR ALL USING (true);
`;
