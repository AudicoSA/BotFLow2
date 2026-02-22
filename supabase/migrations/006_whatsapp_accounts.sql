-- BotFlow2 SaaS Platform - WhatsApp Accounts Schema
-- Migration: 006_whatsapp_accounts
-- Created: 2024-02-22
-- Description: WhatsApp Business API integration tables

-- ============================================
-- WHATSAPP ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Meta/WhatsApp identifiers
    waba_id VARCHAR(100), -- WhatsApp Business Account ID
    phone_number_id VARCHAR(100),
    display_phone_number VARCHAR(50),
    phone_number_name VARCHAR(255),

    -- Business profile
    business_name VARCHAR(255),
    business_description TEXT,
    business_vertical VARCHAR(100),
    business_address TEXT,
    business_email VARCHAR(255),
    business_website TEXT,
    profile_picture_url TEXT,

    -- Connection details
    channel_id VARCHAR(100) UNIQUE, -- Internal channel identifier
    access_token TEXT, -- Encrypted Meta access token
    token_expires_at TIMESTAMPTZ,

    -- Connection mode
    connection_mode VARCHAR(20) NOT NULL DEFAULT 'embedded_signup',
    -- embedded_signup, qr_code, coexistence

    -- QR code for coexistence mode
    qr_code_data TEXT,
    qr_code_generated_at TIMESTAMPTZ,

    -- Status
    connection_status VARCHAR(20) NOT NULL DEFAULT 'disconnected',
    -- disconnected, connecting, connected, error, suspended
    status_message TEXT,
    last_status_check TIMESTAMPTZ,

    -- Verification
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,

    -- Quality rating
    quality_rating VARCHAR(20), -- GREEN, YELLOW, RED
    messaging_limit VARCHAR(50), -- TIER_1K, TIER_10K, TIER_100K, UNLIMITED

    -- Webhook configuration
    webhook_url TEXT,
    webhook_secret VARCHAR(255),

    -- Message templates
    templates_synced_at TIMESTAMPTZ,

    -- Coexistence mode specific
    coexistence_enabled BOOLEAN DEFAULT FALSE,
    original_phone_linked BOOLEAN DEFAULT FALSE,

    -- Usage stats
    messages_sent_today INTEGER DEFAULT 0,
    messages_received_today INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for whatsapp_accounts
CREATE INDEX idx_whatsapp_accounts_org_id ON whatsapp_accounts(organization_id);
CREATE INDEX idx_whatsapp_accounts_waba_id ON whatsapp_accounts(waba_id);
CREATE INDEX idx_whatsapp_accounts_phone_id ON whatsapp_accounts(phone_number_id);
CREATE INDEX idx_whatsapp_accounts_channel_id ON whatsapp_accounts(channel_id);
CREATE INDEX idx_whatsapp_accounts_connection_status ON whatsapp_accounts(connection_status);
CREATE INDEX idx_whatsapp_accounts_created_at ON whatsapp_accounts(created_at);

-- ============================================
-- WHATSAPP CONTACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,

    -- Contact identifiers
    wa_id VARCHAR(50) NOT NULL, -- WhatsApp ID (phone number without +)
    phone_number VARCHAR(50) NOT NULL,

    -- Profile info
    profile_name VARCHAR(255),
    profile_picture_url TEXT,

    -- Contact details
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    company VARCHAR(255),

    -- Status
    is_blocked BOOLEAN DEFAULT FALSE,
    is_opted_in BOOLEAN DEFAULT TRUE,
    opt_in_at TIMESTAMPTZ,
    opt_out_at TIMESTAMPTZ,

    -- Conversation state
    last_message_at TIMESTAMPTZ,
    unread_count INTEGER DEFAULT 0,

    -- Tags and segments
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',

    -- Import source
    source VARCHAR(50), -- manual, import, sync, chat

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(whatsapp_account_id, wa_id)
);

CREATE INDEX idx_whatsapp_contacts_org_id ON whatsapp_contacts(organization_id);
CREATE INDEX idx_whatsapp_contacts_account_id ON whatsapp_contacts(whatsapp_account_id);
CREATE INDEX idx_whatsapp_contacts_wa_id ON whatsapp_contacts(wa_id);
CREATE INDEX idx_whatsapp_contacts_phone ON whatsapp_contacts(phone_number);
CREATE INDEX idx_whatsapp_contacts_last_message ON whatsapp_contacts(last_message_at DESC NULLS LAST);
CREATE INDEX idx_whatsapp_contacts_tags ON whatsapp_contacts USING gin(tags);

-- ============================================
-- WHATSAPP MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES whatsapp_contacts(id) ON DELETE SET NULL,

    -- Message identifiers
    wamid VARCHAR(100) UNIQUE, -- WhatsApp message ID
    conversation_id VARCHAR(100),

    -- Direction
    direction VARCHAR(10) NOT NULL, -- inbound, outbound

    -- Message type
    message_type VARCHAR(20) NOT NULL,
    -- text, image, video, audio, document, sticker, location, contacts, template, interactive

    -- Content
    text_body TEXT,
    caption TEXT,

    -- Media (if applicable)
    media_id VARCHAR(100),
    media_url TEXT,
    media_mime_type VARCHAR(100),
    media_filename VARCHAR(255),
    media_sha256 VARCHAR(64),

    -- Location (if applicable)
    location_latitude DECIMAL(10, 8),
    location_longitude DECIMAL(11, 8),
    location_name VARCHAR(255),
    location_address TEXT,

    -- Template (if applicable)
    template_name VARCHAR(100),
    template_language VARCHAR(10),
    template_components JSONB,

    -- Interactive (if applicable)
    interactive_type VARCHAR(50), -- button, list, product, etc.
    interactive_body JSONB,

    -- Delivery status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, sent, delivered, read, failed
    status_timestamp TIMESTAMPTZ,
    error_code VARCHAR(20),
    error_message TEXT,

    -- Pricing
    pricing_model VARCHAR(20), -- CBP, NBP
    pricing_category VARCHAR(50), -- business_initiated, user_initiated, etc.

    -- Metadata
    context_message_id VARCHAR(100), -- Reply to message ID
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for whatsapp_messages
CREATE INDEX idx_whatsapp_messages_org_id ON whatsapp_messages(organization_id);
CREATE INDEX idx_whatsapp_messages_account_id ON whatsapp_messages(whatsapp_account_id);
CREATE INDEX idx_whatsapp_messages_contact_id ON whatsapp_messages(contact_id);
CREATE INDEX idx_whatsapp_messages_wamid ON whatsapp_messages(wamid);
CREATE INDEX idx_whatsapp_messages_conversation_id ON whatsapp_messages(conversation_id);
CREATE INDEX idx_whatsapp_messages_direction ON whatsapp_messages(direction);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- Composite index for conversation thread
CREATE INDEX idx_whatsapp_messages_thread ON whatsapp_messages(contact_id, created_at DESC);

-- ============================================
-- WHATSAPP MESSAGE TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    whatsapp_account_id UUID NOT NULL REFERENCES whatsapp_accounts(id) ON DELETE CASCADE,

    -- Template identifiers
    template_id VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) NOT NULL,

    -- Category
    category VARCHAR(50) NOT NULL,
    -- AUTHENTICATION, MARKETING, UTILITY

    -- Status
    status VARCHAR(20) NOT NULL,
    -- APPROVED, PENDING, REJECTED, DISABLED

    -- Content
    components JSONB NOT NULL DEFAULT '[]',
    -- [{"type": "HEADER", "format": "TEXT", "text": "..."}, ...]

    -- Quality
    quality_score JSONB,

    -- Rejection reason
    rejected_reason TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(whatsapp_account_id, name, language)
);

CREATE INDEX idx_whatsapp_templates_org_id ON whatsapp_templates(organization_id);
CREATE INDEX idx_whatsapp_templates_account_id ON whatsapp_templates(whatsapp_account_id);
CREATE INDEX idx_whatsapp_templates_name ON whatsapp_templates(name);
CREATE INDEX idx_whatsapp_templates_status ON whatsapp_templates(status);
CREATE INDEX idx_whatsapp_templates_category ON whatsapp_templates(category);

-- ============================================
-- FUNCTION: Update contact on message
-- ============================================
CREATE OR REPLACE FUNCTION update_contact_on_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.contact_id IS NOT NULL THEN
        UPDATE whatsapp_contacts
        SET
            last_message_at = NEW.created_at,
            unread_count = CASE
                WHEN NEW.direction = 'inbound' THEN unread_count + 1
                ELSE 0
            END,
            updated_at = NOW()
        WHERE id = NEW.contact_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_contact_on_message
    AFTER INSERT ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_on_message();

-- ============================================
-- FUNCTION: Update daily message counts
-- ============================================
CREATE OR REPLACE FUNCTION update_whatsapp_daily_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direction = 'outbound' THEN
        UPDATE whatsapp_accounts
        SET messages_sent_today = messages_sent_today + 1,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.whatsapp_account_id;
    ELSE
        UPDATE whatsapp_accounts
        SET messages_received_today = messages_received_today + 1,
            last_message_at = NEW.created_at,
            updated_at = NOW()
        WHERE id = NEW.whatsapp_account_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_whatsapp_daily_counts
    AFTER INSERT ON whatsapp_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_daily_counts();
