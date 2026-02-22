// BotFlow2 SaaS Platform - Database Schema Types
// Generated from SQL migrations

// ============================================
// CORE TYPES
// ============================================

export type UUID = string;
export type Timestamp = string; // ISO 8601 format
export type Date = string; // YYYY-MM-DD format
export type Time = string; // HH:MM:SS format

// ============================================
// ORGANIZATIONS
// ============================================

export interface Organization {
    id: UUID;
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
    settings: Record<string, unknown>;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface OrganizationInsert {
    name: string;
    slug: string;
    email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

export interface OrganizationUpdate {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    logo_url?: string;
    settings?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

// ============================================
// USERS
// ============================================

export interface User {
    id: UUID;
    email: string;
    password_hash?: string;
    full_name?: string;
    avatar_url?: string;
    email_verified: boolean;
    email_verified_at?: Timestamp;
    paystack_customer_code?: string;
    last_sign_in_at?: Timestamp;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface UserInsert {
    email: string;
    password_hash?: string;
    full_name?: string;
    avatar_url?: string;
    paystack_customer_code?: string;
    metadata?: Record<string, unknown>;
}

export interface UserUpdate {
    full_name?: string;
    avatar_url?: string;
    email_verified?: boolean;
    email_verified_at?: Timestamp;
    paystack_customer_code?: string;
    last_sign_in_at?: Timestamp;
    metadata?: Record<string, unknown>;
}

// ============================================
// ORGANIZATION MEMBERS
// ============================================

export type MemberRole = 'owner' | 'admin' | 'member';

export interface OrganizationMember {
    id: UUID;
    organization_id: UUID;
    user_id: UUID;
    role: MemberRole;
    invited_by?: UUID;
    invited_at?: Timestamp;
    accepted_at?: Timestamp;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface OrganizationMemberInsert {
    organization_id: UUID;
    user_id: UUID;
    role?: MemberRole;
    invited_by?: UUID;
}

// ============================================
// USER SESSIONS
// ============================================

export interface UserSession {
    id: UUID;
    user_id: UUID;
    refresh_token_hash: string;
    device_info: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    last_active_at: Timestamp;
    expires_at: Timestamp;
    revoked_at?: Timestamp;
    created_at: Timestamp;
}

export interface UserSessionInsert {
    user_id: UUID;
    refresh_token_hash: string;
    device_info?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
    expires_at: Timestamp;
}

// ============================================
// SUBSCRIPTION PLANS
// ============================================

export type PlanInterval = 'monthly' | 'yearly';

export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price_cents: number;
    currency: string;
    interval: PlanInterval;
    interval_count: number;
    paystack_plan_code?: string;
    features: string[];
    limits: Record<string, number>;
    is_active: boolean;
    is_per_user: boolean;
    trial_days: number;
    sort_order: number;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// SUBSCRIPTIONS
// ============================================

export type SubscriptionStatus =
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'cancelled'
    | 'unpaid'
    | 'paused';

export interface Subscription {
    id: UUID;
    organization_id: UUID;
    user_id: UUID;
    plan_id: string;
    paystack_subscription_code?: string;
    paystack_customer_code?: string;
    paystack_authorization_code?: string;
    paystack_email_token?: string;
    status: SubscriptionStatus;
    current_period_start: Timestamp;
    current_period_end: Timestamp;
    trial_start?: Timestamp;
    trial_end?: Timestamp;
    cancel_at_period_end: boolean;
    cancelled_at?: Timestamp;
    cancellation_reason?: string;
    cancellation_feedback?: string;
    quantity: number;
    paused_at?: Timestamp;
    resume_at?: Timestamp;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface SubscriptionInsert {
    organization_id: UUID;
    user_id: UUID;
    plan_id: string;
    paystack_subscription_code?: string;
    paystack_customer_code?: string;
    paystack_authorization_code?: string;
    current_period_start?: Timestamp;
    current_period_end: Timestamp;
    trial_start?: Timestamp;
    trial_end?: Timestamp;
    status?: SubscriptionStatus;
    quantity?: number;
    metadata?: Record<string, unknown>;
}

export interface SubscriptionUpdate {
    status?: SubscriptionStatus;
    current_period_start?: Timestamp;
    current_period_end?: Timestamp;
    cancel_at_period_end?: boolean;
    cancelled_at?: Timestamp;
    cancellation_reason?: string;
    cancellation_feedback?: string;
    quantity?: number;
    paused_at?: Timestamp;
    resume_at?: Timestamp;
    metadata?: Record<string, unknown>;
}

// ============================================
// PAYMENT HISTORY
// ============================================

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'refunded';

export interface PaymentHistory {
    id: UUID;
    subscription_id?: UUID;
    organization_id: UUID;
    user_id: UUID;
    paystack_reference: string;
    paystack_transaction_id?: number;
    paystack_authorization_code?: string;
    amount_cents: number;
    currency: string;
    status: PaymentStatus;
    payment_channel?: string;
    card_type?: string;
    card_last_four?: string;
    bank_name?: string;
    paid_at?: Timestamp;
    invoice_id?: UUID;
    failure_reason?: string;
    gateway_response?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
}

export interface PaymentHistoryInsert {
    subscription_id?: UUID;
    organization_id: UUID;
    user_id: UUID;
    paystack_reference: string;
    paystack_transaction_id?: number;
    amount_cents: number;
    currency?: string;
    status: PaymentStatus;
    payment_channel?: string;
    card_type?: string;
    card_last_four?: string;
    paid_at?: Timestamp;
    metadata?: Record<string, unknown>;
}

// ============================================
// PAYMENT METHODS
// ============================================

export interface PaymentMethod {
    id: UUID;
    user_id: UUID;
    organization_id?: UUID;
    paystack_authorization_code: string;
    paystack_signature?: string;
    card_type?: string;
    card_last_four?: string;
    card_exp_month?: number;
    card_exp_year?: number;
    bank_name?: string;
    card_holder_name?: string;
    billing_email?: string;
    is_default: boolean;
    is_reusable: boolean;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// USAGE RECORDS
// ============================================

export type UsageType =
    | 'ai_conversation'
    | 'ai_message'
    | 'ai_token'
    | 'whatsapp_message_sent'
    | 'whatsapp_message_received'
    | 'receipt_processed'
    | 'receipt_export';

export type ServiceType = 'ai-assistant' | 'whatsapp-assistant' | 'receipt-assistant';

export interface UsageRecord {
    id: UUID;
    organization_id: UUID;
    user_id?: UUID;
    subscription_id?: UUID;
    usage_type: UsageType;
    service: ServiceType;
    quantity: number;
    unit_price_cents: number;
    total_amount_cents: number;
    billing_period: string; // YYYY-MM format
    is_billable: boolean;
    is_included: boolean;
    reference_id?: string;
    reference_type?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
}

export interface UsageRecordInsert {
    organization_id: UUID;
    user_id?: UUID;
    subscription_id?: UUID;
    usage_type: UsageType;
    service: ServiceType;
    quantity: number;
    unit_price_cents?: number;
    total_amount_cents?: number;
    billing_period: string;
    is_billable?: boolean;
    is_included?: boolean;
    reference_id?: string;
    reference_type?: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// USAGE AGGREGATES
// ============================================

export interface UsageAggregate {
    id: UUID;
    organization_id: UUID;
    billing_period: string;
    service: ServiceType;
    usage_type: UsageType;
    total_quantity: number;
    included_quantity: number;
    billable_quantity: number;
    total_amount_cents: number;
    plan_limit: number;
    last_record_at?: Timestamp;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// INVOICES
// ============================================

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
    service: ServiceType;
    usage_type: UsageType;
}

export interface Invoice {
    id: UUID;
    organization_id: UUID;
    subscription_id?: UUID;
    invoice_number: string;
    paystack_invoice_id?: string;
    billing_period: string;
    period_start: Timestamp;
    period_end: Timestamp;
    subtotal_cents: number;
    tax_cents: number;
    discount_cents: number;
    total_cents: number;
    currency: string;
    status: InvoiceStatus;
    due_date: Date;
    paid_at?: Timestamp;
    payment_id?: UUID;
    pdf_url?: string;
    notes?: string;
    line_items: InvoiceLineItem[];
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// BILLING JOBS
// ============================================

export type BillingJobType =
    | 'usage_aggregation'
    | 'invoice_generation'
    | 'payment_charge'
    | 'subscription_renewal';

export type BillingJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface BillingJob {
    id: UUID;
    job_type: BillingJobType;
    organization_id?: UUID;
    subscription_id?: UUID;
    invoice_id?: UUID;
    status: BillingJobStatus;
    scheduled_at: Timestamp;
    started_at?: Timestamp;
    completed_at?: Timestamp;
    attempts: number;
    max_attempts: number;
    last_error?: string;
    next_retry_at?: Timestamp;
    input_data: Record<string, unknown>;
    output_data: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// SYSTEM PROMPTS
// ============================================

export type PromptCategory =
    | 'general'
    | 'customer_support'
    | 'sales'
    | 'technical'
    | 'creative'
    | 'custom';

export interface PromptVariable {
    name: string;
    description: string;
    required: boolean;
    default_value?: string;
}

export interface SystemPrompt {
    id: UUID;
    organization_id: UUID;
    created_by?: UUID;
    name: string;
    description?: string;
    content: string;
    category: PromptCategory;
    is_default: boolean;
    is_active: boolean;
    variables: PromptVariable[];
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface SystemPromptInsert {
    organization_id: UUID;
    created_by?: UUID;
    name: string;
    description?: string;
    content: string;
    category?: PromptCategory;
    is_default?: boolean;
    variables?: PromptVariable[];
    metadata?: Record<string, unknown>;
}

// ============================================
// AI CONVERSATIONS
// ============================================

export type AIModel = 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o' | 'gpt-3.5-turbo';

export interface AIConversation {
    id: UUID;
    organization_id: UUID;
    user_id: UUID;
    title: string;
    summary?: string;
    model: AIModel;
    system_prompt_id?: UUID;
    system_prompt_content?: string;
    total_tokens: number;
    total_input_tokens: number;
    total_output_tokens: number;
    estimated_cost_cents: number;
    message_count: number;
    is_active: boolean;
    is_archived: boolean;
    is_pinned: boolean;
    is_shared: boolean;
    share_token?: string;
    last_message_at?: Timestamp;
    tags: string[];
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface AIConversationInsert {
    organization_id: UUID;
    user_id: UUID;
    title?: string;
    model?: AIModel;
    system_prompt_id?: UUID;
    system_prompt_content?: string;
    metadata?: Record<string, unknown>;
}

// ============================================
// CONVERSATION MESSAGES
// ============================================

export type MessageRole = 'system' | 'user' | 'assistant';
export type FinishReason = 'stop' | 'length' | 'content_filter';

export interface ConversationMessage {
    id: UUID;
    conversation_id: UUID;
    organization_id: UUID;
    role: MessageRole;
    content: string;
    token_count: number;
    input_tokens: number;
    output_tokens: number;
    model?: AIModel;
    finish_reason?: FinishReason;
    user_rating?: number;
    user_feedback?: string;
    is_complete: boolean;
    parent_message_id?: UUID;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
}

export interface ConversationMessageInsert {
    conversation_id: UUID;
    organization_id: UUID;
    role: MessageRole;
    content: string;
    token_count?: number;
    input_tokens?: number;
    output_tokens?: number;
    model?: AIModel;
    finish_reason?: FinishReason;
    metadata?: Record<string, unknown>;
}

// ============================================
// RECEIPTS
// ============================================

export type ReceiptStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ExpenseCategory =
    | 'food_dining'
    | 'groceries'
    | 'transportation'
    | 'utilities'
    | 'entertainment'
    | 'shopping'
    | 'healthcare'
    | 'travel'
    | 'office_supplies'
    | 'software'
    | 'professional_services'
    | 'other';

export type PaymentMethodType = 'cash' | 'card' | 'eft' | 'mobile' | 'other';
export type ReimbursementStatus = 'pending' | 'approved' | 'rejected' | 'paid';

export interface ReceiptLineItem {
    description: string;
    quantity?: number;
    unit_price?: number;
    total_price: number;
}

export interface Receipt {
    id: UUID;
    organization_id: UUID;
    user_id: UUID;
    image_url: string;
    thumbnail_url?: string;
    original_filename?: string;
    file_size?: number;
    mime_type?: string;
    status: ReceiptStatus;
    ocr_raw_text?: string;
    ocr_confidence?: number;
    ocr_provider?: string;
    merchant_name?: string;
    merchant_address?: string;
    merchant_phone?: string;
    merchant_category?: string;
    receipt_date?: Date;
    receipt_time?: Time;
    subtotal_cents?: number;
    tax_cents?: number;
    tip_cents?: number;
    total_cents: number;
    currency: string;
    category: ExpenseCategory;
    payment_method?: PaymentMethodType;
    card_last_four?: string;
    card_type?: string;
    items: ReceiptLineItem[];
    notes?: string;
    tags: string[];
    is_reimbursable: boolean;
    reimbursement_status?: ReimbursementStatus;
    reimbursement_amount_cents?: number;
    reimbursement_approved_by?: UUID;
    reimbursement_approved_at?: Timestamp;
    reimbursement_paid_at?: Timestamp;
    project_id?: UUID;
    expense_report_id?: UUID;
    content_hash?: string;
    is_duplicate: boolean;
    duplicate_of?: UUID;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface ReceiptInsert {
    organization_id: UUID;
    user_id: UUID;
    image_url: string;
    thumbnail_url?: string;
    original_filename?: string;
    file_size?: number;
    mime_type?: string;
    merchant_name?: string;
    receipt_date?: Date;
    total_cents?: number;
    category?: ExpenseCategory;
    notes?: string;
    tags?: string[];
    is_reimbursable?: boolean;
    metadata?: Record<string, unknown>;
}

export interface ReceiptUpdate {
    merchant_name?: string;
    merchant_address?: string;
    receipt_date?: Date;
    receipt_time?: Time;
    subtotal_cents?: number;
    tax_cents?: number;
    tip_cents?: number;
    total_cents?: number;
    category?: ExpenseCategory;
    payment_method?: PaymentMethodType;
    items?: ReceiptLineItem[];
    notes?: string;
    tags?: string[];
    is_reimbursable?: boolean;
    reimbursement_status?: ReimbursementStatus;
}

// ============================================
// EXPENSE REPORTS
// ============================================

export type ExpenseReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid';

export interface ExpenseReport {
    id: UUID;
    organization_id: UUID;
    user_id: UUID;
    title: string;
    description?: string;
    period_start: Date;
    period_end: Date;
    total_receipts: number;
    total_amount_cents: number;
    currency: string;
    status: ExpenseReportStatus;
    submitted_at?: Timestamp;
    reviewed_by?: UUID;
    reviewed_at?: Timestamp;
    review_notes?: string;
    paid_at?: Timestamp;
    payment_reference?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// WHATSAPP ACCOUNTS
// ============================================

export type ConnectionMode = 'embedded_signup' | 'qr_code' | 'coexistence';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'suspended';
export type QualityRating = 'GREEN' | 'YELLOW' | 'RED';

export interface WhatsAppAccount {
    id: UUID;
    organization_id: UUID;
    created_by?: UUID;
    waba_id?: string;
    phone_number_id?: string;
    display_phone_number?: string;
    phone_number_name?: string;
    business_name?: string;
    business_description?: string;
    business_vertical?: string;
    business_address?: string;
    business_email?: string;
    business_website?: string;
    profile_picture_url?: string;
    channel_id?: string;
    access_token?: string;
    token_expires_at?: Timestamp;
    connection_mode: ConnectionMode;
    qr_code_data?: string;
    qr_code_generated_at?: Timestamp;
    connection_status: ConnectionStatus;
    status_message?: string;
    last_status_check?: Timestamp;
    is_verified: boolean;
    verified_at?: Timestamp;
    quality_rating?: QualityRating;
    messaging_limit?: string;
    webhook_url?: string;
    webhook_secret?: string;
    templates_synced_at?: Timestamp;
    coexistence_enabled: boolean;
    original_phone_linked: boolean;
    messages_sent_today: number;
    messages_received_today: number;
    last_message_at?: Timestamp;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// WHATSAPP CONTACTS
// ============================================

export interface WhatsAppContact {
    id: UUID;
    organization_id: UUID;
    whatsapp_account_id: UUID;
    wa_id: string;
    phone_number: string;
    profile_name?: string;
    profile_picture_url?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    company?: string;
    is_blocked: boolean;
    is_opted_in: boolean;
    opt_in_at?: Timestamp;
    opt_out_at?: Timestamp;
    last_message_at?: Timestamp;
    unread_count: number;
    tags: string[];
    custom_fields: Record<string, unknown>;
    source?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// WHATSAPP MESSAGES
// ============================================

export type MessageDirection = 'inbound' | 'outbound';

export type WhatsAppMessageType =
    | 'text'
    | 'image'
    | 'video'
    | 'audio'
    | 'document'
    | 'sticker'
    | 'location'
    | 'contacts'
    | 'template'
    | 'interactive';

export type WhatsAppMessageStatus =
    | 'pending'
    | 'sent'
    | 'delivered'
    | 'read'
    | 'failed';

export interface WhatsAppMessage {
    id: UUID;
    organization_id: UUID;
    whatsapp_account_id: UUID;
    contact_id?: UUID;
    wamid?: string;
    conversation_id?: string;
    direction: MessageDirection;
    message_type: WhatsAppMessageType;
    text_body?: string;
    caption?: string;
    media_id?: string;
    media_url?: string;
    media_mime_type?: string;
    media_filename?: string;
    media_sha256?: string;
    location_latitude?: number;
    location_longitude?: number;
    location_name?: string;
    location_address?: string;
    template_name?: string;
    template_language?: string;
    template_components?: Record<string, unknown>;
    interactive_type?: string;
    interactive_body?: Record<string, unknown>;
    status: WhatsAppMessageStatus;
    status_timestamp?: Timestamp;
    error_code?: string;
    error_message?: string;
    pricing_model?: string;
    pricing_category?: string;
    context_message_id?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// WHATSAPP TEMPLATES
// ============================================

export type TemplateCategory = 'AUTHENTICATION' | 'MARKETING' | 'UTILITY';
export type TemplateStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'DISABLED';

export interface WhatsAppTemplate {
    id: UUID;
    organization_id: UUID;
    whatsapp_account_id: UUID;
    template_id?: string;
    name: string;
    language: string;
    category: TemplateCategory;
    status: TemplateStatus;
    components: Record<string, unknown>[];
    quality_score?: Record<string, unknown>;
    rejected_reason?: string;
    metadata: Record<string, unknown>;
    created_at: Timestamp;
    updated_at: Timestamp;
}

// ============================================
// DATABASE TYPE (full schema)
// ============================================

export interface Database {
    organizations: Organization;
    users: User;
    organization_members: OrganizationMember;
    user_sessions: UserSession;
    subscription_plans: SubscriptionPlan;
    subscriptions: Subscription;
    payment_history: PaymentHistory;
    payment_methods: PaymentMethod;
    usage_records: UsageRecord;
    usage_aggregates: UsageAggregate;
    invoices: Invoice;
    billing_jobs: BillingJob;
    system_prompts: SystemPrompt;
    ai_conversations: AIConversation;
    conversation_messages: ConversationMessage;
    receipts: Receipt;
    expense_reports: ExpenseReport;
    whatsapp_accounts: WhatsAppAccount;
    whatsapp_contacts: WhatsAppContact;
    whatsapp_messages: WhatsAppMessage;
    whatsapp_templates: WhatsAppTemplate;
}
