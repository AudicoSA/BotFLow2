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
import { sendPaymentFailedEmail, sendSubscriptionRenewalEmail } from '@/lib/email/service';
import { cancelScheduledEmails } from '@/lib/email/campaigns';
import { appConfig } from '@/lib/config/environment';
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
                } else {
                    // Cancel trial reminder emails since user upgraded
                    await cancelScheduledEmails(userId, 'trial');
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
            const userEmail = transactionData.customer?.email || '';
            const userName = (metadata.user_name as string) || 'Customer';

            if (userId) {
                const result = await handleChargeSuccess(transactionData, userId);
                if (!result.success) {
                    console.error('Failed to handle charge success:', result.error);
                } else if (userEmail && transactionData.plan?.name) {
                    // Send subscription renewal confirmation email
                    const amount = (transactionData.amount / 100).toFixed(2);
                    await sendSubscriptionRenewalEmail(
                        userEmail,
                        userId,
                        {
                            userName,
                            planName: transactionData.plan.name,
                            amount,
                            currency: transactionData.currency || 'ZAR',
                            renewalDate: new Date().toLocaleDateString('en-ZA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }),
                            invoiceUrl: `${appConfig.url}/dashboard/settings/billing`,
                        }
                    );
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
            const userEmail = data.subscription?.customer?.email || '';
            const userName = (metadata.user_name as string) || 'Customer';

            if (userId && data.subscription?.subscription_code) {
                const result = await handlePaymentFailed(
                    data.subscription.subscription_code,
                    userId,
                    data.amount
                );
                if (!result.success) {
                    console.error('Failed to handle payment failed:', result.error);
                } else if (userEmail) {
                    // Send payment failed notification email
                    const amount = (data.amount / 100).toFixed(2);
                    const retryDate = new Date();
                    retryDate.setDate(retryDate.getDate() + 3); // Retry in 3 days

                    await sendPaymentFailedEmail(
                        userEmail,
                        userId,
                        {
                            userName,
                            amount,
                            currency: 'ZAR',
                            failureReason: 'Payment could not be processed',
                            retryDate: retryDate.toLocaleDateString('en-ZA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }),
                            updatePaymentUrl: `${appConfig.url}/dashboard/settings/billing?update=payment`,
                        }
                    );
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
