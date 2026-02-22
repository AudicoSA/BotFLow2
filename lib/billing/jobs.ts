// Billing Job Scheduler
// Background jobs for billing, invoicing, and usage aggregation

import { getSupabaseServerClient } from '@/lib/supabase/client';
import {
    generateInvoice,
    getPendingInvoices,
    getOverdueInvoices,
    updateInvoiceStatus,
} from './charges';
import {
    createPaystackInvoice,
    sendPaystackInvoice,
    syncInvoiceStatus,
} from './paystack-invoices';
import { flushBuffer } from './metering';
import { getCurrentBillingPeriod, getBillingPeriodForDate } from './types';
import type { Invoice } from './types';

interface Organization {
    id: string;
    name: string;
    owner_email: string;
}

interface JobResult {
    success: boolean;
    processed: number;
    errors: string[];
}

/**
 * Run monthly billing job
 * Generates invoices for all active organizations
 */
export async function runMonthlyBillingJob(
    billingPeriod?: string
): Promise<JobResult> {
    const supabase = getSupabaseServerClient();
    const period = billingPeriod || getCurrentBillingPeriod().period_key;
    const errors: string[] = [];
    let processed = 0;

    console.log(`Starting monthly billing job for period: ${period}`);

    // Flush any buffered usage records first
    await flushBuffer();

    // Get all active organizations with subscriptions
    const orgsResult = await supabase
        .from('subscriptions')
        .select('organization_id')
        .eq('status', 'active');

    const subscriptions = (orgsResult.data || []) as { organization_id: string }[];
    const organizationIds = [...new Set(subscriptions.map((s) => s.organization_id))];

    for (const organizationId of organizationIds) {
        try {
            // Check if invoice already exists for this period
            const existingResult = await supabase
                .from<Invoice>('invoices')
                .select('id')
                .eq('organization_id', organizationId)
                .eq('billing_period', period)
                .single();

            if (existingResult.data) {
                console.log(`Invoice already exists for org ${organizationId}, skipping`);
                continue;
            }

            // Generate invoice
            const invoice = await generateInvoice(organizationId, period);

            // Create Paystack invoice if amount > 0
            if (invoice.total > 0) {
                const paystackResult = await createPaystackInvoice(invoice.id);

                if (!paystackResult.success) {
                    errors.push(
                        `Failed to create Paystack invoice for ${organizationId}: ${paystackResult.error}`
                    );
                } else {
                    // Send invoice email
                    if (paystackResult.paystackInvoiceId) {
                        await sendPaystackInvoice(paystackResult.paystackInvoiceId);
                    }
                }
            } else {
                // Mark zero-amount invoices as paid immediately
                await updateInvoiceStatus(invoice.id, 'paid');
            }

            processed++;
            console.log(`Generated invoice for org ${organizationId}`);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to process org ${organizationId}: ${message}`);
            console.error(`Error processing org ${organizationId}:`, error);
        }
    }

    console.log(`Monthly billing job complete. Processed: ${processed}, Errors: ${errors.length}`);

    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}

/**
 * Sync invoice statuses with Paystack
 */
export async function syncInvoiceStatuses(): Promise<JobResult> {
    const pendingInvoices = await getPendingInvoices();
    const errors: string[] = [];
    let processed = 0;

    for (const invoice of pendingInvoices) {
        if (invoice.paystack_invoice_id) {
            try {
                const synced = await syncInvoiceStatus(invoice.id);
                if (synced) {
                    processed++;
                    console.log(`Invoice ${invoice.id} marked as paid`);
                }
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to sync invoice ${invoice.id}: ${message}`);
            }
        }
    }

    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}

/**
 * Send reminders for overdue invoices
 */
export async function sendOverdueReminders(): Promise<JobResult> {
    const overdueInvoices = await getOverdueInvoices();
    const errors: string[] = [];
    let processed = 0;

    for (const invoice of overdueInvoices) {
        try {
            // Update status to overdue
            await updateInvoiceStatus(invoice.id, 'overdue');

            // Send reminder via Paystack
            if (invoice.paystack_invoice_id) {
                await sendPaystackInvoice(invoice.paystack_invoice_id);
            }

            processed++;
            console.log(`Sent overdue reminder for invoice ${invoice.id}`);
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to send reminder for ${invoice.id}: ${message}`);
        }
    }

    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}

/**
 * Aggregate daily usage (for reporting)
 */
export async function aggregateDailyUsage(date?: Date): Promise<JobResult> {
    const supabase = getSupabaseServerClient();
    const targetDate = date || new Date();
    targetDate.setDate(targetDate.getDate() - 1); // Yesterday

    const dateStr = targetDate.toISOString().split('T')[0];
    const errors: string[] = [];
    let processed = 0;

    // Flush buffer first
    await flushBuffer();

    // Get all organizations
    const orgsResult = await supabase
        .from<Organization>('organizations')
        .select('id');

    const organizations = orgsResult.data || [];

    for (const org of organizations) {
        try {
            // Get usage records for the date
            const usageResult = await supabase
                .from('usage_records')
                .select('usage_type, quantity')
                .eq('organization_id', org.id);

            const records = (usageResult.data || []) as { usage_type: string; quantity: number; created_at?: string }[];

            // Filter by date (since custom client doesn't support complex filters)
            const dailyRecords = records.filter((r) => {
                const recordDate = (r.created_at || '').split('T')[0];
                return recordDate === dateStr;
            });

            if (dailyRecords.length > 0) {
                // Aggregate by type
                const aggregated: Record<string, number> = {};
                for (const record of dailyRecords) {
                    aggregated[record.usage_type] =
                        (aggregated[record.usage_type] || 0) + record.quantity;
                }

                // Store daily aggregate
                await supabase.from('usage_aggregates').insert({
                    organization_id: org.id,
                    date: dateStr,
                    usage_data: aggregated,
                    created_at: new Date().toISOString(),
                });

                processed++;
            }
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Failed to aggregate for org ${org.id}: ${message}`);
        }
    }

    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}

/**
 * Check for trial expirations and send notifications
 */
export async function checkTrialExpirations(): Promise<JobResult> {
    const supabase = getSupabaseServerClient();
    const errors: string[] = [];
    let processed = 0;

    // Get subscriptions with trials ending soon (7, 3, 1 days)
    const now = new Date();
    const checkDates = [1, 3, 7].map((days) => {
        const date = new Date(now);
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    });

    const subscriptionsResult = await supabase
        .from('subscriptions')
        .select('*')
        .eq('status', 'trialing');

    const subscriptions = (subscriptionsResult.data || []) as {
        id: string;
        organization_id: string;
        trial_ends_at?: string;
    }[];

    for (const sub of subscriptions) {
        if (!sub.trial_ends_at) continue;

        const trialEndDate = sub.trial_ends_at.split('T')[0];

        if (checkDates.includes(trialEndDate)) {
            try {
                // Send trial expiration notification
                // In production, this would trigger an email
                console.log(
                    `Trial expiring for org ${sub.organization_id} on ${trialEndDate}`
                );
                processed++;
            } catch (error) {
                const message =
                    error instanceof Error ? error.message : 'Unknown error';
                errors.push(`Failed to notify org ${sub.organization_id}: ${message}`);
            }
        }
    }

    return {
        success: errors.length === 0,
        processed,
        errors,
    };
}

/**
 * Run all scheduled billing jobs
 */
export async function runScheduledJobs(): Promise<{
    billing: JobResult;
    sync: JobResult;
    reminders: JobResult;
    trials: JobResult;
}> {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const hourOfDay = now.getHours();

    const results = {
        billing: { success: true, processed: 0, errors: [] as string[] },
        sync: { success: true, processed: 0, errors: [] as string[] },
        reminders: { success: true, processed: 0, errors: [] as string[] },
        trials: { success: true, processed: 0, errors: [] as string[] },
    };

    // Run monthly billing on 1st of month at midnight
    if (dayOfMonth === 1 && hourOfDay === 0) {
        const previousMonth = new Date(now);
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const period = getBillingPeriodForDate(previousMonth).period_key;
        results.billing = await runMonthlyBillingJob(period);
    }

    // Sync invoice statuses every hour
    results.sync = await syncInvoiceStatuses();

    // Send overdue reminders daily at 9am
    if (hourOfDay === 9) {
        results.reminders = await sendOverdueReminders();
    }

    // Check trial expirations daily at 10am
    if (hourOfDay === 10) {
        results.trials = await checkTrialExpirations();
    }

    return results;
}
