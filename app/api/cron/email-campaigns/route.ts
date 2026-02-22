// Email Campaigns Cron Endpoint
// GET /api/cron/email-campaigns - Run daily email campaign checks
// Should be called by Vercel Cron or external scheduler

import { NextResponse } from 'next/server';
import { checkAndSendTrialReminders, checkAndSendFeatureEducation } from '@/lib/email/campaigns';

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In development, allow without secret
    if (process.env.NODE_ENV === 'development') {
        return true;
    }

    // In production, require secret
    if (!cronSecret) {
        console.warn('[Cron] CRON_SECRET not configured');
        return false;
    }

    return authHeader === `Bearer ${cronSecret}`;
}

// Mock function to get trial users - would be replaced with actual database query
async function getTrialUsers() {
    // TODO: Replace with actual Supabase query
    // Example query:
    // const { data } = await supabase
    //   .from('users')
    //   .select('id, email, name, trial_ends_at, created_at')
    //   .eq('subscription_status', 'trialing')
    //   .gte('trial_ends_at', new Date().toISOString());

    console.log('[Cron] Fetching trial users from database...');
    return [];
}

// Mock function to get onboarding users - would be replaced with actual database query
async function getOnboardingUsers() {
    // TODO: Replace with actual Supabase query
    // Example query:
    // const { data } = await supabase
    //   .from('users')
    //   .select('id, email, name, created_at, onboarding_completed')
    //   .eq('onboarding_completed', false)
    //   .gte('created_at', new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString());

    console.log('[Cron] Fetching onboarding users from database...');
    return [];
}

export async function GET(request: Request) {
    // Verify authorization
    if (!verifyCronSecret(request)) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    const results = {
        trialReminders: { sent: 0, errors: [] as string[] },
        featureEducation: { sent: 0, errors: [] as string[] },
        timestamp: new Date().toISOString(),
    };

    try {
        // Run trial reminder checks
        console.log('[Cron] Running trial reminder checks...');
        results.trialReminders = await checkAndSendTrialReminders(getTrialUsers);

        // Run feature education checks
        console.log('[Cron] Running feature education checks...');
        results.featureEducation = await checkAndSendFeatureEducation(getOnboardingUsers);

        const totalSent = results.trialReminders.sent + results.featureEducation.sent;
        const totalErrors = results.trialReminders.errors.length + results.featureEducation.errors.length;

        console.log(`[Cron] Completed: ${totalSent} emails sent, ${totalErrors} errors`);

        return NextResponse.json({
            success: true,
            message: `Processed ${totalSent} emails`,
            results,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Cron] Failed to run email campaigns:', message);

        return NextResponse.json(
            {
                success: false,
                error: message,
                results,
            },
            { status: 500 }
        );
    }
}

// Also support POST for Vercel Cron
export async function POST(request: Request) {
    return GET(request);
}
