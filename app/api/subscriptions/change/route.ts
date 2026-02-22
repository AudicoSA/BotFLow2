import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';
import type { PlanId, PlanChangePreview, Subscription } from '@/lib/subscriptions/types';
import { getPlanById } from '@/lib/subscriptions/types';

// POST /api/subscriptions/change - Change subscription plan
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServerClient();

        const body = await request.json();
        const { organization_id, plan_id, preview } = body as {
            organization_id: string;
            plan_id: PlanId;
            preview: PlanChangePreview;
        };

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        if (!plan_id) {
            return NextResponse.json(
                { error: 'plan_id is required' },
                { status: 400 }
            );
        }

        // Get current subscription
        const { data: currentSubData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organization_id)
            .single();

        const currentSub = currentSubData as Subscription | null;
        const newPlan = getPlanById(plan_id);
        const isUpgrade = preview?.immediate ?? true;

        if (currentSub) {
            // Update existing subscription
            const updateData: Record<string, unknown> = {
                plan_id,
                updated_at: new Date().toISOString(),
            };

            if (isUpgrade) {
                // Immediate upgrade
                updateData.status = 'active';
                updateData.cancel_at_period_end = false;
            } else {
                // Downgrade at period end
                updateData.pending_plan_id = plan_id;
            }

            const { data: updated, error: updateError } = await supabase
                .from('subscriptions')
                .update(updateData)
                .eq('id', currentSub.id)
                .select()
                .single();

            if (updateError) {
                throw updateError;
            }

            // Record plan change event
            await supabase.from('subscription_events').insert({
                subscription_id: currentSub.id,
                event_type: isUpgrade ? 'plan_upgraded' : 'plan_downgrade_scheduled',
                data: {
                    from_plan: currentSub.plan_id,
                    to_plan: plan_id,
                    proration_amount: preview?.proration_amount,
                    effective_date: preview?.effective_date,
                },
            });

            // If proration is positive (upgrade), create a charge
            if (isUpgrade && preview?.proration_amount && preview.proration_amount > 0) {
                await supabase.from('billing_events').insert({
                    organization_id,
                    event_type: 'proration_charge',
                    amount: preview.proration_amount,
                    description: `Prorated charge for upgrade to ${newPlan.name}`,
                    status: 'pending',
                });
            }

            return NextResponse.json({
                subscription: updated,
                message: isUpgrade
                    ? `Successfully upgraded to ${newPlan.name}`
                    : `Plan will change to ${newPlan.name} at the end of the billing period`,
            });
        } else {
            // Create new subscription
            const { data: newSub, error: createError } = await supabase
                .from('subscriptions')
                .insert({
                    organization_id,
                    plan_id,
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    cancel_at_period_end: false,
                })
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            return NextResponse.json({
                subscription: newSub,
                message: `Successfully subscribed to ${newPlan.name}`,
            });
        }
    } catch (error) {
        console.error('Error changing plan:', error);
        return NextResponse.json(
            { error: 'Failed to change plan' },
            { status: 500 }
        );
    }
}
