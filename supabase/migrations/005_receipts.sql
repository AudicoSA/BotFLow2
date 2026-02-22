-- BotFlow2 SaaS Platform - Receipts Schema
-- Migration: 005_receipts
-- Created: 2024-02-22
-- Description: Receipt Assistant with OCR data storage

-- ============================================
-- RECEIPTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Image storage
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    original_filename VARCHAR(255),
    file_size INTEGER,
    mime_type VARCHAR(50),

    -- Processing status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed

    -- OCR data (raw)
    ocr_raw_text TEXT,
    ocr_confidence DECIMAL(5, 4), -- 0.0000 to 1.0000
    ocr_provider VARCHAR(50), -- google_vision, tesseract

    -- Extracted merchant info
    merchant_name VARCHAR(255),
    merchant_address TEXT,
    merchant_phone VARCHAR(50),
    merchant_category VARCHAR(100),

    -- Date and time
    receipt_date DATE,
    receipt_time TIME,

    -- Amounts (stored in cents to avoid floating point issues)
    subtotal_cents INTEGER,
    tax_cents INTEGER,
    tip_cents INTEGER,
    total_cents INTEGER NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Category
    category VARCHAR(50) NOT NULL DEFAULT 'other',
    -- food_dining, groceries, transportation, utilities, entertainment,
    -- shopping, healthcare, travel, office_supplies, software, professional_services, other

    -- Payment info
    payment_method VARCHAR(20),
    -- cash, card, eft, mobile, other
    card_last_four VARCHAR(4),
    card_type VARCHAR(20),

    -- Line items stored as JSONB
    items JSONB DEFAULT '[]',
    -- [{"description": "...", "quantity": 1, "unit_price": 100, "total_price": 100}]

    -- User additions
    notes TEXT,
    tags JSONB DEFAULT '[]',

    -- Reimbursement tracking
    is_reimbursable BOOLEAN DEFAULT FALSE,
    reimbursement_status VARCHAR(20),
    -- pending, approved, rejected, paid
    reimbursement_amount_cents INTEGER,
    reimbursement_approved_by UUID REFERENCES users(id),
    reimbursement_approved_at TIMESTAMPTZ,
    reimbursement_paid_at TIMESTAMPTZ,

    -- Project/expense report linking
    project_id UUID,
    expense_report_id UUID,

    -- Duplicate detection
    content_hash VARCHAR(64), -- SHA256 hash for duplicate detection
    is_duplicate BOOLEAN DEFAULT FALSE,
    duplicate_of UUID REFERENCES receipts(id),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for receipts
CREATE INDEX idx_receipts_org_id ON receipts(organization_id);
CREATE INDEX idx_receipts_user_id ON receipts(user_id);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_category ON receipts(category);
CREATE INDEX idx_receipts_receipt_date ON receipts(receipt_date);
CREATE INDEX idx_receipts_merchant_name ON receipts(merchant_name);
CREATE INDEX idx_receipts_total_cents ON receipts(total_cents);
CREATE INDEX idx_receipts_reimbursable ON receipts(is_reimbursable);
CREATE INDEX idx_receipts_reimbursement_status ON receipts(reimbursement_status);
CREATE INDEX idx_receipts_content_hash ON receipts(content_hash);
CREATE INDEX idx_receipts_created_at ON receipts(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_receipts_org_date ON receipts(organization_id, receipt_date DESC NULLS LAST);
CREATE INDEX idx_receipts_org_category ON receipts(organization_id, category);
CREATE INDEX idx_receipts_user_date ON receipts(user_id, receipt_date DESC NULLS LAST);
CREATE INDEX idx_receipts_org_status ON receipts(organization_id, status);

-- GIN index for full-text search on merchant name
CREATE INDEX idx_receipts_merchant_search ON receipts USING gin(to_tsvector('english', merchant_name));

-- GIN index for tags array
CREATE INDEX idx_receipts_tags ON receipts USING gin(tags);

-- ============================================
-- EXPENSE REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS expense_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Report details
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Totals (calculated from receipts)
    total_receipts INTEGER DEFAULT 0,
    total_amount_cents INTEGER DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'ZAR',

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    -- draft, submitted, approved, rejected, paid

    -- Approval workflow
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,

    -- Payment
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(100),

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expense_reports_org_id ON expense_reports(organization_id);
CREATE INDEX idx_expense_reports_user_id ON expense_reports(user_id);
CREATE INDEX idx_expense_reports_status ON expense_reports(status);
CREATE INDEX idx_expense_reports_period ON expense_reports(period_start, period_end);
CREATE INDEX idx_expense_reports_created_at ON expense_reports(created_at);

-- Add foreign key from receipts to expense reports
ALTER TABLE receipts ADD CONSTRAINT fk_receipts_expense_report
    FOREIGN KEY (expense_report_id) REFERENCES expense_reports(id) ON DELETE SET NULL;

-- ============================================
-- RECEIPT CATEGORIES TABLE (custom categories)
-- ============================================
CREATE TABLE IF NOT EXISTS receipt_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Category details
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(20), -- Emoji or icon name
    color VARCHAR(7), -- Hex color code

    -- Budget tracking
    monthly_budget_cents INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,

    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, slug)
);

CREATE INDEX idx_receipt_categories_org_id ON receipt_categories(organization_id);
CREATE INDEX idx_receipt_categories_active ON receipt_categories(organization_id, is_active) WHERE is_active = TRUE;

-- ============================================
-- RECEIPT PROCESSING QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS receipt_processing_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Processing details
    job_type VARCHAR(50) NOT NULL DEFAULT 'ocr',
    -- ocr, categorization, duplicate_check

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed

    -- Scheduling
    priority INTEGER DEFAULT 0, -- Higher = more priority
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- Retry handling
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    next_retry_at TIMESTAMPTZ,

    -- Results
    result JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_receipt_queue_receipt_id ON receipt_processing_queue(receipt_id);
CREATE INDEX idx_receipt_queue_org_id ON receipt_processing_queue(organization_id);
CREATE INDEX idx_receipt_queue_status ON receipt_processing_queue(status);
CREATE INDEX idx_receipt_queue_pending ON receipt_processing_queue(status, priority DESC, scheduled_at)
    WHERE status = 'pending';

-- ============================================
-- FUNCTION: Calculate expense report totals
-- ============================================
CREATE OR REPLACE FUNCTION update_expense_report_totals()
RETURNS TRIGGER AS $$
DECLARE
    report_id UUID;
    receipt_count INTEGER;
    total_amount INTEGER;
BEGIN
    -- Determine which expense_report_id to update
    IF TG_OP = 'DELETE' THEN
        report_id := OLD.expense_report_id;
    ELSE
        report_id := NEW.expense_report_id;
    END IF;

    -- Also update old report if it changed
    IF TG_OP = 'UPDATE' AND OLD.expense_report_id IS DISTINCT FROM NEW.expense_report_id THEN
        IF OLD.expense_report_id IS NOT NULL THEN
            SELECT COUNT(*), COALESCE(SUM(total_cents), 0)
            INTO receipt_count, total_amount
            FROM receipts
            WHERE expense_report_id = OLD.expense_report_id;

            UPDATE expense_reports
            SET total_receipts = receipt_count,
                total_amount_cents = total_amount,
                updated_at = NOW()
            WHERE id = OLD.expense_report_id;
        END IF;
    END IF;

    -- Update the current report
    IF report_id IS NOT NULL THEN
        SELECT COUNT(*), COALESCE(SUM(total_cents), 0)
        INTO receipt_count, total_amount
        FROM receipts
        WHERE expense_report_id = report_id;

        UPDATE expense_reports
        SET total_receipts = receipt_count,
            total_amount_cents = total_amount,
            updated_at = NOW()
        WHERE id = report_id;
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_expense_report_totals
    AFTER INSERT OR UPDATE OF expense_report_id, total_cents OR DELETE
    ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_expense_report_totals();

-- ============================================
-- FUNCTION: Generate content hash for duplicate detection
-- ============================================
CREATE OR REPLACE FUNCTION generate_receipt_content_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.merchant_name IS NOT NULL AND NEW.receipt_date IS NOT NULL AND NEW.total_cents IS NOT NULL THEN
        NEW.content_hash := encode(
            digest(
                COALESCE(LOWER(TRIM(NEW.merchant_name)), '') ||
                COALESCE(NEW.receipt_date::TEXT, '') ||
                COALESCE(NEW.total_cents::TEXT, ''),
                'sha256'
            ),
            'hex'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_receipt_content_hash
    BEFORE INSERT OR UPDATE OF merchant_name, receipt_date, total_cents
    ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION generate_receipt_content_hash();
