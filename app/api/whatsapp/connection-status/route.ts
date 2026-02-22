import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppAccountByPhoneNumberId } from '@/lib/whatsapp/accounts';

// GET /api/whatsapp/connection-status - Get connection status for polling
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const phoneNumberId = searchParams.get('phone_number_id');

        if (!phoneNumberId) {
            return NextResponse.json(
                { error: 'phone_number_id is required' },
                { status: 400 }
            );
        }

        const account = await getWhatsAppAccountByPhoneNumberId(phoneNumberId);

        if (!account) {
            return NextResponse.json({
                status: 'not_found',
                message: 'Account not found',
            });
        }

        return NextResponse.json({
            status: account.connection_status,
            coexistence_mode: account.coexistence_mode,
            quality_rating: account.quality_rating,
            last_synced_at: account.last_synced_at,
        });
    } catch (error) {
        console.error('Error fetching connection status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        );
    }
}
