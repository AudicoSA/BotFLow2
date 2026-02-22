// Paystack API Types

export interface PaystackPlan {
    id: string;
    name: string;
    plan_code: string;
    description: string;
    amount: number; // in kobo (1 ZAR = 100 kobo)
    interval: 'monthly' | 'yearly' | 'weekly' | 'daily';
    currency: 'ZAR';
}

export interface PaystackCustomer {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    customer_code: string;
    metadata?: Record<string, unknown>;
}

export interface PaystackSubscription {
    id: number;
    subscription_code: string;
    customer: PaystackCustomer;
    plan: PaystackPlan;
    status: 'active' | 'non-renewing' | 'attention' | 'completed' | 'cancelled';
    quantity: number;
    amount: number;
    start: number; // Unix timestamp
    next_payment_date?: string;
    email_token?: string;
    authorization: {
        authorization_code: string;
        card_type: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        bank?: string;
    };
}

export interface PaystackTransaction {
    id: number;
    reference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'abandoned' | 'pending';
    gateway_response: string;
    paid_at?: string;
    created_at: string;
    channel: string;
    customer: PaystackCustomer;
    plan?: PaystackPlan;
    authorization?: {
        authorization_code: string;
        card_type: string;
        last4: string;
        exp_month: string;
        exp_year: string;
        bank?: string;
    };
    metadata?: Record<string, unknown>;
}

// Webhook event types - base type with generic data
export interface PaystackWebhookEventBase<T = Record<string, unknown>> {
    event: string;
    data: T;
}

export interface SubscriptionCreateEvent {
    event: 'subscription.create';
    data: PaystackSubscription;
}

export interface SubscriptionDisableEvent {
    event: 'subscription.disable' | 'subscription.not_renew';
    data: PaystackSubscription;
}

export interface ChargeSuccessEvent {
    event: 'charge.success';
    data: PaystackTransaction;
}

export interface InvoiceCreateEvent {
    event: 'invoice.create';
    data: {
        subscription: PaystackSubscription;
        invoice_code: string;
        amount: number;
        period_start: string;
        period_end: string;
        status: string;
    };
}

export interface InvoicePaymentFailedEvent {
    event: 'invoice.payment_failed';
    data: {
        subscription: PaystackSubscription;
        invoice_code: string;
        amount: number;
        description: string;
    };
}

export type PaystackEvent =
    | SubscriptionCreateEvent
    | SubscriptionDisableEvent
    | ChargeSuccessEvent
    | InvoiceCreateEvent
    | InvoicePaymentFailedEvent;

// API Response types
export interface PaystackAPIResponse<T> {
    status: boolean;
    message: string;
    data: T;
}

// Initialize transaction response
export interface InitializeTransactionResponse {
    authorization_url: string;
    access_code: string;
    reference: string;
}

// Verify transaction response
export interface VerifyTransactionResponse extends PaystackTransaction {
    plan_object?: PaystackPlan;
}
