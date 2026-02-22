// Supabase Database Types

export type SubscriptionStatus =
    | 'trialing'
    | 'active'
    | 'past_due'
    | 'cancelled'
    | 'unpaid'
    | 'paused';

export interface Subscription {
    id: string;
    user_id: string;
    organization_id?: string;
    plan_id: string;
    paystack_subscription_code: string;
    paystack_customer_code: string;
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end: boolean;
    cancelled_at?: string;
    quantity: number; // For per-user plans
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionInsert {
    user_id: string;
    organization_id?: string;
    plan_id: string;
    paystack_subscription_code: string;
    paystack_customer_code: string;
    status: SubscriptionStatus;
    current_period_start: string;
    current_period_end: string;
    cancel_at_period_end?: boolean;
    quantity?: number;
    metadata?: Record<string, unknown>;
}

export interface SubscriptionUpdate {
    status?: SubscriptionStatus;
    current_period_start?: string;
    current_period_end?: string;
    cancel_at_period_end?: boolean;
    cancelled_at?: string;
    quantity?: number;
    metadata?: Record<string, unknown>;
    updated_at?: string;
}

export interface PaymentHistory {
    id: string;
    subscription_id: string;
    user_id: string;
    paystack_reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    paid_at?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
}

export interface PaymentHistoryInsert {
    subscription_id?: string;
    user_id: string;
    paystack_reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    paid_at?: string;
    metadata?: Record<string, unknown>;
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    paystack_customer_code?: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    updated_at: string;
}
