// Environment Configuration
// Centralized environment variable access with type safety and defaults

/**
 * Check if we're running in a browser environment
 */
export const isBrowser = typeof window !== 'undefined';

/**
 * Check if we're running in production
 */
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Check if we're running in development
 */
export const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Check if we're running on Vercel
 */
export const isVercel = !!process.env.VERCEL;

/**
 * Get the current Vercel environment
 */
export const vercelEnv = process.env.VERCEL_ENV as 'production' | 'preview' | 'development' | undefined;

/**
 * Application configuration
 */
export const appConfig = {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'BotFlow',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://botflow.co.za',
    domain: 'botflow.co.za',
} as const;

/**
 * Supabase configuration
 */
export const supabaseConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
} as const;

/**
 * Paystack configuration
 */
export const paystackConfig = {
    secretKey: process.env.PAYSTACK_SECRET_KEY || '',
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
    webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
    plans: {
        aiAssistant: process.env.PAYSTACK_PLAN_AI_ASSISTANT || '',
        whatsappAssistant: process.env.PAYSTACK_PLAN_WHATSAPP_ASSISTANT || '',
        receiptAssistant: process.env.PAYSTACK_PLAN_RECEIPT_ASSISTANT || '',
        bundle: process.env.PAYSTACK_PLAN_BUNDLE || '',
    },
    isTest: (process.env.PAYSTACK_SECRET_KEY || '').startsWith('sk_test'),
} as const;

/**
 * OpenAI configuration
 */
export const openaiConfig = {
    apiKey: process.env.OPENAI_API_KEY || '',
    organizationId: process.env.OPENAI_ORGANIZATION_ID || '',
    defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10),
} as const;

/**
 * WhatsApp/Meta configuration
 */
export const whatsappConfig = {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    accessToken: process.env.META_ACCESS_TOKEN || '',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
} as const;

/**
 * Analytics configuration
 */
export const analyticsConfig = {
    posthog: {
        key: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    },
    sentry: {
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
        authToken: process.env.SENTRY_AUTH_TOKEN || '',
    },
    vercelAnalyticsId: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID || '',
} as const;

/**
 * Email configuration
 */
export const emailConfig = {
    resendApiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@botflow.co.za',
    replyToEmail: process.env.EMAIL_REPLY_TO || 'support@botflow.co.za',
} as const;

/**
 * Google Cloud configuration (for OCR)
 */
export const googleCloudConfig = {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    privateKey: process.env.GOOGLE_CLOUD_PRIVATE_KEY || '',
    clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '',
} as const;

/**
 * JWT configuration
 */
export const jwtConfig = {
    secret: process.env.JWT_SECRET || '',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
} as const;

/**
 * Redis configuration
 */
export const redisConfig = {
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || '',
} as const;

/**
 * Feature flags
 */
export const featureFlags = {
    aiAssistant: process.env.NEXT_PUBLIC_ENABLE_AI_ASSISTANT !== 'false',
    whatsappAssistant: process.env.NEXT_PUBLIC_ENABLE_WHATSAPP_ASSISTANT !== 'false',
    receiptAssistant: process.env.NEXT_PUBLIC_ENABLE_RECEIPT_ASSISTANT !== 'false',
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
} as const;

/**
 * Rate limiting configuration
 */
export const rateLimitConfig = {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
} as const;

/**
 * Validate required environment variables
 * Call this on server startup to ensure all required vars are set
 */
export function validateEnvironment(): { valid: boolean; missing: string[] } {
    const required: [string, string][] = [
        ['NEXT_PUBLIC_SUPABASE_URL', supabaseConfig.url],
        ['NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseConfig.anonKey],
    ];

    // Additional required vars for production
    if (isProduction) {
        required.push(
            ['SUPABASE_SERVICE_ROLE_KEY', supabaseConfig.serviceRoleKey],
            ['PAYSTACK_SECRET_KEY', paystackConfig.secretKey],
            ['OPENAI_API_KEY', openaiConfig.apiKey],
            ['JWT_SECRET', jwtConfig.secret],
        );
    }

    const missing = required
        .filter(([, value]) => !value)
        .map(([name]) => name);

    return {
        valid: missing.length === 0,
        missing,
    };
}

/**
 * Get the current base URL based on environment
 */
export function getBaseUrl(): string {
    if (isBrowser) {
        return window.location.origin;
    }

    // Server-side: check for Vercel deployment
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback to configured URL
    return appConfig.url;
}

/**
 * Get API URL based on environment
 */
export function getApiUrl(path: string = ''): string {
    const base = getBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}/api${normalizedPath}`;
}
