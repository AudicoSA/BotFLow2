import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase/client';

// POST /api/billing/payment-methods/update - Initialize payment method update
export async function POST(request: NextRequest) {
    try {
        const supabase = getSupabaseServerClient();

        const body = await request.json();
        const { organization_id, email } = body;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Get organization details for Paystack
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .select('paystack_customer_code, email')
            .eq('id', organization_id)
            .single();

        if (orgError && orgError.message !== 'No rows found') {
            throw orgError;
        }

        const orgData = org as { email?: string; paystack_customer_code?: string } | null;

        // Initialize Paystack transaction for card update
        const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
        if (!paystackSecretKey) {
            return NextResponse.json(
                { error: 'Payment system not configured' },
                { status: 500 }
            );
        }

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings?payment_updated=true`;

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${paystackSecretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: orgData?.email || email,
                amount: 100, // Minimum amount in kobo (R1)
                currency: 'ZAR',
                callback_url: callbackUrl,
                metadata: {
                    organization_id,
                    purpose: 'payment_method_update',
                },
                channels: ['card'],
            }),
        });

        const result = await response.json();

        if (!result.status) {
            return NextResponse.json(
                { error: result.message || 'Failed to initialize payment' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            redirect_url: result.data.authorization_url,
            reference: result.data.reference,
        });
    } catch (error) {
        console.error('Error initializing payment method update:', error);
        return NextResponse.json(
            { error: 'Failed to update payment method' },
            { status: 500 }
        );
    }
}
