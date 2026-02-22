import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppClient } from '@/lib/whatsapp/client';
import {
    enableCoexistenceMode,
    disableCoexistenceMode,
    getCoexistenceStatus,
} from '@/lib/whatsapp/coexistence';
import {
    getWhatsAppAccountByPhoneNumberId,
    updateCoexistenceMode,
} from '@/lib/whatsapp/accounts';

// GET /api/whatsapp/coexistence - Get coexistence status
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

        if (!account || !account.access_token) {
            return NextResponse.json(
                { error: 'Account not found or not configured' },
                { status: 404 }
            );
        }

        const status = await getCoexistenceStatus(
            account.access_token,
            phoneNumberId
        );

        return NextResponse.json(status);
    } catch (error) {
        console.error('Error fetching coexistence status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch status' },
            { status: 500 }
        );
    }
}

// POST /api/whatsapp/coexistence - Enable/disable coexistence
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone_number_id, action } = body;

        if (!phone_number_id || !action) {
            return NextResponse.json(
                { error: 'phone_number_id and action are required' },
                { status: 400 }
            );
        }

        if (!['enable', 'disable', 'migrate'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Use: enable, disable, or migrate' },
                { status: 400 }
            );
        }

        const account = await getWhatsAppAccountByPhoneNumberId(phone_number_id);

        if (!account || !account.access_token) {
            return NextResponse.json(
                { error: 'Account not found or not configured' },
                { status: 404 }
            );
        }

        const client = new WhatsAppClient({
            accessToken: account.access_token,
            phoneNumberId: phone_number_id,
        });

        let result;

        if (action === 'enable') {
            result = await enableCoexistenceMode(client, phone_number_id);
        } else {
            result = await disableCoexistenceMode(client, phone_number_id);
        }

        // Update the mode in database
        await updateCoexistenceMode(account.id, result.mode);

        return NextResponse.json({
            success: result.success,
            mode: result.mode,
        });
    } catch (error) {
        console.error('Error updating coexistence mode:', error);
        return NextResponse.json(
            { error: 'Failed to update coexistence mode' },
            { status: 500 }
        );
    }
}
