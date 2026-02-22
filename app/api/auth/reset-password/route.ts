import { NextRequest, NextResponse } from 'next/server';
import { resetPassword } from '@/lib/auth/users';
import { validatePassword } from '@/lib/auth/types';

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { token, password } = body;

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token and new password required' },
                { status: 400 }
            );
        }

        // Validate new password
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.errors.join(', ') },
                { status: 400 }
            );
        }

        const success = await resetPassword(token, password);

        if (!success) {
            return NextResponse.json(
                { error: 'Invalid or expired reset token' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            message: 'Password reset successfully. You can now login with your new password.',
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to reset password';
        console.error('Password reset error:', error);
        return NextResponse.json({ error: message }, { status: 400 });
    }
}
