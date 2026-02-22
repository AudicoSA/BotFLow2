// Resend Email Client
// Provides email sending functionality using Resend API

import { emailConfig, appConfig } from '@/lib/config/environment';

// Resend API types
interface ResendEmailOptions {
    from: string;
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    tags?: { name: string; value: string }[];
}

interface ResendResponse {
    id: string;
}

interface ResendError {
    statusCode: number;
    message: string;
    name: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: ResendEmailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
    const apiKey = emailConfig.resendApiKey;

    if (!apiKey) {
        console.warn('[Email] Resend API key not configured, skipping email send');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: options.from || `${appConfig.name} <${emailConfig.fromEmail}>`,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text,
                reply_to: options.replyTo || emailConfig.replyToEmail,
                tags: options.tags,
            }),
        });

        if (!response.ok) {
            const error = await response.json() as ResendError;
            console.error('[Email] Resend API error:', error);
            return { success: false, error: error.message };
        }

        const result = await response.json() as ResendResponse;
        console.log('[Email] Email sent successfully:', result.id);
        return { success: true, id: result.id };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('[Email] Failed to send email:', message);
        return { success: false, error: message };
    }
}

/**
 * Send a batch of emails using Resend API
 */
export async function sendBatchEmails(emails: ResendEmailOptions[]): Promise<{ success: boolean; results: { id?: string; error?: string }[] }> {
    const results = await Promise.all(emails.map(sendEmail));
    return {
        success: results.every(r => r.success),
        results: results.map(r => ({ id: r.id, error: r.error })),
    };
}

export type { ResendEmailOptions };
