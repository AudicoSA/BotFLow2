import { NextRequest, NextResponse } from 'next/server';
import {
    getWhatsAppAccount,
    updateWhatsAppAccount,
    deleteWhatsAppAccount,
    getAccountStats,
} from '@/lib/whatsapp/accounts';

// GET /api/whatsapp/accounts/[id] - Get a specific account
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const includeStats = searchParams.get('include_stats') === 'true';

        const account = await getWhatsAppAccount(id);

        if (!account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        // Remove sensitive data
        const sanitizedAccount = {
            ...account,
            access_token: undefined,
            refresh_token: undefined,
        };

        if (includeStats) {
            const stats = await getAccountStats(id);
            return NextResponse.json({ account: sanitizedAccount, stats });
        }

        return NextResponse.json({ account: sanitizedAccount });
    } catch (error) {
        console.error('Error fetching WhatsApp account:', error);
        return NextResponse.json(
            { error: 'Failed to fetch account' },
            { status: 500 }
        );
    }
}

// PATCH /api/whatsapp/accounts/[id] - Update an account
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Only allow updating certain fields
        const allowedFields = [
            'display_name',
            'quality_rating',
            'connection_status',
            'coexistence_mode',
        ];

        const updates: Record<string, unknown> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const account = await updateWhatsAppAccount(id, updates);

        if (!account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        // Remove sensitive data
        const sanitizedAccount = {
            ...account,
            access_token: undefined,
            refresh_token: undefined,
        };

        return NextResponse.json({ account: sanitizedAccount });
    } catch (error) {
        console.error('Error updating WhatsApp account:', error);
        return NextResponse.json(
            { error: 'Failed to update account' },
            { status: 500 }
        );
    }
}

// DELETE /api/whatsapp/accounts/[id] - Delete an account
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const account = await getWhatsAppAccount(id);

        if (!account) {
            return NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
        }

        await deleteWhatsAppAccount(id);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting WhatsApp account:', error);
        return NextResponse.json(
            { error: 'Failed to delete account' },
            { status: 500 }
        );
    }
}
