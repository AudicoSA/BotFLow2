import { NextRequest, NextResponse } from 'next/server';
import { verifyEmail, resendVerificationEmail } from '@/lib/auth/users';
import { validateEmail } from '@/lib/auth/types';

// POST /api/auth/verify-email - Verify email with token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Verification token required' },
                { status: 400 }
            );
        }

        const success = await verifyEmail(token);

        if (!success) {
            return NextResponse.json(
                { error: 'Invalid or expired verification token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Email verified successfully. You can now login.',
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return NextResponse.json(
            { error: 'Failed to verify email' },
            { status: 500 }
        );
    }
}

// PUT /api/auth/verify-email - Resend verification email
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email required' },
                { status: 400 }
            );
        }

        if (!validateEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        const token = await resendVerificationEmail(email);

        // Always return success to prevent email enumeration
        // In production, send email if token exists
        if (token) {
            // await sendVerificationEmail(email, token);
        }

        return NextResponse.json({
            message: 'If an unverified account exists, a verification email has been sent.',
            // Only include token in development for testing
            ...(process.env.NODE_ENV === 'development' && token && {
                verification_token: token,
            }),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to resend verification';

        if (message.includes('already verified')) {
            return NextResponse.json({ error: message }, { status: 400 });
        }

        console.error('Resend verification error:', error);
        return NextResponse.json(
            { error: 'Failed to resend verification email' },
            { status: 500 }
        );
    }
}
