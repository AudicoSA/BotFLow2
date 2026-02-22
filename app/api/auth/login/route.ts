import { NextRequest, NextResponse } from 'next/server';
import { loginWithPassword } from '@/lib/auth/users';

// POST /api/auth/login - Login with email and password
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Get client info for session
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';
        const userAgent = request.headers.get('user-agent') || undefined;

        // Attempt login
        const result = await loginWithPassword(
            { email, password },
            ipAddress,
            userAgent
        );

        if (!result) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Set refresh token as HTTP-only cookie
        const response = NextResponse.json({
            user: result.user,
            access_token: result.access_token,
            expires_in: result.expires_in,
        });

        // Set secure cookie for refresh token
        response.cookies.set('refresh_token', result.refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';

        if (message.includes('suspended')) {
            return NextResponse.json({ error: message }, { status: 403 });
        }

        console.error('Login error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
