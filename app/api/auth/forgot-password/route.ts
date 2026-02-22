import { NextRequest, NextResponse } from 'next/server';
import { requestPasswordReset } from '@/lib/auth/users';
import { validateEmail } from '@/lib/auth/types';

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
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

        const token = await requestPasswordReset(email);

        // Always return success to prevent email enumeration
        // In production, send email if token exists
        if (token) {
            // await sendPasswordResetEmail(email, token);
        }

        return NextResponse.json({
            message: 'If an account exists, a password reset email has been sent.',
            // Only include token in development for testing
            ...(process.env.NODE_ENV === 'development' && token && {
                reset_token: token,
            }),
        });
    } catch (error) {
        console.error('Password reset request error:', error);
        return NextResponse.json(
            { error: 'Failed to process password reset request' },
            { status: 500 }
        );
    }
}
