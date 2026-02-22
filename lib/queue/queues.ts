// BullMQ Queue Definitions
// Defines all background job queues for the application

import { getRedisConnection, type RedisConnectionOptions } from './redis';

// Queue names
export const QUEUE_NAMES = {
    BILLING: 'billing',
    EMAIL: 'email',
    WHATSAPP: 'whatsapp',
    AI_ASSISTANT: 'ai-assistant',
    RECEIPT_OCR: 'receipt-ocr',
    ANALYTICS: 'analytics',
    WEBHOOKS: 'webhooks',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

// Job types for each queue
export interface BillingJobData {
    type: 'usage_aggregation' | 'invoice_generation' | 'payment_charge' | 'subscription_renewal';
    organizationId: string;
    subscriptionId?: string;
    billingPeriod?: string;
}

export interface EmailJobData {
    type: 'welcome' | 'verification' | 'password_reset' | 'trial_reminder' | 'payment_failed' | 'invoice';
    to: string;
    userId: string;
    templateData: Record<string, unknown>;
}

export interface WhatsAppJobData {
    type: 'send_message' | 'sync_contacts' | 'process_webhook' | 'update_status';
    accountId: string;
    payload: Record<string, unknown>;
}

export interface AIAssistantJobData {
    type: 'process_message' | 'generate_summary' | 'cleanup_context';
    conversationId: string;
    userId: string;
    organizationId: string;
    payload: Record<string, unknown>;
}

export interface ReceiptOCRJobData {
    type: 'process_receipt' | 'categorize' | 'duplicate_check';
    receiptId: string;
    organizationId: string;
    imageUrl: string;
}

export interface AnalyticsJobData {
    type: 'track_event' | 'aggregate_metrics' | 'generate_report';
    organizationId?: string;
    eventName?: string;
    properties?: Record<string, unknown>;
}

export interface WebhookJobData {
    type: 'paystack' | 'whatsapp' | 'stripe';
    payload: Record<string, unknown>;
    signature?: string;
    timestamp: number;
}

// Union type for all job data
export type JobData =
    | BillingJobData
    | EmailJobData
    | WhatsAppJobData
    | AIAssistantJobData
    | ReceiptOCRJobData
    | AnalyticsJobData
    | WebhookJobData;

// Default job options by queue
export const DEFAULT_JOB_OPTIONS = {
    [QUEUE_NAMES.BILLING]: {
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
    },
    [QUEUE_NAMES.EMAIL]: {
        attempts: 5,
        backoff: { type: 'exponential' as const, delay: 2000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 1000 },
    },
    [QUEUE_NAMES.WHATSAPP]: {
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 3000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 500 },
    },
    [QUEUE_NAMES.AI_ASSISTANT]: {
        attempts: 2,
        backoff: { type: 'fixed' as const, delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
        timeout: 60000, // 60 seconds for AI processing
    },
    [QUEUE_NAMES.RECEIPT_OCR]: {
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 5000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
        timeout: 120000, // 2 minutes for OCR
    },
    [QUEUE_NAMES.ANALYTICS]: {
        attempts: 2,
        backoff: { type: 'fixed' as const, delay: 1000 },
        removeOnComplete: { count: 1000 },
        removeOnFail: { count: 100 },
    },
    [QUEUE_NAMES.WEBHOOKS]: {
        attempts: 5,
        backoff: { type: 'exponential' as const, delay: 1000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 1000 },
    },
};

// Queue configuration interface
export interface QueueConfig {
    name: QueueName;
    connection: RedisConnectionOptions;
    defaultJobOptions: typeof DEFAULT_JOB_OPTIONS[QueueName];
}

/**
 * Get queue configuration
 */
export function getQueueConfig(queueName: QueueName): QueueConfig {
    return {
        name: queueName,
        connection: getRedisConnection(),
        defaultJobOptions: DEFAULT_JOB_OPTIONS[queueName],
    };
}

/**
 * Get all queue configurations
 */
export function getAllQueueConfigs(): QueueConfig[] {
    return Object.values(QUEUE_NAMES).map(getQueueConfig);
}
