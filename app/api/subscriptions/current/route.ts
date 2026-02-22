import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type { Subscription } from '@/lib/subscriptions/types';

// GET /api/subscriptions/current - Get subscription for organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServerClient();

        // Get subscription
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organizationId)
            .single();

        if (subError && subError.message !== 'No rows found') {
            throw subError;
        }

        // Return free plan if no subscription exists
        if (!subscription) {
            return NextResponse.json({
                subscription: {
                    id: 'free',
                    organization_id: organizationId,
                    plan_id: 'free',
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                } as Subscription,
            });
        }

        return NextResponse.json({ subscription });
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return NextResponse.json(
            { error: 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
