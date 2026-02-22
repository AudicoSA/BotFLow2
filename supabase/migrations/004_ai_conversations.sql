-- BotFlow2 SaaS Platform - AI Conversations Schema
-- Migration: 004_ai_conversations
-- Created: 2024-02-22
-- Description: AI Assistant chat history and system prompts

-- ============================================
-- SYSTEM PROMPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS system_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Prompt details
    name VARCHAR(100) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,

    -- Category
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    -- general, customer_support, sales, technical, creative, custom

    -- Settings
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Variables for templating
    variables JSONB DEFAULT '[]',
    -- [{"name": "business_name", "description": "...", "required": true, "default_value": ""}]

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_system_prompts_org_id ON system_prompts(organization_id);
CREATE INDEX idx_system_prompts_category ON system_prompts(category);
CREATE INDEX idx_system_prompts_default ON system_prompts(organization_id, is_default) WHERE is_default = TRUE;
CREATE INDEX idx_system_prompts_active ON system_prompts(organization_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- AI CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Conversation details
    title VARCHAR(255) NOT NULL DEFAULT 'New Conversation',
    summary TEXT, -- AI-generated summary

    -- Model configuration
    model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    -- gpt-4, gpt-4-turbo, gpt-4o, gpt-3.5-turbo

    -- System prompt
    system_prompt_id UUID REFERENCES system_prompts(id) ON DELETE SET NULL,
    system_prompt_content TEXT, -- Snapshot of the system prompt used

    -- Token tracking
    total_tokens INTEGER DEFAULT 0,
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    estimated_cost_cents INTEGER DEFAULT 0,

    -- Message count
    message_count INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_pinned BOOLEAN DEFAULT FALSE,

    -- Sharing
    is_shared BOOLEAN DEFAULT FALSE,
    share_token VARCHAR(100),

    -- Last activity
    last_message_at TIMESTAMPTZ,

    -- Metadata
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for ai_conversations
CREATE INDEX idx_ai_conversations_org_id ON ai_conversations(organization_id);
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_model ON ai_conversations(model);
CREATE INDEX idx_ai_conversations_prompt_id ON ai_conversations(system_prompt_id);
CREATE INDEX idx_ai_conversations_active ON ai_conversations(organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_ai_conversations_archived ON ai_conversations(organization_id, is_archived);
CREATE INDEX idx_ai_conversations_last_message ON ai_conversations(last_message_at DESC);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at);
CREATE INDEX idx_ai_conversations_share_token ON ai_conversations(share_token) WHERE share_token IS NOT NULL;

-- Composite index for user's recent conversations
CREATE INDEX idx_ai_conversations_user_recent ON ai_conversations(user_id, last_message_at DESC NULLS LAST)
    WHERE is_active = TRUE AND is_archived = FALSE;

-- ============================================
-- CONVERSATION MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Message details
    role VARCHAR(20) NOT NULL,
    -- system, user, assistant
    content TEXT NOT NULL,

    -- Token counts
    token_count INTEGER DEFAULT 0,
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,

    -- For assistant messages
    model VARCHAR(50),
    finish_reason VARCHAR(20),
    -- stop, length, content_filter

    -- Feedback
    user_rating INTEGER, -- 1-5 stars
    user_feedback TEXT,

    -- Processing status (for streaming)
    is_complete BOOLEAN DEFAULT TRUE,

    -- Parent message for threading (optional)
    parent_message_id UUID REFERENCES conversation_messages(id) ON DELETE SET NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for conversation_messages
CREATE INDEX idx_conv_messages_conversation_id ON conversation_messages(conversation_id);
CREATE INDEX idx_conv_messages_org_id ON conversation_messages(organization_id);
CREATE INDEX idx_conv_messages_role ON conversation_messages(role);
CREATE INDEX idx_conv_messages_created_at ON conversation_messages(created_at);

-- Composite index for conversation thread
CREATE INDEX idx_conv_messages_thread ON conversation_messages(conversation_id, created_at);

-- ============================================
-- CONVERSATION ATTACHMENTS TABLE (for future use)
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES conversation_messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,

    -- File details
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    file_url TEXT NOT NULL,

    -- Processing status
    status VARCHAR(20) DEFAULT 'uploaded',
    -- uploaded, processing, processed, failed

    -- Extracted content (for document/image analysis)
    extracted_content TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_conv_attachments_message_id ON conversation_attachments(message_id);
CREATE INDEX idx_conv_attachments_conversation_id ON conversation_attachments(conversation_id);

-- ============================================
-- FUNCTION: Update conversation stats
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE ai_conversations
    SET
        message_count = message_count + 1,
        total_tokens = total_tokens + COALESCE(NEW.token_count, 0),
        total_input_tokens = total_input_tokens + COALESCE(NEW.input_tokens, 0),
        total_output_tokens = total_output_tokens + COALESCE(NEW.output_tokens, 0),
        last_message_at = NEW.created_at,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_conversation_stats
    AFTER INSERT ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_stats();

-- ============================================
-- FUNCTION: Generate conversation title from first message
-- ============================================
CREATE OR REPLACE FUNCTION generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
    first_msg TEXT;
    conv_title TEXT;
BEGIN
    -- Only update title if it's still the default
    SELECT title INTO conv_title FROM ai_conversations WHERE id = NEW.conversation_id;

    IF conv_title = 'New Conversation' AND NEW.role = 'user' THEN
        first_msg := LEFT(NEW.content, 50);
        IF LENGTH(NEW.content) > 50 THEN
            first_msg := first_msg || '...';
        END IF;

        UPDATE ai_conversations
        SET title = first_msg, updated_at = NOW()
        WHERE id = NEW.conversation_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_conversation_title
    AFTER INSERT ON conversation_messages
    FOR EACH ROW
    EXECUTE FUNCTION generate_conversation_title();
