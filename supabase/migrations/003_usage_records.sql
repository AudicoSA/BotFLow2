-- BotFlow2 SaaS Platform - Usage Records Schema
-- Migration: 003_usage_records
-- Created: 2024-02-22
-- Description: Usage-based billing and metering tables

-- ============================================
-- USAGE RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Usage type
    usage_type VARCHAR(50) NOT NULL,
    -- ai_conversation, ai_message, ai_token
    -- whatsapp_message_sent, whatsapp_message_received
    -- receipt_processed, receipt_export

    -- Service categorization
    service VARCHAR(50) NOT NULL,
    -- ai-assistant, whatsapp-assistant, receipt-assistant

    -- Quantity and pricing
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL DEFAULT 0, -- Price per unit in ZAR cents
    total_amount_cents INTEGER NOT NULL DEFAULT 0, -- Total in ZAR cents

    -- Billing period (YYYY-MM format)
    billing_period VARCHAR(7) NOT NULL,

    -- Status
    is_billable BOOLEAN DEFAULT TRUE,
    is_included BOOLEAN DEFAULT TRUE, -- TRUE if within plan limits

    -- Reference IDs for traceability
    reference_id VARCHAR(100), -- e.g., conversation_id, message_id, receipt_id
    reference_type VARCHAR(50), -- conversation, message, receipt, export

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for usage_records
CREATE INDEX idx_usage_records_org_id ON usage_records(organization_id);
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_subscription_id ON usage_records(subscription_id);
CREATE INDEX idx_usage_records_usage_type ON usage_records(usage_type);
CREATE INDEX idx_usage_records_service ON usage_records(service);
CREATE INDEX idx_usage_records_billing_period ON usage_records(billing_period);
CREATE INDEX idx_usage_records_created_at ON usage_records(created_at);
CREATE INDEX idx_usage_records_reference ON usage_records(reference_type, reference_id);

-- Composite index for billing queries
CREATE INDEX idx_usage_records_org_period ON usage_records(organization_id, billing_period);
CREATE INDEX idx_usage_records_org_service_period ON usage_records(organization_id, service, billing_period);

-- ============================================
-- USAGE AGGREGATES TABLE (for efficient querying)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_aggregates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    billing_period VARCHAR(7) NOT NULL,
    service VARCHAR(50) NOT NULL,
    usage_type VARCHAR(50) NOT NULL,

    -- Aggregated values
    total_quantity BIGINT NOT NULL DEFAULT 0,
    included_quantity BIGINT NOT NULL DEFAULT 0,
    billable_quantity BIGINT NOT NULL DEFAULT 0,
    total_amount_cents BIGINT NOT NULL DEFAULT 0,

    -- Plan limits for this period
    plan_limit BIGINT DEFAULT -1, -- -1 means unlimited

    -- Last updated
    last_record_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, billing_period, service, usage_type)
);

CREATE INDEX idx_usage_aggregates_org_id ON usage_aggregates(organization_id);
CREATE INDEX idx_usage_aggregates_billing_period ON usage_aggregates(billing_period);
CREATE INDEX idx_usage_aggregates_org_period ON usage_aggregates(organization_id, billing_period);

-- ============================================
-- INVOICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,

    -- Invoice identification
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    paystack_invoice_id VARCHAR(100),

    -- Billing period
    billing_period VARCHAR(7) NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,

    -- Amounts (in ZAR cents)
    subtotal_cents INTEGER NOT NULL DEFAULT 0,
    tax_cents INTEGER NOT NULL DEFAULT 0,
    discount_cents INTEGER NOT NULL DEFAULT 0,
    total_cents INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft, pending, paid, overdue, cancelled, refunded

    -- Payment
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_id UUID REFERENCES payment_history(id),

    -- Documents
    pdf_url TEXT,
    notes TEXT,

    -- Line items stored as JSONB for flexibility
    line_items JSONB DEFAULT '[]',

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_billing_period ON invoices(billing_period);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_paid_at ON invoices(paid_at);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- ============================================
-- BILLING JOBS TABLE (for background processing)
-- ============================================
CREATE TABLE IF NOT EXISTS billing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    -- usage_aggregation, invoice_generation, payment_charge, subscription_renewal

    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed, cancelled

    -- Scheduling
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Retry handling
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,

    -- Job data
    input_data JSONB DEFAULT '{}',
    output_data JSONB DEFAULT '{}',

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_billing_jobs_type ON billing_jobs(job_type);
CREATE INDEX idx_billing_jobs_org_id ON billing_jobs(organization_id);
CREATE INDEX idx_billing_jobs_status ON billing_jobs(status);
CREATE INDEX idx_billing_jobs_scheduled_at ON billing_jobs(scheduled_at);
CREATE INDEX idx_billing_jobs_pending ON billing_jobs(status, scheduled_at) WHERE status = 'pending';

-- ============================================
-- FUNCTION: Update usage aggregate
-- ============================================
CREATE OR REPLACE FUNCTION update_usage_aggregate()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO usage_aggregates (
        organization_id,
        billing_period,
        service,
        usage_type,
        total_quantity,
        included_quantity,
        billable_quantity,
        total_amount_cents,
        last_record_at
    )
    VALUES (
        NEW.organization_id,
        NEW.billing_period,
        NEW.service,
        NEW.usage_type,
        NEW.quantity,
        CASE WHEN NEW.is_included THEN NEW.quantity ELSE 0 END,
        CASE WHEN NEW.is_billable AND NOT NEW.is_included THEN NEW.quantity ELSE 0 END,
        NEW.total_amount_cents,
        NEW.created_at
    )
    ON CONFLICT (organization_id, billing_period, service, usage_type)
    DO UPDATE SET
        total_quantity = usage_aggregates.total_quantity + NEW.quantity,
        included_quantity = usage_aggregates.included_quantity + CASE WHEN NEW.is_included THEN NEW.quantity ELSE 0 END,
        billable_quantity = usage_aggregates.billable_quantity + CASE WHEN NEW.is_billable AND NOT NEW.is_included THEN NEW.quantity ELSE 0 END,
        total_amount_cents = usage_aggregates.total_amount_cents + NEW.total_amount_cents,
        last_record_at = NEW.created_at,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update aggregates
CREATE TRIGGER trg_usage_record_aggregate
    AFTER INSERT ON usage_records
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_aggregate();

-- ============================================
-- FUNCTION: Generate invoice number
-- ============================================
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month VARCHAR(6);
    seq_num INTEGER;
BEGIN
    year_month := TO_CHAR(NOW(), 'YYYYMM');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(invoice_number FROM 8) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '%';

    NEW.invoice_number := 'INV-' || year_month || '-' || LPAD(seq_num::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION generate_invoice_number();
