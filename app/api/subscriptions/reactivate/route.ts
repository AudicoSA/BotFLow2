import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type { Subscription } from '@/lib/subscriptions/types';

// POST /api/subscriptions/reactivate - Reactivate a canceled subscription
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServerClient();

        const body = await request.json();
        const { organization_id } = body;

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
                { error: 'No subscription found' },
                { status: 404 }
            );
        }

        // Check if subscription is pending cancellation
        if (!subscription.cancel_at_period_end) {
            return NextResponse.json(
                { error: 'Subscription is not pending cancellation' },
                { status: 400 }
            );
        }

        // Reactivate subscription
        const { data: updated, error: updateError } = await supabase
            .from('subscriptions')
            .update({
                cancel_at_period_end: false,
                canceled_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', subscription.id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        // Record reactivation event
        await supabase.from('subscription_events').insert({
            subscription_id: subscription.id,
            event_type: 'reactivated',
            data: {
                organization_id,
            },
        });

        return NextResponse.json({
            subscription: updated,
            message: 'Subscription has been reactivated',
        });
    } catch (error) {
        console.error('Error reactivating subscription:', error);
        return NextResponse.json(
            { error: 'Failed to reactivate subscription' },
            { status: 500 }
        );
    }
}
