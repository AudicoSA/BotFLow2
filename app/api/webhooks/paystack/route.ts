// Paystack Webhooks Handler
import { NextRequest, NextResponse } from 'next/server';
import {
    verifyWebhookSignature,
    parseWebhookEvent,
    isSubscriptionCreateEvent,
    isSubscriptionDisableEvent,
    isChargeSuccessEvent,
    isInvoicePaymentFailedEvent,
} from '@/lib/paystack/webhooks';
import {
    handleSubscriptionCreate,
    handleSubscriptionCancel,
    handleChargeSuccess,
    handlePaymentFailed,
} from '@/lib/supabase/subscriptions';
import type { PaystackSubscription, PaystackTransaction } from '@/lib/paystack/types';

export async function POST(request: NextRequest) {
    try {
        // Get raw body and signature
        const rawBody = await request.text();
        const signature = request.headers.get('x-paystack-signature') || '';

        // Verify signature
        if (!verifyWebhookSignature(rawBody, signature)) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        // Parse event
        const body = JSON.parse(rawBody);
        const event = parseWebhookEvent(body);

        if (!event) {
            console.error('Invalid webhook payload');
            return NextResponse.json(
                { error: 'Invalid payload' },
                { status: 400 }
            );
        }

        console.log(`Processing Paystack webhook: ${event.event}`);

        // Handle different event types
        if (isSubscriptionCreateEvent(event)) {
            const subscriptionData = event.data as PaystackSubscription;
            const metadata = subscriptionData.customer?.metadata as Record<string, unknown> || {};
            const userId = (metadata.user_id as string) || '';
            const planId = (metadata.plan_id as string) || '';

            if (userId && planId) {
                const result = await handleSubscriptionCreate(subscriptionData, userId, planId);
                if (!result.success) {
                    console.error('Failed to handle subscription create:', result.error);
                }
            } else {
                console.warn('Missing user_id or plan_id in subscription metadata');
            }
        }

        if (isSubscriptionDisableEvent(event)) {
            const subscriptionData = event.data as PaystackSubscription;
            const result = await handleSubscriptionCancel(subscriptionData);
            if (!result.success) {
                console.error('Failed to handle subscription cancel:', result.error);
            }
        }

        if (isChargeSuccessEvent(event)) {
            const transactionData = event.data as PaystackTransaction;
            const metadata = transactionData.metadata as Record<string, unknown> || {};
            const userId = (metadata.user_id as string) || '';

            if (userId) {
                const result = await handleChargeSuccess(transactionData, userId);
                if (!result.success) {
                    console.error('Failed to handle charge success:', result.error);
                }
            }
        }

        if (isInvoicePaymentFailedEvent(event)) {
            const data = event.data as {
                subscription: PaystackSubscription;
                amount: number;
            };
            const metadata = data.subscription?.customer?.metadata as Record<string, unknown> || {};
            const userId = (metadata.user_id as string) || '';

            if (userId && data.subscription?.subscription_code) {
                const result = await handlePaymentFailed(
                    data.subscription.subscription_code,
                    userId,
                    data.amount
                );
                if (!result.success) {
                    console.error('Failed to handle payment failed:', result.error);
                }
            }
        }

        // Always return 200 to acknowledge receipt
        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook processing error:', error);

        // Still return 200 to prevent Paystack from retrying
        // Log the error for investigation
        return NextResponse.json({ received: true, error: 'Processing error logged' });
    }
}

// Disable body parsing for raw body access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
