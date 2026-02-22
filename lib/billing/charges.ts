// Monthly Charge Calculation

import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
    getUsageSummary,
    calculateOverageCharges,
    getUsageByType,
} from './usage-storage';
import {
    getCurrentBillingPeriod,
    PLAN_PRICING,
    USAGE_PRICING,
    formatCurrency,
    getUsageTypeService,
} from './types';
import type {
    Invoice,
    InvoiceLineItem,
    InvoiceStatus,
    UsageType,
    ServiceType,
} from './types';
import { generateSecureToken } from '@/lib/auth/password';

interface Subscription {
    id: string;
    organization_id: string;
    plan_id: string;
    status: string;
    user_count: number;
    current_period_start: string;
    current_period_end: string;
}

/**
 * Calculate total monthly charges for an organization
 */
export async function calculateMonthlyCharges(
    organizationId: string,
    billingPeriod?: string
): Promise<{
    basePlan: number;
    overageCharges: number;
    total: number;
    breakdown: InvoiceLineItem[];
}> {
    const supabase = getSupabaseServerClient();
    const period = billingPeriod || getCurrentBillingPeriod().period_key;

    // Get subscription info
    const subscriptionResult = await supabase
        .from<Subscription>('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single();

    const subscription = subscriptionResult.data;
    const breakdown: InvoiceLineItem[] = [];
    let basePlan = 0;

    // Calculate base plan cost
    if (subscription) {
        const planId = subscription.plan_id as keyof typeof PLAN_PRICING;
        const planConfig = PLAN_PRICING[planId];

        if (planConfig) {
            if ('per_user' in planConfig && planConfig.per_user) {
                // Per-user pricing (Receipt Assistant)
                const userCount = subscription.user_count || 1;
                basePlan = planConfig.base_price * userCount;
                breakdown.push({
                    description: `${planConfig.name} (${userCount} users)`,
                    quantity: userCount,
                    unit_price: planConfig.base_price,
                    total: basePlan,
                    service: planId as ServiceType,
                    usage_type: 'receipt_processed',
                });
            } else {
                // Flat monthly pricing
                basePlan = planConfig.base_price;
                breakdown.push({
                    description: planConfig.name,
                    quantity: 1,
                    unit_price: planConfig.base_price,
                    total: basePlan,
                    service: planId as ServiceType,
                    usage_type: 'ai_conversation',
                });
            }
        }
    }

    // Calculate overage charges
    const { charges: overageMap, total: overageTotal } =
        await calculateOverageCharges(organizationId, period);

    // Add overage line items
    for (const [usageType, charge] of overageMap) {
        if (charge > 0) {
            const usageByType = await getUsageByType(organizationId, period);
            const quantity = usageByType.get(usageType) || 0;
            const pricing = USAGE_PRICING[usageType];
            const included = pricing.included_in_plan;
            const overage = Math.max(0, quantity - included);

            breakdown.push({
                description: `${pricing.description} Overage (${overage.toLocaleString()} over ${included.toLocaleString()} included)`,
                quantity: overage,
                unit_price: Math.round(pricing.overage_price * 100),
                total: charge,
                service: getUsageTypeService(usageType),
                usage_type: usageType,
            });
        }
    }

    return {
        basePlan,
        overageCharges: overageTotal,
        total: basePlan + overageTotal,
        breakdown,
    };
}

/**
 * Generate invoice for an organization
 */
export async function generateInvoice(
    organizationId: string,
    billingPeriod?: string
): Promise<Invoice> {
    const supabase = getSupabaseServerClient();
    const period = billingPeriod || getCurrentBillingPeriod().period_key;

    // Calculate charges
    const charges = await calculateMonthlyCharges(organizationId, period);

    // Calculate VAT (15% for South Africa)
    const taxRate = 0.15;
    const subtotal = charges.total;
    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    // Calculate due date (end of current period + 7 days)
    const [year, month] = period.split('-').map(Number);
    const periodEnd = new Date(year, month, 0); // Last day of month
    const dueDate = new Date(periodEnd);
    dueDate.setDate(dueDate.getDate() + 7);

    // Create invoice record
    const invoice: Partial<Invoice> = {
        id: generateSecureToken(16),
        organization_id: organizationId,
        paystack_invoice_id: null,
        billing_period: period,
        subtotal,
        tax,
        total,
        currency: 'ZAR',
        status: 'draft',
        due_date: dueDate.toISOString(),
        paid_at: null,
        pdf_url: null,
        line_items: charges.breakdown,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const result = await supabase
        .from<Invoice>('invoices')
        .insert(invoice)
        .select()
        .single();

    if (!result.data) {
        throw new Error('Failed to create invoice');
    }

    return result.data;
}

/**
 * Get invoice by ID
 */
export async function getInvoice(invoiceId: string): Promise<Invoice | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Invoice>('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

    return result.data || null;
}

/**
 * Get invoices for an organization
 */
export async function getOrganizationInvoices(
    organizationId: string,
    limit?: number
): Promise<Invoice[]> {
    const supabase = getSupabaseServerClient();

    let query = supabase
        .from<Invoice>('invoices')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const result = await query;
    return result.data || [];
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
    invoiceId: string,
    status: InvoiceStatus,
    paystackInvoiceId?: string,
    pdfUrl?: string
): Promise<Invoice | null> {
    const supabase = getSupabaseServerClient();

    const updateData: Partial<Invoice> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (paystackInvoiceId) {
        updateData.paystack_invoice_id = paystackInvoiceId;
    }

    if (pdfUrl) {
        updateData.pdf_url = pdfUrl;
    }

    if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
    }

    const result = await supabase
        .from<Invoice>('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();

    return result.data || null;
}

/**
 * Mark invoice as paid
 */
export async function markInvoicePaid(
    invoiceId: string,
    paystackReference?: string
): Promise<Invoice | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Invoice>('invoices')
        .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: paystackReference ? { paystack_reference: paystackReference } : undefined,
        } as Partial<Invoice>)
        .eq('id', invoiceId)
        .select()
        .single();

    return result.data || null;
}

/**
 * Get pending invoices for billing run
 */
export async function getPendingInvoices(): Promise<Invoice[]> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<Invoice>('invoices')
        .select('*')
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

    return result.data || [];
}

/**
 * Get overdue invoices
 */
export async function getOverdueInvoices(): Promise<Invoice[]> {
    const supabase = getSupabaseServerClient();
    const now = new Date().toISOString();

    // Get all invoices and filter in memory (custom client doesn't support lt)
    const result = await supabase
        .from<Invoice>('invoices')
        .select('*')
        .eq('status', 'pending');

    const invoices = result.data || [];
    return invoices.filter((inv) => inv.due_date < now);
}

/**
 * Get invoice summary statistics
 */
export async function getInvoiceStats(
    organizationId: string
): Promise<{
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
    invoiceCount: number;
}> {
    const invoices = await getOrganizationInvoices(organizationId);

    const now = new Date().toISOString();

    return {
        totalPaid: invoices
            .filter((inv) => inv.status === 'paid')
            .reduce((sum, inv) => sum + inv.total, 0),
        totalPending: invoices
            .filter((inv) => inv.status === 'pending')
            .reduce((sum, inv) => sum + inv.total, 0),
        totalOverdue: invoices
            .filter((inv) => inv.status === 'pending' && inv.due_date < now)
            .reduce((sum, inv) => sum + inv.total, 0),
        invoiceCount: invoices.length,
    };
}
