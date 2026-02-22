// Analytics Types

// Activation Events
export type ActivationEvent =
    | 'signup_completed'
    | 'onboarding_started'
    | 'onboarding_completed'
    | 'first_ai_message_sent'
    | 'first_whatsapp_connected'
    | 'first_receipt_uploaded'
    | 'first_subscription_created'
    | 'trial_started'
    | 'trial_converted';

// Product Events
export type ProductEvent =
    | 'ai_conversation_started'
    | 'ai_message_sent'
    | 'whatsapp_message_sent'
    | 'whatsapp_message_received'
    | 'receipt_uploaded'
    | 'receipt_processed'
    | 'receipt_exported'
    | 'plan_viewed'
    | 'plan_selected'
    | 'checkout_started'
    | 'checkout_completed'
    | 'subscription_upgraded'
    | 'subscription_downgraded'
    | 'subscription_canceled';

// Admin Metrics
export interface SaaSMetrics {
    mrr: number; // Monthly Recurring Revenue in cents
    arr: number; // Annual Recurring Revenue in cents
    activeSubscriptions: number;
    totalUsers: number;
    activeUsers: number; // Users active in last 30 days
    churnRate: number; // Percentage
    activationRate: number; // Percentage of users who completed key action
    trialConversionRate: number; // Percentage of trials that converted
    arpu: number; // Average Revenue Per User in cents
    ltv: number; // Lifetime Value estimate in cents
}

export interface MRRBreakdown {
    total: number;
    byPlan: {
        planId: string;
        planName: string;
        count: number;
        mrr: number;
    }[];
    newMRR: number;
    expansionMRR: number;
    contractionMRR: number;
    churnedMRR: number;
}

export interface ChurnAnalysis {
    currentMonth: number;
    previousMonth: number;
    trend: 'up' | 'down' | 'stable';
    byReason: {
        reason: string;
        count: number;
        percentage: number;
    }[];
}

export interface ActivationFunnel {
    signup: number;
    onboardingStarted: number;
    firstAction: number;
    subscribed: number;
    retained30Days: number;
}

export interface DailyMetrics {
    date: string;
    signups: number;
    activations: number;
    revenue: number;
    churn: number;
}

export interface UserActivity {
    dailyActiveUsers: number[];
    weeklyActiveUsers: number[];
    monthlyActiveUsers: number[];
    dates: string[];
}

// Event Properties
export interface EventProperties {
    userId?: string;
    organizationId?: string;
    planId?: string;
    source?: string;
    medium?: string;
    campaign?: string;
    [key: string]: string | number | boolean | undefined;
}

// Analytics Config
export interface AnalyticsConfig {
    posthogApiKey: string;
    posthogHost: string;
    sentryDsn: string;
    enableVercelAnalytics: boolean;
    enableProductAnalytics: boolean;
    enableErrorTracking: boolean;
}
