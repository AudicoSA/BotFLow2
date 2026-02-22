import { NextRequest, NextResponse } from 'next/server';
import {
    getUsageSummary,
    getUsageRecords,
    checkUsageLimit,
    getCurrentBillingPeriod,
} from '@/lib/billing';
import type { UsageType } from '@/lib/billing/types';

// GET /api/billing/usage - Get usage summary for organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const billingPeriod = searchParams.get('billing_period');
        const usageType = searchParams.get('usage_type') as UsageType | null;
        const detailed = searchParams.get('detailed') === 'true';

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // If checking specific usage type limit
        if (usageType) {
            const limitStatus = await checkUsageLimit(organizationId, usageType);
            return NextResponse.json({
                usage_type: usageType,
                ...limitStatus,
            });
        }

        // Get usage summary
        const summary = await getUsageSummary(
            organizationId,
            billingPeriod || undefined
        );

        // Include detailed records if requested
        if (detailed) {
            const records = await getUsageRecords(
                organizationId,
                billingPeriod || undefined
            );
            return NextResponse.json({
                summary,
                records,
                current_period: getCurrentBillingPeriod(),
            });
        }

        return NextResponse.json({
            summary,
            current_period: getCurrentBillingPeriod(),
        });
    } catch (error) {
        console.error('Error fetching usage:', error);
        return NextResponse.json(
            { error: 'Failed to fetch usage data' },
            { status: 500 }
        );
    }
}
