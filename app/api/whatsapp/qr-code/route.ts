import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppClient } from '@/lib/whatsapp/client';
import { getWhatsAppAccountByPhoneNumberId } from '@/lib/whatsapp/accounts';

// POST /api/whatsapp/qr-code - Generate a QR code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { phone_number_id, prefilled_message } = body;

        if (!phone_number_id) {
            return NextResponse.json(
                { error: 'phone_number_id is required' },
                { status: 400 }
            );
        }

        // Get the account to retrieve access token
        const account = await getWhatsAppAccountByPhoneNumberId(phone_number_id);

        if (!account || !account.access_token) {
            return NextResponse.json(
                { error: 'Account not found or not configured' },
                { status: 404 }
            );
        }

        // Create client and generate QR code
        const client = new WhatsAppClient({
            accessToken: account.access_token,
            phoneNumberId: phone_number_id,
        });

        const qrCode = await client.generateQRCode(
            phone_number_id,
            prefilled_message
        );

        return NextResponse.json(qrCode);
    } catch (error) {
        console.error('Error generating QR code:', error);
        return NextResponse.json(
            { error: 'Failed to generate QR code' },
            { status: 500 }
        );
    }
}

// GET /api/whatsapp/qr-code - Get existing QR codes
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

        // Get the account to retrieve access token
        const account = await getWhatsAppAccountByPhoneNumberId(phoneNumberId);

        if (!account || !account.access_token) {
            return NextResponse.json(
                { error: 'Account not found or not configured' },
                { status: 404 }
            );
        }

        // Create client and get QR codes
        const client = new WhatsAppClient({
            accessToken: account.access_token,
            phoneNumberId,
        });

        const qrCodes = await client.getQRCodes(phoneNumberId);

        return NextResponse.json({ qr_codes: qrCodes });
    } catch (error) {
        console.error('Error fetching QR codes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch QR codes' },
            { status: 500 }
        );
    }
}
