// Usage Metering Service
// Tracks usage events for AI Assistant, WhatsApp, and Receipt services

import { recordUsage, recordUsageBatch } from './usage-storage';
import type { UsageRecordCreate, UsageType } from './types';

// In-memory buffer for batch processing
interface UsageBuffer {
    records: UsageRecordCreate[];
    lastFlush: number;
}

const usageBuffer: UsageBuffer = {
    records: [],
    lastFlush: Date.now(),
};

const FLUSH_INTERVAL = 5000; // 5 seconds
const MAX_BUFFER_SIZE = 100;

/**
 * Track AI Assistant conversation start
 */
export async function trackAIConversation(
    organizationId: string,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: 'ai_conversation',
        quantity: 1,
        metadata: {
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track AI Assistant message
 */
export async function trackAIMessage(
    organizationId: string,
    userId?: string,
    tokenCount?: number,
    metadata?: Record<string, unknown>
): Promise<void> {
    const records: UsageRecordCreate[] = [
        {
            organization_id: organizationId,
            user_id: userId,
            usage_type: 'ai_message',
            quantity: 1,
            metadata: {
                ...metadata,
                tracked_at: new Date().toISOString(),
            },
        },
    ];

    // Also track tokens if provided
    if (tokenCount && tokenCount > 0) {
        records.push({
            organization_id: organizationId,
            user_id: userId,
            usage_type: 'ai_token',
            quantity: tokenCount,
            metadata: {
                ...metadata,
                tracked_at: new Date().toISOString(),
            },
        });
    }

    for (const record of records) {
        await bufferUsage(record);
    }
}

/**
 * Track AI token usage
 */
export async function trackAITokens(
    organizationId: string,
    tokenCount: number,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: 'ai_token',
        quantity: tokenCount,
        metadata: {
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track WhatsApp message sent
 */
export async function trackWhatsAppMessageSent(
    organizationId: string,
    recipientPhone?: string,
    messageType?: string,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: 'whatsapp_message_sent',
        quantity: 1,
        metadata: {
            recipient_phone: recipientPhone,
            message_type: messageType,
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track WhatsApp message received
 */
export async function trackWhatsAppMessageReceived(
    organizationId: string,
    senderPhone?: string,
    messageType?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        usage_type: 'whatsapp_message_received',
        quantity: 1,
        metadata: {
            sender_phone: senderPhone,
            message_type: messageType,
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track batch of WhatsApp messages
 */
export async function trackWhatsAppMessageBatch(
    organizationId: string,
    messageCount: number,
    direction: 'sent' | 'received',
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    const usageType: UsageType =
        direction === 'sent' ? 'whatsapp_message_sent' : 'whatsapp_message_received';

    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: usageType,
        quantity: messageCount,
        metadata: {
            batch: true,
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track receipt processed
 */
export async function trackReceiptProcessed(
    organizationId: string,
    receiptId: string,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: 'receipt_processed',
        quantity: 1,
        metadata: {
            receipt_id: receiptId,
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Track receipt export
 */
export async function trackReceiptExport(
    organizationId: string,
    exportFormat: 'csv' | 'pdf',
    receiptCount: number,
    userId?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await bufferUsage({
        organization_id: organizationId,
        user_id: userId,
        usage_type: 'receipt_export',
        quantity: 1,
        metadata: {
            format: exportFormat,
            receipt_count: receiptCount,
            ...metadata,
            tracked_at: new Date().toISOString(),
        },
    });
}

/**
 * Buffer usage record for batch processing
 */
async function bufferUsage(record: UsageRecordCreate): Promise<void> {
    usageBuffer.records.push(record);

    // Flush if buffer is full or enough time has passed
    const shouldFlush =
        usageBuffer.records.length >= MAX_BUFFER_SIZE ||
        Date.now() - usageBuffer.lastFlush >= FLUSH_INTERVAL;

    if (shouldFlush) {
        await flushBuffer();
    }
}

/**
 * Flush buffered usage records to database
 */
export async function flushBuffer(): Promise<void> {
    if (usageBuffer.records.length === 0) return;

    const recordsToFlush = [...usageBuffer.records];
    usageBuffer.records = [];
    usageBuffer.lastFlush = Date.now();

    try {
        await recordUsageBatch(recordsToFlush);
    } catch (error) {
        console.error('Failed to flush usage buffer:', error);
        // Re-add records to buffer on failure
        usageBuffer.records = [...recordsToFlush, ...usageBuffer.records];
    }
}

/**
 * Record usage immediately (bypasses buffer)
 */
export async function trackImmediate(record: UsageRecordCreate): Promise<void> {
    await recordUsage(record);
}

/**
 * Get current buffer size
 */
export function getBufferSize(): number {
    return usageBuffer.records.length;
}

// Periodic flush (for serverless environments, call this before function ends)
let flushInterval: ReturnType<typeof setInterval> | null = null;

export function startPeriodicFlush(): void {
    if (flushInterval) return;

    flushInterval = setInterval(async () => {
        await flushBuffer();
    }, FLUSH_INTERVAL);
}

export function stopPeriodicFlush(): void {
    if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
    }
}
