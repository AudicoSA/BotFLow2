import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

// GET /api/billing/payment-methods - Get payment methods
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

        // Get payment methods
        const { data: paymentMethod, error: pmError } = await supabase
            .from('payment_methods')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('is_default', true)
            .single();

        if (pmError && pmError.message !== 'No rows found') {
            throw pmError;
        }

        return NextResponse.json({
            payment_method: paymentMethod || null,
        });
    } catch (error) {
        console.error('Error fetching payment methods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payment methods' },
            { status: 500 }
        );
    }
}

// POST /api/billing/payment-methods - Add new payment method
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServerClient();

        const body = await request.json();
        const { organization_id, authorization_code, card_type, last4, exp_month, exp_year, bank } = body;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Remove default flag from existing payment methods
        await supabase
            .from('payment_methods')
            .update({ is_default: false })
            .eq('organization_id', organization_id);

        // Add new payment method
        const { data: newPM, error: createError } = await supabase
            .from('payment_methods')
            .insert({
                organization_id,
                type: 'card',
                brand: card_type || 'Unknown',
                last4: last4 || '****',
                exp_month: exp_month || 12,
                exp_year: exp_year || 2025,
                authorization_code,
                bank,
                is_default: true,
            })
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        return NextResponse.json({ payment_method: newPM });
    } catch (error) {
        console.error('Error adding payment method:', error);
        return NextResponse.json(
            { error: 'Failed to add payment method' },
            { status: 500 }
        );
    }
}
