// Session Management

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { generateSecureToken } from './password';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
} from './jwt';
import type { User, UserSession, AuthResponse, AUTH_CONFIG } from './types';
import { sanitizeUser } from './types';

interface SessionRecord {
    id: string;
    user_id: string;
    refresh_token: string;
    expires_at: string;
    created_at: string;
    last_used_at: string;
    ip_address: string | null;
    user_agent: string | null;
    is_revoked: boolean;
}

/**
 * Create a new user session
 */
export async function createSession(
    user: User,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResponse> {
    const supabase = getSupabaseServerClient();

    // Generate session ID
    const sessionId = generateSecureToken(32);

    // Calculate expiry (7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Generate tokens
    const accessToken = await generateAccessToken(
        user.id,
        user.email,
        user.role,
        user.organization_id
    );

    const refreshToken = await generateRefreshToken(user.id, sessionId);

    // Store session in database
    const sessionData: Partial<SessionRecord> = {
        id: sessionId,
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        is_revoked: false,
    };

    await supabase
        .from<SessionRecord>('user_sessions')
        .insert(sessionData);

    // Clean up old sessions (keep only MAX_SESSIONS_PER_USER)
    await cleanupOldSessions(user.id);

    return {
        user: sanitizeUser(user),
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 15 * 60, // 15 minutes in seconds
    };
}

/**
 * Refresh an existing session
 */
export async function refreshSession(
    refreshTokenValue: string,
    ipAddress?: string
): Promise<AuthResponse | null> {
    const supabase = getSupabaseServerClient();

    // Verify the refresh token
    const tokenResult = await verifyRefreshToken(refreshTokenValue);
    if (!tokenResult.valid || !tokenResult.payload) {
        return null;
    }

    const { sub: userId, session_id: sessionId } = tokenResult.payload;

    // Get the session from database
    const sessionResult = await supabase
        .from<SessionRecord>('user_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('is_revoked', false)
        .single();

    if (!sessionResult.data) {
        return null;
    }

    const session = sessionResult.data;

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
        // Revoke the expired session
        await revokeSession(sessionId);
        return null;
    }

    // Get the user
    const userResult = await supabase
        .from<User>('users')
        .select('*')
        .eq('id', userId)
        .eq('status', 'active')
        .single();

    if (!userResult.data) {
        return null;
    }

    const user = userResult.data;

    // Generate new access token
    const accessToken = await generateAccessToken(
        user.id,
        user.email,
        user.role,
        user.organization_id
    );

    // Update last_used_at
    await supabase
        .from<SessionRecord>('user_sessions')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', sessionId);

    return {
        user: sanitizeUser(user),
        access_token: accessToken,
        refresh_token: refreshTokenValue, // Keep same refresh token
        expires_in: 15 * 60,
    };
}

/**
 * Revoke a specific session
 */
export async function revokeSession(sessionId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase
        .from<SessionRecord>('user_sessions')
        .update({ is_revoked: true })
        .eq('id', sessionId);
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllSessions(userId: string): Promise<void> {
    const supabase = getSupabaseServerClient();

    await supabase
        .from<SessionRecord>('user_sessions')
        .update({ is_revoked: true })
        .eq('user_id', userId);
}

/**
 * Revoke all sessions except current one
 */
export async function revokeOtherSessions(
    userId: string,
    currentSessionId: string
): Promise<void> {
    const supabase = getSupabaseServerClient();

    // Get all sessions for user
    const sessionsResult = await supabase
        .from<SessionRecord>('user_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('is_revoked', false);

    const sessions = sessionsResult.data || [];

    // Revoke all except current
    for (const session of sessions) {
        if (session.id !== currentSessionId) {
            await revokeSession(session.id);
        }
    }
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string): Promise<SessionRecord[]> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SessionRecord>('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_revoked', false)
        .order('last_used_at', { ascending: false });

    return result.data || [];
}

/**
 * Clean up old sessions (keep only the most recent ones)
 */
async function cleanupOldSessions(
    userId: string,
    maxSessions: number = 5
): Promise<void> {
    const supabase = getSupabaseServerClient();

    // Get all active sessions ordered by last_used_at
    const sessionsResult = await supabase
        .from<SessionRecord>('user_sessions')
        .select('id, last_used_at')
        .eq('user_id', userId)
        .eq('is_revoked', false)
        .order('last_used_at', { ascending: false });

    const sessions = sessionsResult.data || [];

    // Revoke sessions beyond the limit
    if (sessions.length > maxSessions) {
        const sessionsToRevoke = sessions.slice(maxSessions);
        for (const session of sessionsToRevoke) {
            await revokeSession(session.id);
        }
    }
}

/**
 * Get session by refresh token
 */
export async function getSessionByRefreshToken(
    refreshTokenValue: string
): Promise<SessionRecord | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SessionRecord>('user_sessions')
        .select('*')
        .eq('refresh_token', refreshTokenValue)
        .eq('is_revoked', false)
        .single();

    return result.data || null;
}

/**
 * Validate a session is still active
 */
export async function validateSession(sessionId: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<SessionRecord>('user_sessions')
        .select('id, expires_at, is_revoked')
        .eq('id', sessionId)
        .single();

    if (!result.data) {
        return false;
    }

    const session = result.data;

    // Check if revoked or expired
    if (session.is_revoked || new Date(session.expires_at) < new Date()) {
        return false;
    }

    return true;
}
