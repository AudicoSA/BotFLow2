// JWT Token Utilities
// Uses Web Crypto API for HMAC-SHA256 (Edge-compatible, no external dependencies)

import type {
    AccessTokenPayload,
    RefreshTokenPayload,
    MagicLinkTokenPayload,
    EmailVerificationPayload,
    PasswordResetPayload,
    TokenVerifyResult,
    UserRole,
} from './types';
import { AUTH_CONFIG } from './types';

// Get JWT secret from environment
const getJwtSecret = (): string => {
    return process.env.JWT_SECRET || 'botflow-dev-secret-change-in-production';
};

// Base64 URL encoding/decoding
function base64UrlEncode(str: string): string {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
        base64 += '='.repeat(4 - pad);
    }
    return decodeURIComponent(escape(atob(base64)));
}

// Create HMAC-SHA256 signature using Web Crypto API
async function createSignature(data: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(data);

    const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const signatureArray = new Uint8Array(signature);

    // Convert to base64url
    let binary = '';
    for (const byte of signatureArray) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Verify HMAC-SHA256 signature
async function verifySignature(
    data: string,
    signature: string,
    secret: string
): Promise<boolean> {
    const expectedSignature = await createSignature(data, secret);
    return signature === expectedSignature;
}

// Create a JWT token
async function createJWT(
    payload: Record<string, unknown>,
    expiresIn: number
): Promise<string> {
    const secret = getJwtSecret();
    const now = Math.floor(Date.now() / 1000);

    const header = {
        alg: 'HS256',
        typ: 'JWT',
    };

    const fullPayload = {
        ...payload,
        iat: now,
        exp: now + expiresIn,
        iss: 'botflow',
    };

    const headerEncoded = base64UrlEncode(JSON.stringify(header));
    const payloadEncoded = base64UrlEncode(JSON.stringify(fullPayload));
    const dataToSign = `${headerEncoded}.${payloadEncoded}`;

    const signature = await createSignature(dataToSign, secret);

    return `${dataToSign}.${signature}`;
}

// Verify and decode a JWT token
async function verifyJWT<T>(
    token: string,
    expectedAudience?: string
): Promise<{ valid: boolean; payload?: T; error?: string }> {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { valid: false, error: 'Invalid token format' };
        }

        const [headerEncoded, payloadEncoded, signature] = parts;
        const secret = getJwtSecret();

        // Verify signature
        const dataToVerify = `${headerEncoded}.${payloadEncoded}`;
        const isValid = await verifySignature(dataToVerify, signature, secret);

        if (!isValid) {
            return { valid: false, error: 'Invalid signature' };
        }

        // Decode payload
        const payloadJson = base64UrlDecode(payloadEncoded);
        const payload = JSON.parse(payloadJson) as T & { exp: number; iss: string; aud?: string };

        // Check expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            return { valid: false, error: 'Token expired' };
        }

        // Check issuer
        if (payload.iss !== 'botflow') {
            return { valid: false, error: 'Invalid issuer' };
        }

        // Check audience if provided
        if (expectedAudience && payload.aud !== expectedAudience) {
            return { valid: false, error: 'Invalid audience' };
        }

        return { valid: true, payload: payload as T };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Token verification failed';
        return { valid: false, error: message };
    }
}

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(
    userId: string,
    email: string,
    role: UserRole,
    organizationId: string | null
): Promise<string> {
    return createJWT(
        {
            sub: userId,
            email,
            role,
            org_id: organizationId,
            type: 'access',
            aud: 'botflow-api',
        },
        AUTH_CONFIG.ACCESS_TOKEN_EXPIRY
    );
}

/**
 * Generate a refresh token for a session
 */
export async function generateRefreshToken(
    userId: string,
    sessionId: string
): Promise<string> {
    return createJWT(
        {
            sub: userId,
            session_id: sessionId,
            type: 'refresh',
            aud: 'botflow-api',
        },
        AUTH_CONFIG.REFRESH_TOKEN_EXPIRY
    );
}

/**
 * Generate a magic link token
 */
export async function generateMagicLinkToken(email: string): Promise<string> {
    return createJWT(
        {
            email,
            type: 'magic_link',
            aud: 'botflow-auth',
        },
        AUTH_CONFIG.MAGIC_LINK_EXPIRY
    );
}

/**
 * Generate an email verification token
 */
export async function generateEmailVerificationToken(
    userId: string,
    email: string
): Promise<string> {
    return createJWT(
        {
            user_id: userId,
            email,
            type: 'email_verification',
            aud: 'botflow-auth',
        },
        AUTH_CONFIG.EMAIL_VERIFICATION_EXPIRY
    );
}

/**
 * Generate a password reset token
 */
export async function generatePasswordResetToken(
    userId: string,
    email: string
): Promise<string> {
    return createJWT(
        {
            user_id: userId,
            email,
            type: 'password_reset',
            aud: 'botflow-auth',
        },
        AUTH_CONFIG.PASSWORD_RESET_EXPIRY
    );
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<TokenVerifyResult> {
    const result = await verifyJWT<AccessTokenPayload>(token, 'botflow-api');

    if (!result.valid || !result.payload) {
        return { valid: false, error: result.error };
    }

    if (result.payload.type !== 'access') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload: result.payload };
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(
    token: string
): Promise<{ valid: boolean; payload?: RefreshTokenPayload; error?: string }> {
    const result = await verifyJWT<RefreshTokenPayload>(token, 'botflow-api');

    if (!result.valid || !result.payload) {
        return { valid: false, error: result.error };
    }

    if (result.payload.type !== 'refresh') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload: result.payload };
}

/**
 * Verify a magic link token
 */
export async function verifyMagicLinkToken(
    token: string
): Promise<{ valid: boolean; payload?: MagicLinkTokenPayload; error?: string }> {
    const result = await verifyJWT<MagicLinkTokenPayload>(token, 'botflow-auth');

    if (!result.valid || !result.payload) {
        return { valid: false, error: result.error };
    }

    if (result.payload.type !== 'magic_link') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload: result.payload };
}

/**
 * Verify an email verification token
 */
export async function verifyEmailVerificationToken(
    token: string
): Promise<{ valid: boolean; payload?: EmailVerificationPayload; error?: string }> {
    const result = await verifyJWT<EmailVerificationPayload>(token, 'botflow-auth');

    if (!result.valid || !result.payload) {
        return { valid: false, error: result.error };
    }

    if (result.payload.type !== 'email_verification') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload: result.payload };
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(
    token: string
): Promise<{ valid: boolean; payload?: PasswordResetPayload; error?: string }> {
    const result = await verifyJWT<PasswordResetPayload>(token, 'botflow-auth');

    if (!result.valid || !result.payload) {
        return { valid: false, error: result.error };
    }

    if (result.payload.type !== 'password_reset') {
        return { valid: false, error: 'Invalid token type' };
    }

    return { valid: true, payload: result.payload };
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payloadJson = base64UrlDecode(parts[1]);
        return JSON.parse(payloadJson);
    } catch {
        return null;
    }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
}

/**
 * Get token expiration time in seconds
 */
export function getTokenExpiry(token: string): number | null {
    const payload = decodeToken(token);
    if (!payload || typeof payload.exp !== 'number') return null;
    return payload.exp;
}
