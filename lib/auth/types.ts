// Authentication Types

export interface User {
    id: string;
    email: string;
    password_hash: string;
    email_verified: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    organization_id: string | null;
    name: string | null;
    avatar_url: string | null;
    role: UserRole;
    status: UserStatus;
}

export type UserRole = 'owner' | 'admin' | 'member';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface UserSession {
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

export interface EmailVerification {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    created_at: string;
    used_at: string | null;
}

export interface PasswordReset {
    id: string;
    user_id: string;
    token: string;
    expires_at: string;
    created_at: string;
    used_at: string | null;
}

export interface MagicLink {
    id: string;
    email: string;
    token: string;
    expires_at: string;
    created_at: string;
    used_at: string | null;
}

// JWT Payload types
export interface AccessTokenPayload {
    sub: string; // user_id
    email: string;
    role: UserRole;
    org_id: string | null;
    type: 'access';
    iat: number;
    exp: number;
}

export interface RefreshTokenPayload {
    sub: string; // user_id
    session_id: string;
    type: 'refresh';
    iat: number;
    exp: number;
}

export interface MagicLinkTokenPayload {
    email: string;
    type: 'magic_link';
    iat: number;
    exp: number;
}

export interface EmailVerificationPayload {
    user_id: string;
    email: string;
    type: 'email_verification';
    iat: number;
    exp: number;
}

export interface PasswordResetPayload {
    user_id: string;
    email: string;
    type: 'password_reset';
    iat: number;
    exp: number;
}

// Request/Response types
export interface SignupRequest {
    email: string;
    password: string;
    name?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface MagicLinkRequest {
    email: string;
}

export interface PasswordResetRequest {
    email: string;
}

export interface SetNewPasswordRequest {
    token: string;
    password: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface AuthResponse {
    user: Omit<User, 'password_hash'>;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

export interface TokenVerifyResult {
    valid: boolean;
    payload?: AccessTokenPayload;
    error?: string;
}

// Configuration
export const AUTH_CONFIG = {
    // Token expiration times (in seconds)
    ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes
    REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days
    EMAIL_VERIFICATION_EXPIRY: 24 * 60 * 60, // 24 hours
    PASSWORD_RESET_EXPIRY: 60 * 60, // 1 hour
    MAGIC_LINK_EXPIRY: 15 * 60, // 15 minutes

    // Password requirements
    MIN_PASSWORD_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false,

    // Session settings
    MAX_SESSIONS_PER_USER: 5,

    // Rate limiting
    MAX_LOGIN_ATTEMPTS: 5,
    LOGIN_LOCKOUT_MINUTES: 15,
};

// Validation helpers
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < AUTH_CONFIG.MIN_PASSWORD_LENGTH) {
        errors.push(`Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`);
    }

    if (AUTH_CONFIG.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (AUTH_CONFIG.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (AUTH_CONFIG.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (AUTH_CONFIG.REQUIRE_SPECIAL && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Safe user object (without password_hash)
export function sanitizeUser(user: User): Omit<User, 'password_hash'> {
    const { password_hash, ...safeUser } = user;
    return safeUser;
}
