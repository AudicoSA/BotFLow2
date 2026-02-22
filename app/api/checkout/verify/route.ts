// Verify Checkout API Route
import { NextRequest, NextResponse } from 'next/server';
import { getPaystackClient } from '@/lib/paystack/client';
import { parseTransactionReference } from '@/lib/paystack/plans';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const reference = searchParams.get('reference');

        if (!reference) {
            return NextResponse.json(
                { error: 'Missing reference parameter' },
                { status: 400 }
            );
        }

        // Verify with Paystack
        const paystack = getPaystackClient();
        const transaction = await paystack.verifyTransaction(reference);

        // Parse reference to get plan info
        const parsedRef = parseTransactionReference(reference);

        // Build response
        const response = {
            success: transaction.status === 'success',
            data: {
                reference: transaction.reference,
                status: transaction.status,
                amount: transaction.amount,
                currency: transaction.currency,
                paidAt: transaction.paid_at,
                channel: transaction.channel,
                customer: {
                    email: transaction.customer?.email,
                    customerCode: transaction.customer?.customer_code,
                },
                plan: parsedRef ? { planId: parsedRef.planId } : null,
                authorization: transaction.authorization
                    ? {
                          cardType: transaction.authorization.card_type,
                          last4: transaction.authorization.last4,
                          bank: transaction.authorization.bank,
                      }
                    : null,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Verify transaction error:', error);

        const message = error instanceof Error ? error.message : 'Failed to verify transaction';
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
