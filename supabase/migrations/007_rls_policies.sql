-- BotFlow2 SaaS Platform - Row Level Security Policies
-- Migration: 007_rls_policies
-- Created: 2024-02-22
-- Description: RLS policies for multi-tenant data isolation

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_processing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTION: Get user's organization IDs
-- ============================================
CREATE OR REPLACE FUNCTION get_user_organization_ids(user_uuid UUID)
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id
    FROM organization_members
    WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user is org member
-- ============================================
CREATE OR REPLACE FUNCTION is_organization_member(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = user_uuid AND organization_id = org_uuid
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION: Check if user is org admin/owner
-- ============================================
CREATE OR REPLACE FUNCTION is_organization_admin(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members
        WHERE user_id = user_uuid
        AND organization_id = org_uuid
        AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ORGANIZATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view organizations they belong to"
    ON organizations FOR SELECT
    USING (id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can update their organizations"
    ON organizations FOR UPDATE
    USING (is_organization_admin(auth.uid(), id));

-- ============================================
-- USERS POLICIES
-- ============================================
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can view members of their organizations"
    ON users FOR SELECT
    USING (
        id IN (
            SELECT om.user_id FROM organization_members om
            WHERE om.organization_id IN (SELECT get_user_organization_ids(auth.uid()))
        )
    );

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (id = auth.uid());

-- ============================================
-- ORGANIZATION MEMBERS POLICIES
-- ============================================
CREATE POLICY "Users can view members of their organizations"
    ON organization_members FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization members"
    ON organization_members FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- USER SESSIONS POLICIES
-- ============================================
CREATE POLICY "Users can manage their own sessions"
    ON user_sessions FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- SUBSCRIPTION PLANS POLICIES (public read)
-- ============================================
CREATE POLICY "Anyone can view active subscription plans"
    ON subscription_plans FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- SUBSCRIPTIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization subscriptions"
    ON subscriptions FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization subscriptions"
    ON subscriptions FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- PAYMENT HISTORY POLICIES
-- ============================================
CREATE POLICY "Users can view their organization payment history"
    ON payment_history FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- PAYMENT METHODS POLICIES
-- ============================================
CREATE POLICY "Users can manage their own payment methods"
    ON payment_methods FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Users can view organization payment methods"
    ON payment_methods FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- SUBSCRIPTION CHANGES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization subscription changes"
    ON subscription_changes FOR SELECT
    USING (
        subscription_id IN (
            SELECT id FROM subscriptions
            WHERE organization_id IN (SELECT get_user_organization_ids(auth.uid()))
        )
    );

-- ============================================
-- USAGE RECORDS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization usage"
    ON usage_records FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- Insert is allowed for service accounts (handled by service role)
CREATE POLICY "Service can insert usage records"
    ON usage_records FOR INSERT
    WITH CHECK (TRUE); -- Will be restricted to service role key

-- ============================================
-- USAGE AGGREGATES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization usage aggregates"
    ON usage_aggregates FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- INVOICES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization invoices"
    ON invoices FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- BILLING JOBS POLICIES
-- ============================================
CREATE POLICY "Admins can view their organization billing jobs"
    ON billing_jobs FOR SELECT
    USING (
        organization_id IN (SELECT get_user_organization_ids(auth.uid()))
        AND is_organization_admin(auth.uid(), organization_id)
    );

-- ============================================
-- SYSTEM PROMPTS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization system prompts"
    ON system_prompts FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization system prompts"
    ON system_prompts FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- AI CONVERSATIONS POLICIES
-- ============================================
CREATE POLICY "Users can view their own conversations"
    ON ai_conversations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can view shared conversations in their org"
    ON ai_conversations FOR SELECT
    USING (
        is_shared = TRUE
        AND organization_id IN (SELECT get_user_organization_ids(auth.uid()))
    );

CREATE POLICY "Users can manage their own conversations"
    ON ai_conversations FOR ALL
    USING (user_id = auth.uid());

-- ============================================
-- CONVERSATION MESSAGES POLICIES
-- ============================================
CREATE POLICY "Users can view messages in their conversations"
    ON conversation_messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT id FROM ai_conversations
            WHERE user_id = auth.uid()
            OR (is_shared = TRUE AND organization_id IN (SELECT get_user_organization_ids(auth.uid())))
        )
    );

CREATE POLICY "Users can create messages in their conversations"
    ON conversation_messages FOR INSERT
    WITH CHECK (
        conversation_id IN (
            SELECT id FROM ai_conversations WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- CONVERSATION ATTACHMENTS POLICIES
-- ============================================
CREATE POLICY "Users can manage attachments in their conversations"
    ON conversation_attachments FOR ALL
    USING (
        conversation_id IN (
            SELECT id FROM ai_conversations WHERE user_id = auth.uid()
        )
    );

-- ============================================
-- RECEIPTS POLICIES
-- ============================================
CREATE POLICY "Users can view receipts in their organization"
    ON receipts FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Users can manage their own receipts"
    ON receipts FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all organization receipts"
    ON receipts FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- EXPENSE REPORTS POLICIES
-- ============================================
CREATE POLICY "Users can view expense reports in their organization"
    ON expense_reports FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Users can manage their own expense reports"
    ON expense_reports FOR ALL
    USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all organization expense reports"
    ON expense_reports FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- RECEIPT CATEGORIES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization receipt categories"
    ON receipt_categories FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization receipt categories"
    ON receipt_categories FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- RECEIPT PROCESSING QUEUE POLICIES
-- ============================================
CREATE POLICY "Users can view their organization receipt queue"
    ON receipt_processing_queue FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- WHATSAPP ACCOUNTS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization WhatsApp accounts"
    ON whatsapp_accounts FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization WhatsApp accounts"
    ON whatsapp_accounts FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- WHATSAPP CONTACTS POLICIES
-- ============================================
CREATE POLICY "Users can view their organization WhatsApp contacts"
    ON whatsapp_contacts FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Users can manage WhatsApp contacts in their org"
    ON whatsapp_contacts FOR ALL
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- WHATSAPP MESSAGES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization WhatsApp messages"
    ON whatsapp_messages FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Users can send WhatsApp messages in their org"
    ON whatsapp_messages FOR INSERT
    WITH CHECK (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

-- ============================================
-- WHATSAPP TEMPLATES POLICIES
-- ============================================
CREATE POLICY "Users can view their organization WhatsApp templates"
    ON whatsapp_templates FOR SELECT
    USING (organization_id IN (SELECT get_user_organization_ids(auth.uid())));

CREATE POLICY "Admins can manage organization WhatsApp templates"
    ON whatsapp_templates FOR ALL
    USING (is_organization_admin(auth.uid(), organization_id));

-- ============================================
-- GRANT USAGE TO AUTHENTICATED USERS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- SERVICE ROLE BYPASS (for background jobs)
-- ============================================
-- Note: Service role key automatically bypasses RLS
-- This is used for background jobs, webhooks, etc.
