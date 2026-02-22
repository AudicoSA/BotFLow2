-- BotFlow2 SaaS Platform - Subscriptions Schema
-- Migration: 002_subscriptions
-- Created: 2024-02-22
-- Description: Subscription management with Paystack integration

-- ============================================
-- SUBSCRIPTION PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_plans (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'ai-assistant', 'whatsapp-assistant', 'receipt-assistant', 'bundle'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_cents INTEGER NOT NULL, -- Price in ZAR cents
    currency VARCHAR(3) DEFAULT 'ZAR',
    interval VARCHAR(20) NOT NULL DEFAULT 'monthly', -- monthly, yearly
    interval_count INTEGER DEFAULT 1,
    paystack_plan_code VARCHAR(100) UNIQUE,
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}', -- e.g., {"ai_tokens": 500000, "whatsapp_messages": 5000}
    is_active BOOLEAN DEFAULT TRUE,
    is_per_user BOOLEAN DEFAULT FALSE, -- For receipt-assistant per-user pricing
    trial_days INTEGER DEFAULT 14,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX idx_subscription_plans_paystack_code ON subscription_plans(paystack_plan_code);

-- Insert default plans
INSERT INTO subscription_plans (id, name, description, price_cents, paystack_plan_code, features, limits, sort_order) VALUES
('ai-assistant', 'AI Assistant', 'Intelligent AI-powered conversations for your business', 49900, NULL,
    '["GPT-4 powered conversations", "Custom system prompts", "Conversation history", "500K tokens/month included", "API access"]',
    '{"ai_tokens": 500000, "ai_conversations": -1}', 1),
('whatsapp-assistant', 'WhatsApp Assistant', 'Automated WhatsApp Business messaging', 49900, NULL,
    '["WhatsApp Business API", "QR code onboarding", "Automated responses", "5000 messages/month", "Contact sync"]',
    '{"whatsapp_messages": 5000}', 2),
('receipt-assistant', 'Receipt Assistant', 'OCR-powered expense tracking per user', 9900, NULL,
    '["Receipt OCR processing", "Expense categorization", "Export to CSV/PDF", "Reimbursement tracking"]',
    '{"receipts_per_month": -1}', 3),
('bundle', 'Complete Bundle', 'All services at a discounted rate', 89900, NULL,
    '["All AI Assistant features", "All WhatsApp Assistant features", "All Receipt Assistant features", "Priority support", "Custom integrations"]',
    '{"ai_tokens": 1000000, "whatsapp_messages": 10000, "receipts_per_month": -1}', 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_cents = EXCLUDED.price_cents,
    features = EXCLUDED.features,
    limits = EXCLUDED.limits,
    updated_at = NOW();

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Primary account holder
    plan_id VARCHAR(50) NOT NULL REFERENCES subscription_plans(id),

    -- Paystack integration fields
    paystack_subscription_code VARCHAR(100) UNIQUE,
    paystack_customer_code VARCHAR(100),
    paystack_authorization_code VARCHAR(100),
    paystack_email_token VARCHAR(100),

    -- Status and lifecycle
    status VARCHAR(20) NOT NULL DEFAULT 'trialing',
    -- trialing, active, past_due, cancelled, unpaid, paused

    -- Billing period
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,

    -- Trial management
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,

    -- Cancellation
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancellation_feedback TEXT,

    -- Quantity (for per-user plans like receipt-assistant)
    quantity INTEGER DEFAULT 1,

    -- Pause functionality
    paused_at TIMESTAMPTZ,
    resume_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_org_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_paystack_code ON subscriptions(paystack_subscription_code);
CREATE INDEX idx_subscriptions_paystack_customer ON subscriptions(paystack_customer_code);
CREATE INDEX idx_subscriptions_period_end ON subscriptions(current_period_end);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);

-- Composite index for active subscriptions per org
CREATE INDEX idx_subscriptions_org_active ON subscriptions(organization_id, status) WHERE status IN ('trialing', 'active');

-- ============================================
-- PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Paystack transaction details
    paystack_reference VARCHAR(100) UNIQUE NOT NULL,
    paystack_transaction_id BIGINT,
    paystack_authorization_code VARCHAR(100),

    -- Amount and currency
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Status
    status VARCHAR(20) NOT NULL, -- success, failed, pending, refunded

    -- Payment method details
    payment_channel VARCHAR(50), -- card, bank, ussd, qr, mobile_money, etc.
    card_type VARCHAR(20),
    card_last_four VARCHAR(4),
    bank_name VARCHAR(100),

    -- Dates
    paid_at TIMESTAMPTZ,

    -- Invoice reference
    invoice_id UUID,

    -- Failure details
    failure_reason TEXT,
    gateway_response TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_history_subscription_id ON payment_history(subscription_id);
CREATE INDEX idx_payment_history_org_id ON payment_history(organization_id);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_paystack_ref ON payment_history(paystack_reference);
CREATE INDEX idx_payment_history_status ON payment_history(status);
CREATE INDEX idx_payment_history_paid_at ON payment_history(paid_at);
CREATE INDEX idx_payment_history_created_at ON payment_history(created_at);

-- ============================================
-- PAYMENT METHODS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Paystack authorization
    paystack_authorization_code VARCHAR(100) NOT NULL,
    paystack_signature VARCHAR(255),

    -- Card details (masked)
    card_type VARCHAR(20), -- visa, mastercard, verve, etc.
    card_last_four VARCHAR(4),
    card_exp_month INTEGER,
    card_exp_year INTEGER,
    bank_name VARCHAR(100),

    -- Billing info
    card_holder_name VARCHAR(255),
    billing_email VARCHAR(255),

    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_reusable BOOLEAN DEFAULT TRUE,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX idx_payment_methods_org_id ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_default ON payment_methods(user_id, is_default) WHERE is_default = TRUE;

-- ============================================
-- SUBSCRIPTION CHANGES/AUDIT LOG
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    change_type VARCHAR(50) NOT NULL, -- created, upgraded, downgraded, cancelled, reactivated, paused, resumed
    from_plan_id VARCHAR(50),
    to_plan_id VARCHAR(50),
    from_status VARCHAR(20),
    to_status VARCHAR(20),
    from_quantity INTEGER,
    to_quantity INTEGER,
    proration_amount_cents INTEGER,
    changed_by UUID REFERENCES users(id),
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscription_changes_sub_id ON subscription_changes(subscription_id);
CREATE INDEX idx_subscription_changes_type ON subscription_changes(change_type);
CREATE INDEX idx_subscription_changes_created_at ON subscription_changes(created_at);
