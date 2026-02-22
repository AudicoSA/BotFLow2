import { NextRequest, NextResponse } from 'next/server';
import { getExpenseSummary } from '@/lib/receipt-assistant/storage';

// GET /api/receipts/summary - Get expense summary for organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organization_id = searchParams.get('organization_id');
        const start_date = searchParams.get('start_date');
        const end_date = searchParams.get('end_date');

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        // Default to current month if dates not provided
        const now = new Date();
        const defaultStartDate = new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split('T')[0];
        const defaultEndDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0
        )
            .toISOString()
            .split('T')[0];

        const summary = await getExpenseSummary(
            organization_id,
            start_date || defaultStartDate,
            end_date || defaultEndDate
        );

        return NextResponse.json({ summary });
    } catch (error) {
        console.error('Error fetching expense summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch expense summary' },
            { status: 500 }
        );
    }
}
