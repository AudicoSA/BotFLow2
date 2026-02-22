import { NextRequest, NextResponse } from 'next/server';
import {
    getOrganizationInvoices,
    generateInvoice,
    getInvoiceStats,
    createPaystackInvoice,
    sendPaystackInvoice,
    getCurrentBillingPeriod,
} from '@/lib/billing';

// GET /api/billing/invoices - Get invoices for organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const limit = searchParams.get('limit');
        const includeStats = searchParams.get('include_stats') === 'true';

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const invoices = await getOrganizationInvoices(
            organizationId,
            limit ? parseInt(limit, 10) : undefined
        );

        const response: Record<string, unknown> = { invoices };

        if (includeStats) {
            const stats = await getInvoiceStats(organizationId);
            response.stats = stats;
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}

// POST /api/billing/invoices - Generate a new invoice
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organization_id, billing_period, send_to_paystack = true } = body;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Generate invoice
        const invoice = await generateInvoice(
            organization_id,
            billing_period || undefined
        );

        // Create and send via Paystack if requested
        if (send_to_paystack && invoice.total > 0) {
            const paystackResult = await createPaystackInvoice(invoice.id);

            if (paystackResult.success && paystackResult.paystackInvoiceId) {
                await sendPaystackInvoice(paystackResult.paystackInvoiceId);
            }

            return NextResponse.json({
                invoice,
                paystack: paystackResult,
            });
        }

        return NextResponse.json({ invoice });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to generate invoice';
        console.error('Error generating invoice:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
