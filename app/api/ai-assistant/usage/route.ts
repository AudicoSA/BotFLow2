import { NextRequest, NextResponse } from 'next/server';
import {
    getCurrentMonthUsage,
    getUsageSummary,
    getDailyUsage,
    getUsageByUser,
    checkUsageLimits,
} from '@/lib/ai-assistant/usage';

// GET /api/ai-assistant/usage - Get usage statistics
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const type = searchParams.get('type') || 'current_month';

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        switch (type) {
            case 'current_month': {
                const usage = await getCurrentMonthUsage(organizationId);
                return NextResponse.json({ usage });
            }

            case 'summary': {
                const periodStart = searchParams.get('period_start');
                const periodEnd = searchParams.get('period_end');

                if (!periodStart || !periodEnd) {
                    return NextResponse.json(
                        { error: 'period_start and period_end are required for summary' },
                        { status: 400 }
                    );
                }

                const usage = await getUsageSummary(
                    organizationId,
                    periodStart,
                    periodEnd
                );
                return NextResponse.json({ usage });
            }

            case 'daily': {
                const days = parseInt(searchParams.get('days') || '30');
                const dailyUsage = await getDailyUsage(organizationId, days);
                return NextResponse.json({ daily_usage: dailyUsage });
            }

            case 'by_user': {
                const periodStart = searchParams.get('period_start');
                const periodEnd = searchParams.get('period_end');

                if (!periodStart || !periodEnd) {
                    // Default to current month
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

                    const userUsage = await getUsageByUser(
                        organizationId,
                        startOfMonth.toISOString(),
                        endOfMonth.toISOString()
                    );
                    return NextResponse.json({ user_usage: userUsage });
                }

                const userUsage = await getUsageByUser(
                    organizationId,
                    periodStart,
                    periodEnd
                );
                return NextResponse.json({ user_usage: userUsage });
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid type. Use: current_month, summary, daily, or by_user' },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('Error fetching usage:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage' },
            { status: 500 }
        );
    }
}

// POST /api/ai-assistant/usage/check-limits - Check if within usage limits
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { organization_id, limits } = body;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const result = await checkUsageLimits(organization_id, limits || {});

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error checking limits:', error);
        return NextResponse.json(
            { error: 'Failed to check limits' },
            { status: 500 }
        );
    }
}
