import { NextRequest, NextResponse } from 'next/server';
import { revokeSession, revokeAllSessions } from '@/lib/auth/sessions';
import { verifyRefreshToken } from '@/lib/auth/jwt';

// POST /api/auth/logout - Logout and revoke session
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}));
        const { all_sessions = false } = body;

        // Get refresh token from cookie
        const refreshToken = request.cookies.get('refresh_token')?.value;

        if (refreshToken) {
            // Verify token to get session info
            const tokenResult = await verifyRefreshToken(refreshToken);

            if (tokenResult.valid && tokenResult.payload) {
                if (all_sessions) {
                    // Revoke all sessions for the user
                    await revokeAllSessions(tokenResult.payload.sub);
                } else {
                    // Revoke just this session
                    await revokeSession(tokenResult.payload.session_id);
                }
            }
        }

        // Clear the refresh token cookie
        const response = NextResponse.json({
            message: all_sessions
                ? 'Logged out from all devices'
                : 'Logged out successfully',
        });

        response.cookies.delete('refresh_token');

        return response;
    } catch (error) {
        console.error('Logout error:', error);

        // Still clear the cookie even if revocation failed
        const response = NextResponse.json({ message: 'Logged out' });
        response.cookies.delete('refresh_token');

        return response;
    }
}
