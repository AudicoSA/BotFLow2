import { NextRequest, NextResponse } from 'next/server';
import {
    getInvoice,
    updateInvoiceStatus,
    markInvoicePaid,
    getInvoicePdfUrl,
    syncInvoiceStatus,
} from '@/lib/billing';
import type { InvoiceStatus } from '@/lib/billing/types';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/billing/invoices/[id] - Get specific invoice
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const invoice = await getInvoice(id);

        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Get PDF URL if available
        const pdfUrl = await getInvoicePdfUrl(id);

        return NextResponse.json({
            invoice,
            pdf_url: pdfUrl,
        });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        return NextResponse.json(
            { error: 'Failed to fetch invoice' },
            { status: 500 }
        );
    }
}

// PATCH /api/billing/invoices/[id] - Update invoice status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, paystack_reference } = body;

        // Verify invoice exists
        const existingInvoice = await getInvoice(id);
        if (!existingInvoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Handle marking as paid
        if (status === 'paid') {
            const updatedInvoice = await markInvoicePaid(id, paystack_reference);
            return NextResponse.json({ invoice: updatedInvoice });
        }

        // Update to other status
        const validStatuses: InvoiceStatus[] = [
            'draft',
            'pending',
            'paid',
            'overdue',
            'cancelled',
        ];

        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status' },
                { status: 400 }
            );
        }

        const updatedInvoice = await updateInvoiceStatus(id, status);

        return NextResponse.json({ invoice: updatedInvoice });
    } catch (error) {
        console.error('Error updating invoice:', error);
        return NextResponse.json(
            { error: 'Failed to update invoice' },
            { status: 500 }
        );
    }
}

// POST /api/billing/invoices/[id] - Sync invoice status with Paystack
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json().catch(() => ({}));
        const { action } = body;

        // Verify invoice exists
        const invoice = await getInvoice(id);
        if (!invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        if (action === 'sync') {
            // Sync status with Paystack
            const synced = await syncInvoiceStatus(id);
            const updatedInvoice = await getInvoice(id);

            return NextResponse.json({
                synced,
                invoice: updatedInvoice,
            });
        }

        return NextResponse.json(
            { error: 'Invalid action' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Error processing invoice action:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}
