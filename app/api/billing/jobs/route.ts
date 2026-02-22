import { NextRequest, NextResponse } from 'next/server';
import {
    runMonthlyBillingJob,
    syncInvoiceStatuses,
    sendOverdueReminders,
    aggregateDailyUsage,
    checkTrialExpirations,
    runScheduledJobs,
} from '@/lib/billing';

// Verify cron secret for secured job execution
function verifyCronSecret(request: NextRequest): boolean {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return true; // Allow in development

    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${cronSecret}`;
}

// POST /api/billing/jobs - Run billing jobs (cron endpoint)
export async function POST(request: NextRequest) {
    try {
        // Verify authorization
        if (!verifyCronSecret(request)) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { job, billing_period } = body;

        switch (job) {
            case 'monthly_billing': {
                const result = await runMonthlyBillingJob(billing_period);
                return NextResponse.json({
                    job: 'monthly_billing',
                    result,
                });
            }

            case 'sync_invoices': {
                const result = await syncInvoiceStatuses();
                return NextResponse.json({
                    job: 'sync_invoices',
                    result,
                });
            }

            case 'overdue_reminders': {
                const result = await sendOverdueReminders();
                return NextResponse.json({
                    job: 'overdue_reminders',
                    result,
                });
            }

            case 'aggregate_usage': {
                const date = body.date ? new Date(body.date) : undefined;
                const result = await aggregateDailyUsage(date);
                return NextResponse.json({
                    job: 'aggregate_usage',
                    result,
                });
            }

            case 'check_trials': {
                const result = await checkTrialExpirations();
                return NextResponse.json({
                    job: 'check_trials',
                    result,
                });
            }

            case 'scheduled':
            default: {
                // Run all scheduled jobs based on current time
                const results = await runScheduledJobs();
                return NextResponse.json({
                    job: 'scheduled',
                    results,
                });
            }
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Job failed';
        console.error('Billing job error:', error);
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}

// GET /api/billing/jobs - Get job status (for monitoring)
export async function GET(request: NextRequest) {
    try {
        // This would typically fetch from a job status table
        // For now, return basic health check

        return NextResponse.json({
            status: 'healthy',
            available_jobs: [
                'monthly_billing',
                'sync_invoices',
                'overdue_reminders',
                'aggregate_usage',
                'check_trials',
                'scheduled',
            ],
            last_run: null, // Would come from a job log table
        });
    } catch (error) {
        console.error('Job status error:', error);
        return NextResponse.json(
            { error: 'Failed to get job status' },
            { status: 500 }
        );
    }
}
