import { NextRequest, NextResponse } from 'next/server';
import {
    trackAIConversation,
    trackAIMessage,
    trackAITokens,
    trackWhatsAppMessageSent,
    trackWhatsAppMessageReceived,
    trackReceiptProcessed,
    trackReceiptExport,
    flushBuffer,
    getBufferSize,
} from '@/lib/billing';
import type { UsageType } from '@/lib/billing/types';

// POST /api/billing/track - Track usage events
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            organization_id,
            user_id,
            event_type,
            quantity = 1,
            metadata = {},
        } = body;

        if (!organization_id) {
            return NextResponse.json(
                { error: 'organization_id is required' },
                { status: 400 }
            );
        }

        if (!event_type) {
            return NextResponse.json(
                { error: 'event_type is required' },
                { status: 400 }
            );
        }

        // Route to appropriate tracking function
        switch (event_type) {
            case 'ai_conversation':
                await trackAIConversation(organization_id, user_id, metadata);
                break;

            case 'ai_message':
                await trackAIMessage(
                    organization_id,
                    user_id,
                    metadata.token_count,
                    metadata
                );
                break;

            case 'ai_token':
                await trackAITokens(
                    organization_id,
                    quantity,
                    user_id,
                    metadata
                );
                break;

            case 'whatsapp_message_sent':
                await trackWhatsAppMessageSent(
                    organization_id,
                    metadata.recipient_phone,
                    metadata.message_type,
                    user_id,
                    metadata
                );
                break;

            case 'whatsapp_message_received':
                await trackWhatsAppMessageReceived(
                    organization_id,
                    metadata.sender_phone,
                    metadata.message_type,
                    metadata
                );
                break;

            case 'receipt_processed':
                await trackReceiptProcessed(
                    organization_id,
                    metadata.receipt_id || 'unknown',
                    user_id,
                    metadata
                );
                break;

            case 'receipt_export':
                await trackReceiptExport(
                    organization_id,
                    metadata.format || 'csv',
                    metadata.receipt_count || 1,
                    user_id,
                    metadata
                );
                break;

            default:
                return NextResponse.json(
                    { error: `Unknown event_type: ${event_type}` },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            tracked: true,
            event_type,
            buffer_size: getBufferSize(),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to track usage';
        console.error('Usage tracking error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// PUT /api/billing/track - Flush usage buffer
export async function PUT(request: NextRequest) {
    try {
        const bufferSizeBefore = getBufferSize();
        await flushBuffer();
        const bufferSizeAfter = getBufferSize();

        return NextResponse.json({
            flushed: true,
            records_flushed: bufferSizeBefore - bufferSizeAfter,
            remaining: bufferSizeAfter,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to flush buffer';
        console.error('Buffer flush error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// GET /api/billing/track - Get buffer status
export async function GET() {
    try {
        return NextResponse.json({
            buffer_size: getBufferSize(),
        });
    } catch (error) {
        console.error('Buffer status error:', error);
        return NextResponse.json(
            { error: 'Failed to get buffer status' },
            { status: 500 }
        );
    }
}
