import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, verifyRefreshToken } from '@/lib/auth/jwt';
import {
    getUserSessions,
    revokeSession,
    revokeOtherSessions,
} from '@/lib/auth/sessions';

// Helper to extract and verify auth token
async function getAuthenticatedUser(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const result = await verifyAccessToken(token);

    if (!result.valid || !result.payload) {
        return null;
    }

    return result.payload;
}

// GET /api/auth/sessions - Get all active sessions
export async function GET(request: NextRequest) {
    try {
        const payload = await getAuthenticatedUser(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const sessions = await getUserSessions(payload.sub);

        // Get current session ID from refresh token cookie
        const refreshToken = request.cookies.get('refresh_token')?.value;
        let currentSessionId: string | null = null;

        if (refreshToken) {
            const refreshResult = await verifyRefreshToken(refreshToken);
            if (refreshResult.valid && refreshResult.payload) {
                currentSessionId = refreshResult.payload.session_id;
            }
        }

        // Format sessions for response (hide sensitive data)
        const formattedSessions = sessions.map((session) => ({
            id: session.id,
            created_at: session.created_at,
            last_used_at: session.last_used_at,
            ip_address: session.ip_address,
            user_agent: session.user_agent,
            is_current: session.id === currentSessionId,
        }));

        return NextResponse.json({ sessions: formattedSessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        return NextResponse.json(
            { error: 'Failed to get sessions' },
            { status: 500 }
        );
    }
}

// DELETE /api/auth/sessions - Revoke sessions
export async function DELETE(request: NextRequest) {
    try {
        const payload = await getAuthenticatedUser(request);

        if (!payload) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json().catch(() => ({}));
        const { session_id, revoke_others = false } = body;

        // Get current session ID
        const refreshToken = request.cookies.get('refresh_token')?.value;
        let currentSessionId: string | null = null;

        if (refreshToken) {
            const refreshResult = await verifyRefreshToken(refreshToken);
            if (refreshResult.valid && refreshResult.payload) {
                currentSessionId = refreshResult.payload.session_id;
            }
        }

        if (revoke_others && currentSessionId) {
            // Revoke all sessions except current
            await revokeOtherSessions(payload.sub, currentSessionId);
            return NextResponse.json({
                message: 'All other sessions have been revoked',
            });
        }

        if (session_id) {
            // Don't allow revoking current session via this endpoint
            if (session_id === currentSessionId) {
                return NextResponse.json(
                    { error: 'Use logout endpoint to revoke current session' },
                    { status: 400 }
                );
            }

            await revokeSession(session_id);
            return NextResponse.json({
                message: 'Session revoked successfully',
            });
        }

        return NextResponse.json(
            { error: 'session_id or revoke_others required' },
            { status: 400 }
        );
    } catch (error) {
        console.error('Revoke session error:', error);
        return NextResponse.json(
            { error: 'Failed to revoke session' },
            { status: 500 }
        );
    }
}
