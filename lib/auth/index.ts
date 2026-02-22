// Authentication Module

// Types
export * from './types';

// JWT utilities
export {
    generateAccessToken,
    generateRefreshToken,
    generateMagicLinkToken,
    generateEmailVerificationToken,
    generatePasswordResetToken,
    verifyAccessToken,
    verifyRefreshToken,
    verifyMagicLinkToken,
    verifyEmailVerificationToken,
    verifyPasswordResetToken,
    decodeToken,
    isTokenExpired,
    getTokenExpiry,
} from './jwt';

// Password utilities
export {
    hashPassword,
    verifyPassword,
    generateSecureToken,
    generateUrlSafeToken,
    generateNumericCode,
} from './password';

// Session management
export {
    createSession,
    refreshSession,
    revokeSession,
    revokeAllSessions,
    revokeOtherSessions,
    getUserSessions,
    getSessionByRefreshToken,
    validateSession,
} from './sessions';

// User management
export {
    createUser,
    loginWithPassword,
    verifyEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
    requestMagicLink,
    loginWithMagicLink,
    getUserById,
    getUserByEmail,
    updateUserProfile,
    changePassword,
} from './users';
