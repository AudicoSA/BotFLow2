import { NextRequest, NextResponse } from 'next/server';
import { refreshSession } from '@/lib/auth/sessions';

// POST /api/auth/refresh - Refresh access token
export async function POST(request: NextRequest) {
    try {
        // Get refresh token from cookie or body
        let refreshToken = request.cookies.get('refresh_token')?.value;

        if (!refreshToken) {
            const body = await request.json().catch(() => ({}));
            refreshToken = body.refresh_token;
        }

        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token required' },
                { status: 401 }
            );
        }

        // Get client IP for session tracking
        const ipAddress = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Refresh the session
        const result = await refreshSession(refreshToken, ipAddress);

        if (!result) {
            // Clear the invalid cookie
            const response = NextResponse.json(
                { error: 'Invalid or expired refresh token' },
                { status: 401 }
            );
            response.cookies.delete('refresh_token');
            return response;
        }

        return NextResponse.json({
            user: result.user,
            access_token: result.access_token,
            expires_in: result.expires_in,
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        return NextResponse.json(
            { error: 'Failed to refresh token' },
            { status: 500 }
        );
    }
}
