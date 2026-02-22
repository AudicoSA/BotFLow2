// Email Service
// High-level email sending service with job queuing and templates

import { sendEmail, type ResendEmailOptions } from './client';
import {
    welcomeEmail,
    trialReminder7Days,
    trialReminder3Days,
    trialReminder1Day,
    featureEducationDay1,
    featureEducationDay3,
    featureEducationDay5,
    featureEducationDay7,
    paymentFailedEmail,
    subscriptionRenewalEmail,
    invoiceEmail,
    verificationEmail,
    passwordResetEmail,
    type WelcomeEmailData,
    type TrialReminderEmailData,
    type FeatureEducationEmailData,
    type PaymentFailedEmailData,
    type SubscriptionRenewalEmailData,
    type InvoiceEmailData,
    type VerificationEmailData,
    type PasswordResetEmailData,
} from './templates';
import { addEmailJob } from '@/lib/queue/client';
import { emailConfig, appConfig } from '@/lib/config/environment';

// Email types matching queue definitions
export type EmailType =
    | 'welcome'
    | 'verification'
    | 'password_reset'
    | 'trial_reminder_7'
    | 'trial_reminder_3'
    | 'trial_reminder_1'
    | 'feature_education_1'
    | 'feature_education_3'
    | 'feature_education_5'
    | 'feature_education_7'
    | 'payment_failed'
    | 'subscription_renewal'
    | 'invoice';

// Result type for email operations
interface EmailResult {
    success: boolean;
    id?: string;
    error?: string;
}

/**
 * Send an email immediately (bypasses queue)
 */
export async function sendEmailImmediate(
    type: EmailType,
    to: string,
    templateData: Record<string, unknown>
): Promise<EmailResult> {
    const email = generateEmail(type, templateData);
    if (!email) {
        return { success: false, error: `Unknown email type: ${type}` };
    }

    return sendEmail({
        from: `${appConfig.name} <${emailConfig.fromEmail}>`,
        to,
        subject: email.subject,
        html: email.html,
    });
}

/**
 * Queue an email for background sending
 */
export async function queueEmail(
    type: EmailType,
    to: string,
    userId: string,
    templateData: Record<string, unknown>,
    options?: { delay?: number; priority?: number }
): Promise<string> {
    // Map detailed types to queue types
    const queueType = mapToQueueType(type);

    return addEmailJob(
        {
            type: queueType,
            to,
            userId,
            templateData: { ...templateData, emailType: type },
        },
        options
    );
}

/**
 * Map detailed email types to queue types
 */
function mapToQueueType(type: EmailType): 'welcome' | 'verification' | 'password_reset' | 'trial_reminder' | 'payment_failed' | 'invoice' {
    if (type.startsWith('trial_reminder') || type.startsWith('feature_education')) {
        return 'trial_reminder';
    }
    if (type === 'subscription_renewal') {
        return 'invoice';
    }
    return type as 'welcome' | 'verification' | 'password_reset' | 'payment_failed' | 'invoice';
}

/**
 * Generate email content based on type
 */
export function generateEmail(
    type: EmailType,
    data: Record<string, unknown>
): { subject: string; html: string } | null {
    switch (type) {
        case 'welcome':
            return welcomeEmail(data as unknown as WelcomeEmailData);

        case 'verification':
            return verificationEmail(data as unknown as VerificationEmailData);

        case 'password_reset':
            return passwordResetEmail(data as unknown as PasswordResetEmailData);

        case 'trial_reminder_7':
            return trialReminder7Days(data as unknown as TrialReminderEmailData);

        case 'trial_reminder_3':
            return trialReminder3Days(data as unknown as TrialReminderEmailData);

        case 'trial_reminder_1':
            return trialReminder1Day(data as unknown as TrialReminderEmailData);

        case 'feature_education_1':
            return featureEducationDay1(data as unknown as FeatureEducationEmailData);

        case 'feature_education_3':
            return featureEducationDay3(data as unknown as FeatureEducationEmailData);

        case 'feature_education_5':
            return featureEducationDay5(data as unknown as FeatureEducationEmailData);

        case 'feature_education_7':
            return featureEducationDay7(data as unknown as FeatureEducationEmailData);

        case 'payment_failed':
            return paymentFailedEmail(data as unknown as PaymentFailedEmailData);

        case 'subscription_renewal':
            return subscriptionRenewalEmail(data as unknown as SubscriptionRenewalEmailData);

        case 'invoice':
            return invoiceEmail(data as unknown as InvoiceEmailData);

        default:
            return null;
    }
}

// ==========================================
// High-level email functions
// ==========================================

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(
    to: string,
    userId: string,
    data: WelcomeEmailData,
    immediate = false
): Promise<EmailResult | string> {
    if (immediate) {
        return sendEmailImmediate('welcome', to, data as unknown as Record<string, unknown>);
    }
    return queueEmail('welcome', to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
    to: string,
    userId: string,
    data: VerificationEmailData,
    immediate = true
): Promise<EmailResult | string> {
    if (immediate) {
        return sendEmailImmediate('verification', to, data as unknown as Record<string, unknown>);
    }
    return queueEmail('verification', to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
    to: string,
    userId: string,
    data: PasswordResetEmailData,
    immediate = true
): Promise<EmailResult | string> {
    if (immediate) {
        return sendEmailImmediate('password_reset', to, data as unknown as Record<string, unknown>);
    }
    return queueEmail('password_reset', to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send trial reminder email
 */
export async function sendTrialReminderEmail(
    to: string,
    userId: string,
    daysRemaining: 7 | 3 | 1,
    data: TrialReminderEmailData
): Promise<string> {
    const type = `trial_reminder_${daysRemaining}` as EmailType;
    return queueEmail(type, to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send feature education email
 */
export async function sendFeatureEducationEmail(
    to: string,
    userId: string,
    day: 1 | 3 | 5 | 7,
    data: FeatureEducationEmailData
): Promise<string> {
    const type = `feature_education_${day}` as EmailType;
    return queueEmail(type, to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
    to: string,
    userId: string,
    data: PaymentFailedEmailData,
    immediate = true
): Promise<EmailResult | string> {
    if (immediate) {
        return sendEmailImmediate('payment_failed', to, data as unknown as Record<string, unknown>);
    }
    return queueEmail('payment_failed', to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send subscription renewal email
 */
export async function sendSubscriptionRenewalEmail(
    to: string,
    userId: string,
    data: SubscriptionRenewalEmailData
): Promise<string> {
    return queueEmail('subscription_renewal', to, userId, data as unknown as Record<string, unknown>);
}

/**
 * Send invoice email
 */
export async function sendInvoiceEmail(
    to: string,
    userId: string,
    data: InvoiceEmailData
): Promise<string> {
    return queueEmail('invoice', to, userId, data as unknown as Record<string, unknown>);
}
