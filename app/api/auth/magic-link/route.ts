import { NextRequest, NextResponse } from 'next/server';
import { requestMagicLink, loginWithMagicLink } from '@/lib/auth/users';
import { validateEmail } from '@/lib/auth/types';

// POST /api/auth/magic-link - Request magic link login
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

        const token = await requestMagicLink(email);

        // Always return success to prevent email enumeration
        // In production, send email if token exists
        if (token) {
            // await sendMagicLinkEmail(email, token);
        }

        return NextResponse.json({
            message: 'If an account exists, a login link has been sent to your email.',
            // Only include token in development for testing
            ...(process.env.NODE_ENV === 'development' && token && {
                magic_link_token: token,
            }),
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send magic link';

        if (message.includes('suspended')) {
            return NextResponse.json({ error: message }, { status: 403 });
        }

        console.error('Magic link request error:', error);
        return NextResponse.json(
            { error: 'Failed to send magic link' },
            { status: 500 }
        );
    }
}

// PUT /api/auth/magic-link - Login with magic link token
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Magic link token required' },
                { status: 400 }
            );
        }

        // Get client info for session
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || undefined;

        const result = await loginWithMagicLink(token, ipAddress, userAgent);

        if (!result) {
            return NextResponse.json(
                { error: 'Invalid or expired magic link' },
                { status: 401 }
            );
        }

        // Set refresh token as HTTP-only cookie
        const response = NextResponse.json({
            user: result.user,
            access_token: result.access_token,
            expires_in: result.expires_in,
        });

        response.cookies.set('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to login with magic link';

        if (message.includes('suspended')) {
            return NextResponse.json({ error: message }, { status: 403 });
        }

        console.error('Magic link login error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
