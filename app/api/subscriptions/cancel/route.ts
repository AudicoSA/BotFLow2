import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type { CancellationSurveyResponse, Subscription } from '@/lib/subscriptions/types';

interface CancelRequestBody extends CancellationSurveyResponse {
    organization_id: string;
}

// POST /api/subscriptions/cancel - Cancel subscription
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServerClient();

        const body = await request.json();
        const { organization_id, ...surveyResponse } = body as CancelRequestBody;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Get current subscription
        const { data: subscriptionData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organization_id)
            .single();

        const subscription = subscriptionData as Subscription | null;

        if (subError || !subscription) {
            return NextResponse.json(
                { error: 'No active subscription found' },
                { status: 404 }
            );
        }

        // Mark subscription for cancellation at period end
        const { data: updated, error: updateError } = await supabase
            .from('subscriptions')
            .update({
                cancel_at_period_end: true,
                canceled_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        // Record cancellation event with survey data
        await supabase.from('subscription_events').insert({
            subscription_id: subscription.id,
            event_type: 'cancellation_scheduled',
            data: {
                reason: surveyResponse.reason,
                feedback: surveyResponse.feedback,
                would_recommend: surveyResponse.would_recommend,
                effective_date: subscription.current_period_end,
            },
        });

        // Store survey response for analysis
        await supabase.from('cancellation_surveys').insert({
            subscription_id: subscription.id,
            organization_id,
            reason: surveyResponse.reason,
            feedback: surveyResponse.feedback,
            would_recommend: surveyResponse.would_recommend,
            plan_at_cancellation: subscription.plan_id,
        });

        return NextResponse.json({
            subscription: updated,
            message: 'Subscription will be canceled at the end of the billing period',
            cancel_date: subscription.current_period_end,
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return NextResponse.json(
            { error: 'Failed to cancel subscription' },
            { status: 500 }
        );
    }
}
