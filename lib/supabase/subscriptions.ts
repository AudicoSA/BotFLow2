// Subscription Management Service
import { getSupabaseServerClient } from './client';
import type {
    Subscription,
    SubscriptionInsert,
    SubscriptionUpdate,
    SubscriptionStatus,
    PaymentHistoryInsert,
} from './types';
import type { PaystackSubscription, PaystackTransaction } from '../paystack/types';

const TABLE_SUBSCRIPTIONS = 'subscriptions';
const TABLE_PAYMENT_HISTORY = 'payment_history';
const TABLE_USERS = 'users';

/**
 * Create a new subscription record
 */
export async function createSubscription(
    data: SubscriptionInsert
): Promise<{ success: boolean; subscription?: Subscription; error?: string }> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Subscription>(TABLE_SUBSCRIPTIONS)
        .insert(data)
        .select()
        .single();

    if (result.error) {
        console.error('Error creating subscription:', result.error);
        return { success: false, error: result.error.message };
    }

    return { success: true, subscription: result.data || undefined };
}

/**
 * Update subscription by Paystack subscription code
 */
export async function updateSubscriptionByCode(
    subscriptionCode: string,
    data: SubscriptionUpdate
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Subscription>(TABLE_SUBSCRIPTIONS)
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('paystack_subscription_code', subscriptionCode)
        .select()
        .single();

    if (result.error) {
        console.error('Error updating subscription:', result.error);
        return { success: false, error: result.error.message };
    }

    return { success: true };
}

/**
 * Get subscription by user ID
 */
export async function getSubscriptionByUserId(
    userId: string
): Promise<Subscription | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Subscription>(TABLE_SUBSCRIPTIONS)
        .select()
        .eq('user_id', userId)
        .neq('status', 'cancelled')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    return result.data;
}

/**
 * Get subscription by Paystack subscription code
 */
export async function getSubscriptionByCode(
    subscriptionCode: string
): Promise<Subscription | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Subscription>(TABLE_SUBSCRIPTIONS)
        .select()
        .eq('paystack_subscription_code', subscriptionCode)
        .maybeSingle();

    return result.data;
}

/**
 * Record a payment in history
 */
export async function recordPayment(
    data: PaymentHistoryInsert
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from(TABLE_PAYMENT_HISTORY)
        .insert(data)
        .select();

    if (result.error) {
        console.error('Error recording payment:', result.error);
        return { success: false, error: result.error.message };
    }

    return { success: true };
}

/**
 * Update user's Paystack customer code
 */
export async function updateUserPaystackCustomer(
    userId: string,
    customerCode: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from(TABLE_USERS)
        .update({
            paystack_customer_code: customerCode,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select();

    if (result.error) {
        console.error('Error updating user:', result.error);
        return { success: false, error: result.error.message };
    }

    return { success: true };
}

/**
 * Convert Paystack subscription status to our status
 */
export function mapPaystackStatus(
    paystackStatus: PaystackSubscription['status']
): SubscriptionStatus {
    switch (paystackStatus) {
        case 'active':
            return 'active';
        case 'non-renewing':
            return 'active'; // Still active but won't renew
        case 'attention':
            return 'past_due';
        case 'cancelled':
        case 'completed':
            return 'cancelled';
        default:
            return 'active';
    }
}

/**
 * Handle subscription.create webhook event
 */
export async function handleSubscriptionCreate(
    data: PaystackSubscription,
    userId: string,
    planId: string
): Promise<{ success: boolean; error?: string }> {
    const startDate = new Date(data.start * 1000);
    const nextPaymentDate = data.next_payment_date
        ? new Date(data.next_payment_date)
        : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days default

    const subscriptionData: SubscriptionInsert = {
        user_id: userId,
        plan_id: planId,
        paystack_subscription_code: data.subscription_code,
        paystack_customer_code: data.customer.customer_code,
        status: mapPaystackStatus(data.status),
        current_period_start: startDate.toISOString(),
        current_period_end: nextPaymentDate.toISOString(),
        quantity: data.quantity || 1,
        metadata: {
            paystack_plan_code: data.plan?.plan_code,
            authorization_last4: data.authorization?.last4,
            card_type: data.authorization?.card_type,
        },
    };

    return createSubscription(subscriptionData);
}

/**
 * Handle subscription.disable (cancel) webhook event
 */
export async function handleSubscriptionCancel(
    data: PaystackSubscription
): Promise<{ success: boolean; error?: string }> {
    return updateSubscriptionByCode(data.subscription_code, {
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancel_at_period_end: false,
    });
}

/**
 * Handle charge.success webhook event
 */
export async function handleChargeSuccess(
    data: PaystackTransaction,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    // Find the subscription if this is a recurring charge
    const subscription = await getSubscriptionByCode(
        data.metadata?.subscription_code as string || ''
    );

    // Record the payment
    const paymentResult = await recordPayment({
        subscription_id: subscription?.id,
        user_id: userId,
        paystack_reference: data.reference,
        amount: data.amount,
        currency: data.currency,
        status: 'success',
        paid_at: data.paid_at || new Date().toISOString(),
        metadata: {
            channel: data.channel,
            gateway_response: data.gateway_response,
            authorization_last4: data.authorization?.last4,
        },
    });

    if (!paymentResult.success) {
        return paymentResult;
    }

    // If this is a subscription payment, update the period
    if (subscription) {
        const currentEnd = new Date(subscription.current_period_end);
        const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days

        return updateSubscriptionByCode(subscription.paystack_subscription_code, {
            current_period_start: subscription.current_period_end,
            current_period_end: newEnd.toISOString(),
            status: 'active',
        });
    }

    return { success: true };
}

/**
 * Handle invoice.payment_failed webhook event
 */
export async function handlePaymentFailed(
    subscriptionCode: string,
    userId: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    // Update subscription status
    const updateResult = await updateSubscriptionByCode(subscriptionCode, {
        status: 'past_due',
    });

    // Record the failed payment
    await recordPayment({
        user_id: userId,
        paystack_reference: `failed-${Date.now()}`,
        amount,
        currency: 'ZAR',
        status: 'failed',
        metadata: {
            reason: 'invoice_payment_failed',
            subscription_code: subscriptionCode,
        },
    });

    return updateResult;
}
