// Email Send API Endpoint
// POST /api/email/send - Send an email immediately or queue it

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendEmailImmediate, queueEmail, type EmailType } from '@/lib/email/service';

// Request validation schema
const sendEmailSchema = z.object({
    type: z.enum([
        'welcome',
        'verification',
        'password_reset',
        'trial_reminder_7',
        'trial_reminder_3',
        'trial_reminder_1',
        'feature_education_1',
        'feature_education_3',
        'feature_education_5',
        'feature_education_7',
        'payment_failed',
        'subscription_renewal',
        'invoice',
    ]),
    to: z.string().email(),
    userId: z.string().min(1),
    templateData: z.record(z.string(), z.unknown()),
    immediate: z.boolean().optional().default(false),
    delay: z.number().optional(),
    priority: z.number().optional(),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = sendEmailSchema.parse(body);

        if (data.immediate) {
            // Send immediately
            const result = await sendEmailImmediate(
                data.type as EmailType,
                data.to,
                data.templateData
            );

            if (!result.success) {
                return NextResponse.json(
                    { error: result.error || 'Failed to send email' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                id: result.id,
                message: 'Email sent successfully',
            });
        } else {
            // Queue for background sending
            const jobId = await queueEmail(
                data.type as EmailType,
                data.to,
                data.userId,
                data.templateData,
                {
                    delay: data.delay,
                    priority: data.priority,
                }
            );

            return NextResponse.json({
                success: true,
                jobId,
                message: 'Email queued for sending',
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request', details: error.issues },
                { status: 400 }
            );
        }

        console.error('[API] Failed to send email:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
