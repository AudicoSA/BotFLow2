// BullMQ Worker
// Background job processor for all queues

import { QUEUE_NAMES, type QueueName } from './queues';
import { getRedisConnection } from './redis';

// Worker process status
let isShuttingDown = false;

/**
 * Process billing jobs
 */
async function processBillingJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, organizationId, subscriptionId, billingPeriod } = jobData;

    console.log(`[Billing] Processing ${type} for org ${organizationId}`);

    switch (type) {
        case 'usage_aggregation':
            // Aggregate usage records for the billing period
            console.log(`Aggregating usage for period ${billingPeriod}`);
            break;

        case 'invoice_generation':
            // Generate invoice from usage aggregates
            console.log(`Generating invoice for subscription ${subscriptionId}`);
            break;

        case 'payment_charge':
            // Charge payment via Paystack
            console.log(`Charging payment for subscription ${subscriptionId}`);
            break;

        case 'subscription_renewal':
            // Handle subscription renewal
            console.log(`Renewing subscription ${subscriptionId}`);
            break;

        default:
            console.warn(`Unknown billing job type: ${type}`);
    }
}

/**
 * Process email jobs
 */
async function processEmailJob(jobData: Record<string, unknown>): Promise<void> {
    const { to, templateData } = jobData;
    const emailType = (templateData as Record<string, unknown>)?.emailType as string || jobData.type;

    console.log(`[Email] Sending ${emailType} email to ${to}`);

    try {
        // Dynamic import to avoid circular dependencies
        const { sendEmail } = await import('@/lib/email/client');
        const { generateEmail } = await import('@/lib/email/service');
        const { emailConfig, appConfig } = await import('@/lib/config/environment');

        // Generate email content from template
        const email = generateEmail(
            emailType as Parameters<typeof generateEmail>[0],
            templateData as Record<string, unknown>
        );

        if (!email) {
            console.warn(`[Email] Unknown email type: ${emailType}`);
            return;
        }

        // Send the email
        const result = await sendEmail({
            from: `${appConfig.name} <${emailConfig.fromEmail}>`,
            to: to as string,
            subject: email.subject,
            html: email.html,
            tags: [
                { name: 'type', value: String(emailType) },
            ],
        });

        if (result.success) {
            console.log(`[Email] Successfully sent ${emailType} to ${to}, id: ${result.id}`);
        } else {
            throw new Error(result.error || 'Failed to send email');
        }
    } catch (error) {
        console.error(`[Email] Failed to send ${emailType} to ${to}:`, error);
        throw error;
    }
}

/**
 * Process WhatsApp jobs
 */
async function processWhatsAppJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, accountId, payload } = jobData;

    console.log(`[WhatsApp] Processing ${type} for account ${accountId}`);

    switch (type) {
        case 'send_message':
            // Send WhatsApp message via Meta API
            break;

        case 'sync_contacts':
            // Sync contacts from WhatsApp
            break;

        case 'process_webhook':
            // Process incoming webhook
            break;

        case 'update_status':
            // Update message delivery status
            break;
    }
}

/**
 * Process AI Assistant jobs
 */
async function processAIAssistantJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, conversationId, userId, organizationId, payload } = jobData;

    console.log(`[AI] Processing ${type} for conversation ${conversationId}`);

    switch (type) {
        case 'process_message':
            // Process message with OpenAI
            break;

        case 'generate_summary':
            // Generate conversation summary
            break;

        case 'cleanup_context':
            // Clean up old context
            break;
    }
}

/**
 * Process Receipt OCR jobs
 */
async function processReceiptOCRJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, receiptId, organizationId, imageUrl } = jobData;

    console.log(`[OCR] Processing ${type} for receipt ${receiptId}`);

    switch (type) {
        case 'process_receipt':
            // Run OCR on receipt image
            break;

        case 'categorize':
            // Auto-categorize receipt
            break;

        case 'duplicate_check':
            // Check for duplicate receipts
            break;
    }
}

/**
 * Process Analytics jobs
 */
async function processAnalyticsJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, organizationId, eventName, properties } = jobData;

    console.log(`[Analytics] Processing ${type}`);

    switch (type) {
        case 'track_event':
            // Track event to analytics provider
            break;

        case 'aggregate_metrics':
            // Aggregate metrics for reporting
            break;

        case 'generate_report':
            // Generate analytics report
            break;
    }
}

/**
 * Process Webhook jobs
 */
async function processWebhookJob(jobData: Record<string, unknown>): Promise<void> {
    const { type, payload, signature, timestamp } = jobData;

    console.log(`[Webhook] Processing ${type} webhook`);

    switch (type) {
        case 'paystack':
            // Process Paystack webhook
            break;

        case 'whatsapp':
            // Process WhatsApp webhook
            break;

        case 'stripe':
            // Process Stripe webhook (if needed)
            break;
    }
}

/**
 * Get processor for queue
 */
function getProcessor(queueName: QueueName): (data: Record<string, unknown>) => Promise<void> {
    switch (queueName) {
        case QUEUE_NAMES.BILLING:
            return processBillingJob;
        case QUEUE_NAMES.EMAIL:
            return processEmailJob;
        case QUEUE_NAMES.WHATSAPP:
            return processWhatsAppJob;
        case QUEUE_NAMES.AI_ASSISTANT:
            return processAIAssistantJob;
        case QUEUE_NAMES.RECEIPT_OCR:
            return processReceiptOCRJob;
        case QUEUE_NAMES.ANALYTICS:
            return processAnalyticsJob;
        case QUEUE_NAMES.WEBHOOKS:
            return processWebhookJob;
        default:
            return async () => {
                console.warn(`No processor for queue: ${queueName}`);
            };
    }
}

// BullMQ Worker type
interface BullMQWorker {
    on(event: string, handler: (...args: unknown[]) => void): void;
    close(): Promise<void>;
}

/**
 * Start workers for all queues
 */
async function startWorkers(): Promise<void> {
    console.log('[Worker] Starting BullMQ workers...');

    // Dynamic import of bullmq
    let Worker: new (
        name: string,
        processor: (job: { id?: string; name: string; data: Record<string, unknown> }) => Promise<void>,
        opts: Record<string, unknown>
    ) => BullMQWorker;

    try {
        const bullmq = await import('bullmq');
        Worker = bullmq.Worker as unknown as typeof Worker;
    } catch (error) {
        console.error('[Worker] BullMQ not installed. Please install bullmq and ioredis.');
        console.error('[Worker] Run: npm install bullmq ioredis');
        process.exit(1);
    }

    const connection = getRedisConnection();
    const workers: BullMQWorker[] = [];

    // Create a worker for each queue
    for (const queueName of Object.values(QUEUE_NAMES)) {
        const processor = getProcessor(queueName);

        const worker = new Worker(
            queueName,
            async (job) => {
                console.log(`[${queueName}] Processing job ${job.id}: ${job.name}`);

                try {
                    await processor(job.data);
                    console.log(`[${queueName}] Completed job ${job.id}`);
                } catch (error) {
                    console.error(`[${queueName}] Failed job ${job.id}:`, error);
                    throw error;
                }
            },
            {
                connection,
                concurrency: queueName === QUEUE_NAMES.AI_ASSISTANT ? 2 : 5,
                limiter: {
                    max: queueName === QUEUE_NAMES.EMAIL ? 10 : 100,
                    duration: 1000,
                },
            }
        );

        worker.on('completed', (...args: unknown[]) => {
            const job = args[0] as { id?: string } | undefined;
            console.log(`[${queueName}] Job ${job?.id} completed`);
        });

        worker.on('failed', (...args: unknown[]) => {
            const job = args[0] as { id?: string } | undefined;
            const err = args[1] as Error | undefined;
            console.error(`[${queueName}] Job ${job?.id} failed:`, err?.message);
        });

        worker.on('error', (...args: unknown[]) => {
            const err = args[0] as Error | undefined;
            console.error(`[${queueName}] Worker error:`, err);
        });

        workers.push(worker as BullMQWorker);
        console.log(`[Worker] Started worker for queue: ${queueName}`);
    }

    // Graceful shutdown
    const shutdown = async () => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        console.log('[Worker] Shutting down workers...');

        await Promise.all(workers.map((w: BullMQWorker) => w.close()));

        console.log('[Worker] All workers stopped');
        process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    console.log('[Worker] All workers started successfully');
}

// Start workers if this is the main module
if (require.main === module) {
    startWorkers().catch((err) => {
        console.error('[Worker] Failed to start workers:', err);
        process.exit(1);
    });
}

export { startWorkers };
