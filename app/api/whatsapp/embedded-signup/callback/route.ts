import { NextRequest, NextResponse } from 'next/server';
import { processEmbeddedSignupCallback } from '@/lib/whatsapp/embedded-signup';
import { createWhatsAppAccount } from '@/lib/whatsapp/accounts';

// POST /api/whatsapp/embedded-signup/callback - Process signup callback
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, organization_id } = body;

        if (!code || !organization_id) {
            return NextResponse.json(
                { error: 'Missing code or organization_id' },
                { status: 400 }
            );
        }

        // Process the callback
        const result = await processEmbeddedSignupCallback(code, organization_id);

        // Create the account in database
        const account = await createWhatsAppAccount(result.account);

        // Return success with account info (without sensitive data)
        return NextResponse.json({
            success: true,
            account: {
                id: account.id,
                phone_number: account.phone_number,
                display_name: account.display_name,
                channel_id: account.channel_id,
                connection_status: account.connection_status,
            },
            waba_info: {
                id: result.wabaInfo.id,
                name: result.wabaInfo.name,
            },
        });
    } catch (error) {
        console.error('Embedded signup callback error:', error);
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : 'Failed to process signup',
            },
            { status: 500 }
        );
    }
}
