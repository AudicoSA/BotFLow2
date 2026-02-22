// User Management

import { getSupabaseServerClient } from '@/lib/supabase/client';
import { hashPassword, verifyPassword, generateSecureToken } from './password';
import {
    generateEmailVerificationToken,
    generatePasswordResetToken,
    generateMagicLinkToken,
    verifyEmailVerificationToken,
    verifyPasswordResetToken,
    verifyMagicLinkToken,
} from './jwt';
import { createSession } from './sessions';
import type {
    User,
    SignupRequest,
    LoginRequest,
    AuthResponse,
} from './types';
import { validatePassword, validateEmail, sanitizeUser } from './types';

/**
 * Create a new user with email/password
 */
export async function createUser(data: SignupRequest): Promise<{
    user: Omit<User, 'password_hash'>;
    verificationToken: string;
} | null> {
    const supabase = getSupabaseServerClient();

    // Validate email
    if (!validateEmail(data.email)) {
        throw new Error('Invalid email address');
    }

    // Validate password
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Check if user already exists
    const existingUser = await supabase
        .from<User>('users')
        .select('id')
        .eq('email', data.email.toLowerCase())
        .single();

    if (existingUser.data) {
        throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user record
    const userId = generateSecureToken(16);
    const now = new Date().toISOString();

    const userData: Partial<User> = {
        id: userId,
        email: data.email.toLowerCase(),
        password_hash: passwordHash,
        email_verified: false,
        email_verified_at: null,
        created_at: now,
        updated_at: now,
        organization_id: null,
        name: data.name || null,
        avatar_url: null,
        role: 'owner',
        status: 'pending',
    };

    const result = await supabase
        .from<User>('users')
        .insert(userData)
        .select()
        .single();

    if (!result.data) {
        throw new Error('Failed to create user');
    }

    // Generate email verification token
    const verificationToken = await generateEmailVerificationToken(
        userId,
        data.email.toLowerCase()
    );

    return {
        user: sanitizeUser(result.data),
        verificationToken,
    };
}

/**
 * Login with email and password
 */
export async function loginWithPassword(
    data: LoginRequest,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResponse | null> {
    const supabase = getSupabaseServerClient();

    // Find user by email
    const userResult = await supabase
        .from<User>('users')
        .select('*')
        .eq('email', data.email.toLowerCase())
        .single();

    if (!userResult.data) {
        return null;
    }

    const user = userResult.data;

    // Check if user is active
    if (user.status === 'suspended') {
        throw new Error('Account suspended');
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.password_hash);
    if (!isValid) {
        return null;
    }

    // Create session
    return createSession(user, ipAddress, userAgent);
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    // Verify the token
    const result = await verifyEmailVerificationToken(token);
    if (!result.valid || !result.payload) {
        return false;
    }

    const { user_id, email } = result.payload;

    // Update user's email_verified status
    const updateResult = await supabase
        .from<User>('users')
        .update({
            email_verified: true,
            email_verified_at: new Date().toISOString(),
            status: 'active',
            updated_at: new Date().toISOString(),
        })
        .eq('id', user_id)
        .eq('email', email);

    return true;
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(email: string): Promise<string | null> {
    const supabase = getSupabaseServerClient();

    // Find user by email
    const userResult = await supabase
        .from<User>('users')
        .select('id, email, email_verified')
        .eq('email', email.toLowerCase())
        .single();

    if (!userResult.data) {
        return null;
    }

    const user = userResult.data;

    // Check if already verified
    if (user.email_verified) {
        throw new Error('Email already verified');
    }

    // Generate new verification token
    return generateEmailVerificationToken(user.id, user.email);
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<string | null> {
    const supabase = getSupabaseServerClient();

    // Find user by email
    const userResult = await supabase
        .from<User>('users')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

    if (!userResult.data) {
        // Don't reveal whether email exists
        return null;
    }

    const user = userResult.data;

    // Generate password reset token
    return generatePasswordResetToken(user.id, user.email);
}

/**
 * Reset password with token
 */
export async function resetPassword(
    token: string,
    newPassword: string
): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    // Verify the token
    const result = await verifyPasswordResetToken(token);
    if (!result.valid || !result.payload) {
        return false;
    }

    const { user_id } = result.payload;

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await supabase
        .from<User>('users')
        .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user_id);

    return true;
}

/**
 * Request magic link login
 */
export async function requestMagicLink(email: string): Promise<string | null> {
    const supabase = getSupabaseServerClient();

    // Check if user exists
    const userResult = await supabase
        .from<User>('users')
        .select('id, email, status')
        .eq('email', email.toLowerCase())
        .single();

    if (!userResult.data) {
        // Don't reveal whether email exists - still generate token
        // but don't send email in the calling code
        return null;
    }

    const user = userResult.data;

    if (user.status === 'suspended') {
        throw new Error('Account suspended');
    }

    // Generate magic link token
    return generateMagicLinkToken(user.email);
}

/**
 * Login with magic link
 */
export async function loginWithMagicLink(
    token: string,
    ipAddress?: string,
    userAgent?: string
): Promise<AuthResponse | null> {
    const supabase = getSupabaseServerClient();

    // Verify the token
    const result = await verifyMagicLinkToken(token);
    if (!result.valid || !result.payload) {
        return null;
    }

    const { email } = result.payload;

    // Find user by email
    const userResult = await supabase
        .from<User>('users')
        .select('*')
        .eq('email', email)
        .single();

    if (!userResult.data) {
        return null;
    }

    const user = userResult.data;

    if (user.status === 'suspended') {
        throw new Error('Account suspended');
    }

    // If user hasn't verified email yet, verify it now
    if (!user.email_verified) {
        await supabase
            .from<User>('users')
            .update({
                email_verified: true,
                email_verified_at: new Date().toISOString(),
                status: 'active',
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        user.email_verified = true;
        user.status = 'active';
    }

    // Create session
    return createSession(user, ipAddress, userAgent);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<Omit<User, 'password_hash'> | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<User>('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (!result.data) {
        return null;
    }

    return sanitizeUser(result.data);
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<Omit<User, 'password_hash'> | null> {
    const supabase = getSupabaseServerClient();

    const result = await supabase
        .from<User>('users')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

    if (!result.data) {
        return null;
    }

    return sanitizeUser(result.data);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    data: { name?: string; avatar_url?: string }
): Promise<Omit<User, 'password_hash'> | null> {
    const supabase = getSupabaseServerClient();

    const updateData: Partial<User> = {
        ...data,
        updated_at: new Date().toISOString(),
    };

    const result = await supabase
        .from<User>('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (!result.data) {
        return null;
    }

    return sanitizeUser(result.data);
}

/**
 * Change password (requires current password)
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<boolean> {
    const supabase = getSupabaseServerClient();

    // Get user with password hash
    const userResult = await supabase
        .from<User>('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

    if (!userResult.data) {
        return false;
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, userResult.data.password_hash);
    if (!isValid) {
        throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await supabase
        .from<User>('users')
        .update({
            password_hash: passwordHash,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    return true;
}
