// BullMQ Queue Client
// Provides queue management for adding and processing jobs
// Note: BullMQ is an optional dependency - falls back to in-memory queue when not available

import {
    QUEUE_NAMES,
    DEFAULT_JOB_OPTIONS,
    type QueueName,
    type BillingJobData,
    type EmailJobData,
    type WhatsAppJobData,
    type AIAssistantJobData,
    type ReceiptOCRJobData,
    type AnalyticsJobData,
    type WebhookJobData,
} from './queues';
import { getRedisConnection, type RedisConnectionOptions } from './redis';

// Job options type
interface JobOptions {
    delay?: number;
    priority?: number;
    attempts?: number;
    jobId?: string;
}

// Queue client interface (framework-agnostic)
export interface QueueClient {
    addJob<T>(queueName: QueueName, jobName: string, data: T, options?: JobOptions): Promise<string>;
    getJobStatus(queueName: QueueName, jobId: string): Promise<string | null>;
    removeJob(queueName: QueueName, jobId: string): Promise<void>;
}

// In-memory queue for development/testing when Redis is not available
class InMemoryQueue implements QueueClient {
    private jobs: Map<string, { data: unknown; status: string }> = new Map();
    private jobCounter = 0;

    async addJob<T>(queueName: QueueName, jobName: string, data: T): Promise<string> {
        const jobId = `${queueName}-${++this.jobCounter}`;
        this.jobs.set(jobId, { data, status: 'waiting' });

        // Log job for development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Queue:${queueName}] Added job ${jobName}:`, { jobId });
        }

        // Simulate async processing
        setTimeout(() => {
            const job = this.jobs.get(jobId);
            if (job) {
                job.status = 'completed';
            }
        }, 100);

        return jobId;
    }

    async getJobStatus(_queueName: QueueName, jobId: string): Promise<string | null> {
        const job = this.jobs.get(jobId);
        return job?.status || null;
    }

    async removeJob(_queueName: QueueName, jobId: string): Promise<void> {
        this.jobs.delete(jobId);
    }
}

// BullMQ types (minimal interface for dynamic import)
interface BullMQJob {
    id?: string;
    getState(): Promise<string>;
    remove(): Promise<void>;
}

interface BullMQQueue {
    add(name: string, data: unknown, opts?: Record<string, unknown>): Promise<BullMQJob>;
    getJob(id: string): Promise<BullMQJob | undefined>;
    close(): Promise<void>;
}

interface BullMQModule {
    Queue: new (name: string, opts: { connection: RedisConnectionOptions }) => BullMQQueue;
}

// BullMQ-based queue client
class BullMQClient implements QueueClient {
    private async getBullMQ(): Promise<BullMQModule | null> {
        try {
            // Dynamic import to handle optional dependency
            return await import('bullmq') as unknown as BullMQModule;
        } catch {
            console.warn('[Queue] BullMQ not installed, falling back to in-memory queue');
            return null;
        }
    }

    async addJob<T>(queueName: QueueName, jobName: string, data: T, options?: JobOptions): Promise<string> {
        const bullmq = await this.getBullMQ();
        if (!bullmq) {
            // Fallback to in-memory
            return new InMemoryQueue().addJob(queueName, jobName, data);
        }

        try {
            const connection = getRedisConnection();
            const queue = new bullmq.Queue(queueName, { connection });

            const job = await queue.add(jobName, data, {
                ...DEFAULT_JOB_OPTIONS[queueName],
                ...options,
            });

            await queue.close();
            return job.id || '';
        } catch (error) {
            console.error('[Queue] Failed to add job:', error);
            throw error;
        }
    }

    async getJobStatus(queueName: QueueName, jobId: string): Promise<string | null> {
        const bullmq = await this.getBullMQ();
        if (!bullmq) return null;

        try {
            const connection = getRedisConnection();
            const queue = new bullmq.Queue(queueName, { connection });

            const job = await queue.getJob(jobId);
            const state = job ? await job.getState() : null;

            await queue.close();
            return state;
        } catch (error) {
            console.error('[Queue] Failed to get job status:', error);
            return null;
        }
    }

    async removeJob(queueName: QueueName, jobId: string): Promise<void> {
        const bullmq = await this.getBullMQ();
        if (!bullmq) return;

        try {
            const connection = getRedisConnection();
            const queue = new bullmq.Queue(queueName, { connection });

            const job = await queue.getJob(jobId);
            if (job) {
                await job.remove();
            }

            await queue.close();
        } catch (error) {
            console.error('[Queue] Failed to remove job:', error);
        }
    }
}

// Create queue client singleton
let queueClient: QueueClient | null = null;

/**
 * Get or create queue client
 * Uses BullMQ when Redis is available, falls back to in-memory queue
 */
export function getQueueClient(): QueueClient {
    if (queueClient) {
        return queueClient;
    }

    const redisUrl = process.env.REDIS_URL;

    // If no Redis URL, use in-memory queue
    if (!redisUrl) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[Queue] No REDIS_URL configured, using in-memory queue');
        }
        queueClient = new InMemoryQueue();
        return queueClient;
    }

    // Use BullMQ client
    queueClient = new BullMQClient();
    return queueClient;
}

// ===========================================
// Helper functions for adding jobs by type
// ===========================================

/**
 * Add a billing job
 */
export async function addBillingJob(data: BillingJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.BILLING, data.type, data, options);
}

/**
 * Add an email job
 */
export async function addEmailJob(data: EmailJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.EMAIL, data.type, data, options);
}

/**
 * Add a WhatsApp job
 */
export async function addWhatsAppJob(data: WhatsAppJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.WHATSAPP, data.type, data, options);
}

/**
 * Add an AI Assistant job
 */
export async function addAIAssistantJob(data: AIAssistantJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.AI_ASSISTANT, data.type, data, options);
}

/**
 * Add a Receipt OCR job
 */
export async function addReceiptOCRJob(data: ReceiptOCRJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.RECEIPT_OCR, data.type, data, options);
}

/**
 * Add an analytics job
 */
export async function addAnalyticsJob(data: AnalyticsJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.ANALYTICS, data.type, data, options);
}

/**
 * Add a webhook processing job
 */
export async function addWebhookJob(data: WebhookJobData, options?: JobOptions): Promise<string> {
    const client = getQueueClient();
    return client.addJob(QUEUE_NAMES.WEBHOOKS, data.type, data, {
        ...options,
        priority: 1, // High priority for webhooks
    });
}
