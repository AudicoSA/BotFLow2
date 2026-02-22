import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { verifyWebhookSignature, handleWebhookVerification } from '@/lib/whatsapp/embedded-signup';
import { getWhatsAppAccountByPhoneNumberId, updateConnectionStatus } from '@/lib/whatsapp/accounts';
import { storeIncomingMessage, updateMessageStatus } from '@/lib/whatsapp/sync';
import type { WhatsAppWebhookPayload, WebhookMessage, WebhookStatus } from '@/lib/whatsapp/types';

// GET /api/webhooks/whatsapp - Webhook verification
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (!verifyToken) {
        console.error('WHATSAPP_WEBHOOK_VERIFY_TOKEN not configured');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!mode || !token || !challenge) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result = handleWebhookVerification(mode, token, challenge, verifyToken);

    if (result) {
        // Return challenge as plain text
        return new NextResponse(result, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' },
        });
    }

    return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

// POST /api/webhooks/whatsapp - Webhook events
export async function POST(request: NextRequest) {
    try {
        const headersList = await headers();
        const signature = headersList.get('x-hub-signature-256');
        const appSecret = process.env.META_APP_SECRET;

        // Get raw body for signature verification
        const rawBody = await request.text();

        // Verify signature in production
        if (appSecret && signature) {
            const isValid = verifyWebhookSignature(rawBody, signature, appSecret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const payload: WhatsAppWebhookPayload = JSON.parse(rawBody);

        // Process each entry
        for (const entry of payload.entry) {
            for (const change of entry.changes) {
                if (change.field !== 'messages') continue;

                const value = change.value;
                const phoneNumberId = value.metadata.phone_number_id;

                // Get the account
                const account = await getWhatsAppAccountByPhoneNumberId(phoneNumberId);
                if (!account) {
                    console.warn(`No account found for phone_number_id: ${phoneNumberId}`);
                    continue;
                }

                // Update connection status to connected
                if (account.connection_status !== 'connected') {
                    await updateConnectionStatus(account.id, 'connected');
                }

                // Process incoming messages
                if (value.messages && value.messages.length > 0) {
                    for (const message of value.messages) {
                        await handleIncomingMessage(account.id, message, value.contacts);
                    }
                }

                // Process status updates
                if (value.statuses && value.statuses.length > 0) {
                    for (const status of value.statuses) {
                        await handleStatusUpdate(account.id, status);
                    }
                }

                // Process errors
                if (value.errors && value.errors.length > 0) {
                    for (const error of value.errors) {
                        console.error('WhatsApp webhook error:', error);
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
    }
}

// Handle incoming message
async function handleIncomingMessage(
    accountId: string,
    message: WebhookMessage,
    contacts?: Array<{ profile: { name: string }; wa_id: string }>
) {
    try {
        // Find contact info
        const contactInfo = contacts?.find((c) => c.wa_id === message.from);

        // Store the message
        await storeIncomingMessage(accountId, message, contactInfo ? {
            wa_id: contactInfo.wa_id,
            profile_name: contactInfo.profile.name,
        } : undefined);

        // TODO: Trigger any automated responses or AI processing here
        console.log(`Received message from ${message.from}:`, message.type);
    } catch (error) {
        console.error('Error handling incoming message:', error);
    }
}

// Handle status update
async function handleStatusUpdate(accountId: string, status: WebhookStatus) {
    try {
        await updateMessageStatus(accountId, status.id, status.status);
        console.log(`Message ${status.id} status updated to: ${status.status}`);
    } catch (error) {
        console.error('Error handling status update:', error);
    }
}
