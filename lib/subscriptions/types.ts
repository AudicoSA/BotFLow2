// Subscription Management Types

export type PlanId = 'ai-assistant' | 'whatsapp-assistant' | 'receipt-assistant' | 'bundle' | 'free';

export type SubscriptionStatus =
    | 'active'
    | 'trialing'
    | 'past_due'
    | 'canceled'
    | 'paused'
    | 'incomplete';

export type BillingInterval = 'monthly' | 'annual';

export interface Subscription {
    id: string;
    organization_id: string;
    plan_id: PlanId;
    status: SubscriptionStatus;
    paystack_subscription_code: string | null;
    paystack_customer_code: string | null;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    canceled_at: string | null;
    cancellation_reason: string | null;
    trial_start: string | null;
    trial_end: string | null;
    user_count: number;
    billing_interval: BillingInterval;
    amount: number; // in cents
    currency: string;
    created_at: string;
    updated_at: string;
}

export interface Plan {
    id: PlanId;
    name: string;
    description: string;
    price: number; // in cents
    priceAnnual: number; // annual price in cents
    interval: BillingInterval;
    features: string[];
    limits: {
        ai_conversations?: number;
        ai_tokens?: number;
        whatsapp_messages?: number;
        receipts?: number;
        users?: number;
    };
    popular?: boolean;
    icon: string;
    color: string;
}

export interface PlanChangePreview {
    current_plan: PlanId;
    new_plan: PlanId;
    proration_amount: number; // Credit or charge in cents
    proration_date: string;
    new_amount: number;
    effective_date: string;
    immediate: boolean;
}

export interface CancellationSurveyResponse {
    reason: CancellationReason;
    other_reason?: string;
    feedback?: string;
    would_recommend?: number; // 1-10
    willing_to_stay_with_discount?: boolean;
}

export type CancellationReason =
    | 'too_expensive'
    | 'not_using'
    | 'missing_features'
    | 'switching_competitor'
    | 'temporary_pause'
    | 'business_closed'
    | 'poor_support'
    | 'technical_issues'
    | 'other';

export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank';
    brand?: string;
    last4: string;
    exp_month?: number;
    exp_year?: number;
    bank_name?: string;
    is_default: boolean;
}

export interface BillingHistoryItem {
    id: string;
    type: 'invoice' | 'payment' | 'refund' | 'credit';
    amount: number;
    currency: string;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    description: string;
    date: string;
    invoice_number?: string;
    invoice_url?: string;
    receipt_url?: string;
    pdf_url?: string;
    period_start?: string;
    period_end?: string;
    payment_method?: string;
}

// Plan definitions
export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Free Trial',
        description: 'Try BotFlow free for 14 days',
        price: 0,
        priceAnnual: 0,
        interval: 'monthly',
        features: [
            'All features included',
            '14-day trial period',
            'No credit card required',
        ],
        limits: {
            ai_conversations: 50,
            whatsapp_messages: 100,
            receipts: 20,
        },
        icon: '🎁',
        color: 'gray',
    },
    'ai-assistant': {
        id: 'ai-assistant',
        name: 'AI Assistant',
        description: 'GPT-4 powered conversations',
        price: 49900, // R499
        priceAnnual: 479000, // R4790 (2 months free)
        interval: 'monthly',
        features: [
            'Unlimited AI conversations',
            'Custom knowledge base',
            'Multi-channel support',
            'Full conversation history',
            'Email support',
        ],
        limits: {
            ai_conversations: -1, // Unlimited
            ai_tokens: 500000,
        },
        icon: '🤖',
        color: 'violet',
    },
    'whatsapp-assistant': {
        id: 'whatsapp-assistant',
        name: 'WhatsApp Assistant',
        description: 'Automate your #1 channel',
        price: 49900, // R499
        priceAnnual: 479000,
        interval: 'monthly',
        features: [
            '5,000 messages/month',
            'QR code setup',
            'Automated responses',
            'Booking system',
            'Priority support',
        ],
        limits: {
            whatsapp_messages: 5000,
        },
        popular: true,
        icon: '💬',
        color: 'green',
    },
    'receipt-assistant': {
        id: 'receipt-assistant',
        name: 'Receipt Assistant',
        description: 'AI expense tracking',
        price: 9900, // R99 per user
        priceAnnual: 95000,
        interval: 'monthly',
        features: [
            'Unlimited receipt scans',
            'AI data extraction',
            'Auto-categorization',
            'Export to CSV/PDF',
            'VAT reports',
        ],
        limits: {
            receipts: -1, // Unlimited
            users: 1,
        },
        icon: '🧾',
        color: 'amber',
    },
    bundle: {
        id: 'bundle',
        name: 'Complete Bundle',
        description: 'All services included',
        price: 89900, // R899
        priceAnnual: 863000, // ~R7191/mo
        interval: 'monthly',
        features: [
            'Everything in AI Assistant',
            'Everything in WhatsApp Assistant',
            'Everything in Receipt Assistant',
            'Priority support',
            'Early access to new features',
        ],
        limits: {
            ai_conversations: -1,
            ai_tokens: 1000000,
            whatsapp_messages: 10000,
            receipts: -1,
        },
        popular: true,
        icon: '🚀',
        color: 'cyan',
    },
};

export const CANCELLATION_REASONS: { value: CancellationReason; label: string; icon: string }[] = [
    { value: 'too_expensive', label: 'Too expensive', icon: '💰' },
    { value: 'not_using', label: 'Not using it enough', icon: '📉' },
    { value: 'missing_features', label: 'Missing features I need', icon: '🔧' },
    { value: 'switching_competitor', label: 'Switching to a competitor', icon: '🔄' },
    { value: 'temporary_pause', label: 'Taking a temporary break', icon: '⏸️' },
    { value: 'business_closed', label: 'Business closed/downsizing', icon: '🏢' },
    { value: 'poor_support', label: 'Poor customer support', icon: '😞' },
    { value: 'technical_issues', label: 'Technical issues', icon: '🐛' },
    { value: 'other', label: 'Other reason', icon: '📝' },
];

// Helper functions
export function formatPrice(cents: number, currency = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
    }).format(cents / 100);
}

export function getPlanById(planId: PlanId): Plan {
    return PLANS[planId] || PLANS.free;
}

export function calculateProration(
    currentPlan: Plan,
    newPlan: Plan,
    daysRemaining: number,
    totalDays: number
): number {
    const dailyCurrentRate = currentPlan.price / totalDays;
    const dailyNewRate = newPlan.price / totalDays;

    const currentCredit = Math.round(dailyCurrentRate * daysRemaining);
    const newCharge = Math.round(dailyNewRate * daysRemaining);

    return newCharge - currentCredit;
}

export function getSubscriptionStatusLabel(status: SubscriptionStatus): string {
    const labels: Record<SubscriptionStatus, string> = {
        active: 'Active',
        trialing: 'Trial',
        past_due: 'Past Due',
        canceled: 'Canceled',
        paused: 'Paused',
        incomplete: 'Incomplete',
    };
    return labels[status];
}

export function getSubscriptionStatusColor(status: SubscriptionStatus): string {
    const colors: Record<SubscriptionStatus, string> = {
        active: 'green',
        trialing: 'blue',
        past_due: 'red',
        canceled: 'gray',
        paused: 'yellow',
        incomplete: 'orange',
    };
    return colors[status];
}
