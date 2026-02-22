// Checkout API Route - Initialize Paystack transaction
import { NextRequest, NextResponse } from 'next/server';
import { getPaystackClient } from '@/lib/paystack/client';
import { getPlan, generateTransactionReference } from '@/lib/paystack/plans';

interface CheckoutRequestBody {
    planId: string;
    email: string;
    userId?: string;
    quantity?: number; // For per-user plans
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequestBody = await request.json();

        // Validate required fields
        if (!body.planId || !body.email) {
            return NextResponse.json(
                { error: 'Missing required fields: planId and email' },
                { status: 400 }
            );
        }

        // Get plan details
        const plan = getPlan(body.planId);
        if (!plan) {
            return NextResponse.json(
                { error: 'Invalid plan ID' },
                { status: 400 }
            );
        }

        // Calculate amount (handle per-user pricing)
        const quantity = body.quantity || 1;
        const amount = plan.perUser ? plan.priceInCents * quantity : plan.priceInCents;

        // Generate unique reference
        const reference = generateTransactionReference(body.planId, body.userId);

        // Get Paystack client
        const paystack = getPaystackClient();

        // Build callback URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://botflow.co.za';
        const callbackUrl = body.callbackUrl || `${baseUrl}/checkout/callback`;

        // Initialize transaction
        const transaction = await paystack.initializeTransaction({
            email: body.email,
            amount,
            reference,
            callback_url: callbackUrl,
            plan: plan.planCode, // This creates a subscription if plan code is provided
            metadata: {
                plan_id: body.planId,
                user_id: body.userId,
                quantity,
                ...body.metadata,
            },
            channels: ['card', 'bank', 'bank_transfer', 'eft'],
        });

        return NextResponse.json({
            success: true,
            data: {
                authorizationUrl: transaction.authorization_url,
                accessCode: transaction.access_code,
                reference: transaction.reference,
                plan: {
                    id: plan.id,
                    name: plan.name,
                    amount,
                    displayPrice: plan.displayPrice,
                },
            },
        });
    } catch (error) {
        console.error('Checkout error:', error);

        const message = error instanceof Error ? error.message : 'Failed to initialize checkout';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
