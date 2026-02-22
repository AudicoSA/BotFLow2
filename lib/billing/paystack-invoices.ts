// Paystack Invoice Integration

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { updateInvoiceStatus, getInvoice, markInvoicePaid } from './charges';
import { formatCurrency } from './types';
import type { Invoice, InvoiceLineItem } from './types';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API_URL = 'https://api.paystack.co';

interface PaystackCustomer {
    id: number;
    customer_code: string;
    email: string;
    first_name: string;
    last_name: string;
}

interface PaystackInvoiceResponse {
    status: boolean;
    message: string;
    data: {
        id: number;
        invoice_number: string;
        request_code: string;
        amount: number;
        due_date: string;
        status: string;
        pdf_url: string;
        paid: boolean;
    };
}

interface PaystackListResponse<T> {
    status: boolean;
    message: string;
    data: T[];
}

/**
 * Make a request to Paystack API
 */
async function paystackRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' = 'GET',
    body?: Record<string, unknown>
): Promise<T> {
    const response = await fetch(`${PAYSTACK_API_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            error.message || `Paystack API error: ${response.status}`
        );
    }

    return response.json();
}

/**
 * Get or create Paystack customer for organization
 */
export async function getOrCreatePaystackCustomer(
    organizationId: string
): Promise<PaystackCustomer | null> {
    const supabase = getSupabaseServerClient();

    // Get organization with owner info
    const orgResult = await supabase
        .from('organizations')
        .select('id, name, owner_email, paystack_customer_code')
        .eq('id', organizationId)
        .single();

    const org = orgResult.data as Record<string, unknown> | null;
    if (!org) return null;

    // If customer code exists, fetch from Paystack
    if (org.paystack_customer_code) {
        try {
            const response = await paystackRequest<{
                status: boolean;
                data: PaystackCustomer;
            }>(`/customer/${org.paystack_customer_code}`);

            if (response.status && response.data) {
                return response.data;
            }
        } catch (error) {
            console.error('Failed to fetch Paystack customer:', error);
        }
    }

    // Create new customer
    try {
        const response = await paystackRequest<{
            status: boolean;
            data: PaystackCustomer;
        }>('/customer', 'POST', {
            email: org.owner_email,
            first_name: org.name,
            metadata: {
                organization_id: organizationId,
            },
        });

        if (response.status && response.data) {
            // Save customer code to organization
            await supabase
                .from('organizations')
                .update({ paystack_customer_code: response.data.customer_code })
                .eq('id', organizationId);

            return response.data;
        }
    } catch (error) {
        console.error('Failed to create Paystack customer:', error);
    }

    return null;
}

/**
 * Create Paystack invoice for a local invoice
 */
export async function createPaystackInvoice(
    invoiceId: string
): Promise<{ success: boolean; paystackInvoiceId?: string; error?: string }> {
    const invoice = await getInvoice(invoiceId);
    if (!invoice) {
        return { success: false, error: 'Invoice not found' };
    }

    // Get customer
    const customer = await getOrCreatePaystackCustomer(invoice.organization_id);
    if (!customer) {
        return { success: false, error: 'Failed to get/create customer' };
    }

    // Build line items for Paystack
    const lineItems = invoice.line_items.map((item) => ({
        name: item.description,
        amount: item.total, // In kobo/cents
        quantity: item.quantity,
    }));

    // Add VAT as a line item if applicable
    if (invoice.tax > 0) {
        lineItems.push({
            name: 'VAT (15%)',
            amount: invoice.tax,
            quantity: 1,
        });
    }

    try {
        const response = await paystackRequest<PaystackInvoiceResponse>(
            '/paymentrequest',
            'POST',
            {
                customer: customer.customer_code,
                amount: invoice.total,
                due_date: invoice.due_date.split('T')[0], // YYYY-MM-DD format
                description: `BotFlow Invoice for ${invoice.billing_period}`,
                line_items: lineItems,
                currency: 'ZAR',
                metadata: {
                    invoice_id: invoice.id,
                    organization_id: invoice.organization_id,
                    billing_period: invoice.billing_period,
                },
            }
        );

        if (response.status && response.data) {
            // Update local invoice with Paystack ID
            await updateInvoiceStatus(
                invoiceId,
                'pending',
                response.data.request_code,
                response.data.pdf_url
            );

            return {
                success: true,
                paystackInvoiceId: response.data.request_code,
            };
        }

        return { success: false, error: response.message };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to create Paystack invoice:', error);
        return { success: false, error: message };
    }
}

/**
 * Send invoice via Paystack (email notification)
 */
export async function sendPaystackInvoice(
    paystackInvoiceCode: string
): Promise<boolean> {
    try {
        const response = await paystackRequest<{ status: boolean }>(
            `/paymentrequest/notify/${paystackInvoiceCode}`,
            'POST'
        );
        return response.status;
    } catch (error) {
        console.error('Failed to send Paystack invoice:', error);
        return false;
    }
}

/**
 * Get Paystack invoice status
 */
export async function getPaystackInvoiceStatus(
    paystackInvoiceCode: string
): Promise<{ status: string; paid: boolean; pdfUrl?: string } | null> {
    try {
        const response = await paystackRequest<PaystackInvoiceResponse>(
            `/paymentrequest/${paystackInvoiceCode}`
        );

        if (response.status && response.data) {
            return {
                status: response.data.status,
                paid: response.data.paid,
                pdfUrl: response.data.pdf_url,
            };
        }

        return null;
    } catch (error) {
        console.error('Failed to get Paystack invoice status:', error);
        return null;
    }
}

/**
 * Sync invoice status from Paystack
 */
export async function syncInvoiceStatus(invoiceId: string): Promise<boolean> {
    const invoice = await getInvoice(invoiceId);
    if (!invoice || !invoice.paystack_invoice_id) {
        return false;
    }

    const paystackStatus = await getPaystackInvoiceStatus(
        invoice.paystack_invoice_id
    );
    if (!paystackStatus) {
        return false;
    }

    if (paystackStatus.paid && invoice.status !== 'paid') {
        await markInvoicePaid(invoiceId);
        return true;
    }

    return false;
}

/**
 * Archive/void a Paystack invoice
 */
export async function voidPaystackInvoice(
    paystackInvoiceCode: string
): Promise<boolean> {
    try {
        const response = await paystackRequest<{ status: boolean }>(
            `/paymentrequest/archive/${paystackInvoiceCode}`,
            'POST'
        );
        return response.status;
    } catch (error) {
        console.error('Failed to void Paystack invoice:', error);
        return false;
    }
}

/**
 * Handle Paystack invoice webhook
 */
export async function handlePaystackInvoiceWebhook(
    event: string,
    data: Record<string, unknown>
): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    switch (event) {
        case 'paymentrequest.success': {
            // Invoice was paid
            const requestCode = data.request_code as string;
            const metadata = data.metadata as Record<string, string>;

            if (metadata?.invoice_id) {
                await markInvoicePaid(metadata.invoice_id);
                return true;
            }

            // Find invoice by Paystack code
            const invoiceResult = await supabase
                .from<Invoice>('invoices')
                .select('id')
                .eq('paystack_invoice_id', requestCode)
                .single();

            if (invoiceResult.data) {
                await markInvoicePaid(invoiceResult.data.id);
                return true;
            }
            break;
        }

        case 'paymentrequest.pending': {
            // Invoice is pending payment
            const requestCode = data.request_code as string;
            const metadata = data.metadata as Record<string, string>;

            if (metadata?.invoice_id) {
                await updateInvoiceStatus(metadata.invoice_id, 'pending');
                return true;
            }
            break;
        }

        default:
            console.log('Unhandled Paystack invoice event:', event);
    }

    return false;
}

/**
 * Generate invoice PDF URL
 */
export async function getInvoicePdfUrl(invoiceId: string): Promise<string | null> {
    const invoice = await getInvoice(invoiceId);
    if (!invoice) return null;

    // If we have Paystack PDF URL, return it
    if (invoice.pdf_url) {
        return invoice.pdf_url;
    }

    // If no Paystack invoice yet but we have the code, fetch it
    if (invoice.paystack_invoice_id) {
        const status = await getPaystackInvoiceStatus(invoice.paystack_invoice_id);
        if (status?.pdfUrl) {
            // Update the stored URL
            await updateInvoiceStatus(
                invoiceId,
                invoice.status,
                undefined,
                status.pdfUrl
            );
            return status.pdfUrl;
        }
    }

    return null;
}
