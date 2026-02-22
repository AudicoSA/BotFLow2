// Usage-Based Billing Types

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
    id: string;
    organization_id: string;
    user_id: string | null;
    usage_type: UsageType;
    quantity: number;
    unit_price: number; // in cents (ZAR)
    total_amount: number; // in cents
    metadata: Record<string, unknown>;
    billing_period: string; // YYYY-MM format
    created_at: string;
}

export interface UsageRecordCreate {
    organization_id: string;
    user_id?: string;
    usage_type: UsageType;
    quantity: number;
    metadata?: Record<string, unknown>;
}

export interface UsageSummary {
    organization_id: string;
    billing_period: string;
    services: {
        service: ServiceType;
        usage: UsageBreakdown[];
        subtotal: number;
    }[];
    total_amount: number;
    currency: string;
}

export interface UsageBreakdown {
    usage_type: UsageType;
    quantity: number;
    unit_price: number;
    total: number;
    description: string;
}

export interface BillingPeriod {
    start: Date;
    end: Date;
    period_key: string; // YYYY-MM
}

export interface Invoice {
    id: string;
    organization_id: string;
    paystack_invoice_id: string | null;
    billing_period: string;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    status: InvoiceStatus;
    due_date: string;
    paid_at: string | null;
    pdf_url: string | null;
    line_items: InvoiceLineItem[];
    created_at: string;
    updated_at: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';

export interface InvoiceLineItem {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
    service: ServiceType;
    usage_type: UsageType;
}

// Pricing configuration (in ZAR cents)
export const USAGE_PRICING: Record<UsageType, {
    unit_price: number;
    description: string;
    included_in_plan: number;
    overage_price: number;
}> = {
    ai_conversation: {
        unit_price: 0, // Included in subscription
        description: 'AI Conversation',
        included_in_plan: -1, // Unlimited
        overage_price: 0,
    },
    ai_message: {
        unit_price: 0, // Included in subscription
        description: 'AI Message',
        included_in_plan: -1, // Unlimited
        overage_price: 0,
    },
    ai_token: {
        unit_price: 0.001, // R0.001 per token overage
        description: 'AI Token',
        included_in_plan: 500000, // 500k tokens included
        overage_price: 0.001,
    },
    whatsapp_message_sent: {
        unit_price: 0.10, // R0.10 per message overage
        description: 'WhatsApp Message Sent',
        included_in_plan: 5000, // 5000 messages included
        overage_price: 0.10,
    },
    whatsapp_message_received: {
        unit_price: 0, // Free to receive
        description: 'WhatsApp Message Received',
        included_in_plan: -1, // Unlimited
        overage_price: 0,
    },
    receipt_processed: {
        unit_price: 0, // Included per user
        description: 'Receipt Processed',
        included_in_plan: -1, // Unlimited
        overage_price: 0,
    },
    receipt_export: {
        unit_price: 0,
        description: 'Receipt Export',
        included_in_plan: -1, // Unlimited
        overage_price: 0,
    },
};

// Plan base prices (in ZAR cents per month)
export const PLAN_PRICING = {
    'ai-assistant': {
        base_price: 49900, // R499
        name: 'AI Assistant',
    },
    'whatsapp-assistant': {
        base_price: 49900, // R499
        name: 'WhatsApp Assistant',
    },
    'receipt-assistant': {
        base_price: 9900, // R99 per user
        name: 'Receipt Assistant',
        per_user: true,
    },
    'bundle': {
        base_price: 89900, // R899
        name: 'Complete Bundle',
    },
};

// Helper functions
export function formatCurrency(cents: number, currency = 'ZAR'): string {
    const amount = cents / 100;
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function getCurrentBillingPeriod(): BillingPeriod {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const period_key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    return { start, end, period_key };
}

export function getBillingPeriodForDate(date: Date): BillingPeriod {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    const period_key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return { start, end, period_key };
}

export function getUsageTypeService(usageType: UsageType): ServiceType {
    if (usageType.startsWith('ai_')) return 'ai-assistant';
    if (usageType.startsWith('whatsapp_')) return 'whatsapp-assistant';
    if (usageType.startsWith('receipt_')) return 'receipt-assistant';
    return 'ai-assistant'; // Default
}

export function getUsageDescription(usageType: UsageType, quantity: number): string {
    const config = USAGE_PRICING[usageType];
    return `${quantity.toLocaleString()} x ${config.description}`;
}
