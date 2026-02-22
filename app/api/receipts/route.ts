import { NextRequest, NextResponse } from 'next/server';
import {
    createReceipt,
    getOrganizationReceipts,
    getReceiptStats,
} from '@/lib/receipt-assistant/storage';
import type { ReceiptCreate, ExpenseCategory } from '@/lib/receipt-assistant/types';

// GET /api/receipts - Get receipts for an organization
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const organizationId = searchParams.get('organization_id');
        const userId = searchParams.get('user_id') || undefined;
        const category = searchParams.get('category') as ExpenseCategory | null;
        const startDate = searchParams.get('start_date') || undefined;
        const endDate = searchParams.get('end_date') || undefined;
        const limit = parseInt(searchParams.get('limit') || '50');
        const includeStats = searchParams.get('include_stats') === 'true';

        if (!organizationId) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        const receipts = await getOrganizationReceipts(organizationId, {
            userId,
            category: category || undefined,
            startDate,
            endDate,
            limit,
        });

        if (includeStats) {
            const stats = await getReceiptStats(organizationId, userId);
            return NextResponse.json({ receipts, stats });
        }

        return NextResponse.json({ receipts });
    } catch (error) {
        console.error('Error fetching receipts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch receipts' },
            { status: 500 }
        );
    }
}

// POST /api/receipts - Create a new receipt
export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as ReceiptCreate;

        if (!body.organization_id || !body.user_id || !body.image_url) {
            return NextResponse.json(
                { error: 'organization_id, user_id, and image_url are required' },
                { status: 400 }
            );
        }

        const receipt = await createReceipt(body);

        return NextResponse.json({ receipt }, { status: 201 });
    } catch (error) {
        console.error('Error creating receipt:', error);
        return NextResponse.json(
            { error: 'Failed to create receipt' },
            { status: 500 }
        );
    }
}
