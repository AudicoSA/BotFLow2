// Billing Module

// Types
export * from './types';

// Usage storage
export {
    recordUsage,
    recordUsageBatch,
    getUsageRecords,
    getUsageByType,
    getUsageSummary,
    getUsageCount,
    checkUsageLimit,
    calculateOverageCharges,
    getDailyUsage,
} from './usage-storage';

// Metering
export {
    trackAIConversation,
    trackAIMessage,
    trackAITokens,
    trackWhatsAppMessageSent,
    trackWhatsAppMessageReceived,
    trackWhatsAppMessageBatch,
    trackReceiptProcessed,
    trackReceiptExport,
    flushBuffer,
    trackImmediate,
    getBufferSize,
    startPeriodicFlush,
    stopPeriodicFlush,
} from './metering';

// Charges & Invoices
export {
    calculateMonthlyCharges,
    generateInvoice,
    getInvoice,
    getOrganizationInvoices,
    updateInvoiceStatus,
    markInvoicePaid,
    getPendingInvoices,
    getOverdueInvoices,
    getInvoiceStats,
} from './charges';

// Paystack integration
export {
    getOrCreatePaystackCustomer,
    createPaystackInvoice,
    sendPaystackInvoice,
    getPaystackInvoiceStatus,
    syncInvoiceStatus,
    voidPaystackInvoice,
    handlePaystackInvoiceWebhook,
    getInvoicePdfUrl,
} from './paystack-invoices';

// Jobs
export {
    runMonthlyBillingJob,
    syncInvoiceStatuses,
    sendOverdueReminders,
    aggregateDailyUsage,
    checkTrialExpirations,
    runScheduledJobs,
} from './jobs';
