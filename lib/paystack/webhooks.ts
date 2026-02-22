// Paystack Webhook Handling
import crypto from 'crypto';
import type {
    PaystackEvent,
    SubscriptionCreateEvent,
    SubscriptionDisableEvent,
    ChargeSuccessEvent,
    InvoicePaymentFailedEvent,
} from './types';

/**
 * Verify Paystack webhook signature
 */
export function verifyWebhookSignature(
    payload: string,
    signature: string,
    secret?: string
): boolean {
    const webhookSecret = secret || process.env.PAYSTACK_SECRET_KEY;
    if (!webhookSecret) {
        console.error('Paystack secret key not configured');
        return false;
    }

    const hash = crypto
        .createHmac('sha512', webhookSecret)
        .update(payload)
        .digest('hex');

    return hash === signature;
}

/**
 * Parse webhook event
 */
export function parseWebhookEvent(body: unknown): PaystackEvent | null {
    if (!body || typeof body !== 'object') {
        return null;
    }

    const event = body as PaystackEvent;
    if (!event.event || !event.data) {
        return null;
    }

    return event;
}

// Event type guards
export function isSubscriptionCreateEvent(
    event: PaystackEvent
): event is SubscriptionCreateEvent {
    return event.event === 'subscription.create';
}

export function isSubscriptionDisableEvent(
    event: PaystackEvent
): event is SubscriptionDisableEvent {
    return (
        event.event === 'subscription.disable' ||
        event.event === 'subscription.not_renew'
    );
}

export function isChargeSuccessEvent(
    event: PaystackEvent
): event is ChargeSuccessEvent {
    return event.event === 'charge.success';
}

export function isInvoicePaymentFailedEvent(
    event: PaystackEvent
): event is InvoicePaymentFailedEvent {
    return event.event === 'invoice.payment_failed';
}

/**
 * Webhook event handlers interface
 */
export interface WebhookHandlers {
    onSubscriptionCreate?: (data: SubscriptionCreateEvent['data']) => Promise<void>;
    onSubscriptionCancel?: (data: SubscriptionDisableEvent['data']) => Promise<void>;
    onChargeSuccess?: (data: ChargeSuccessEvent['data']) => Promise<void>;
    onInvoicePaymentFailed?: (data: InvoicePaymentFailedEvent['data']) => Promise<void>;
}

/**
 * Process webhook event with handlers
 */
export async function processWebhookEvent(
    event: PaystackEvent,
    handlers: WebhookHandlers
): Promise<{ handled: boolean; eventType: string }> {
    const eventType = event.event;

    if (isSubscriptionCreateEvent(event) && handlers.onSubscriptionCreate) {
        await handlers.onSubscriptionCreate(event.data);
        return { handled: true, eventType };
    }

    if (isSubscriptionDisableEvent(event) && handlers.onSubscriptionCancel) {
        await handlers.onSubscriptionCancel(event.data);
        return { handled: true, eventType };
    }

    if (isChargeSuccessEvent(event) && handlers.onChargeSuccess) {
        await handlers.onChargeSuccess(event.data);
        return { handled: true, eventType };
    }

    if (isInvoicePaymentFailedEvent(event) && handlers.onInvoicePaymentFailed) {
        await handlers.onInvoicePaymentFailed(event.data);
        return { handled: true, eventType };
    }

    return { handled: false, eventType };
}
