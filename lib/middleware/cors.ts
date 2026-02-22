// CORS Middleware for API Routes
// Handles Cross-Origin Resource Sharing for production and development

import { NextRequest, NextResponse } from 'next/server';

// Production allowed origins
const ALLOWED_ORIGINS = [
    'https://botflow.co.za',
    'https://www.botflow.co.za',
    'https://app.botflow.co.za',
];

// Development origins
const DEV_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
];

// Vercel preview deployment pattern
const VERCEL_PREVIEW_PATTERN = /^https:\/\/.*\.vercel\.app$/;

export interface CorsOptions {
    allowedMethods?: string[];
    allowedHeaders?: string[];
    allowCredentials?: boolean;
    maxAge?: number;
}

const DEFAULT_CORS_OPTIONS: CorsOptions = {
    allowedMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'X-CSRF-Token',
        'X-Requested-With',
        'Accept',
        'Accept-Version',
        'Content-Length',
        'Content-MD5',
        'Content-Type',
        'Date',
        'X-Api-Version',
        'Authorization',
    ],
    allowCredentials: true,
    maxAge: 86400, // 24 hours
};

/**
 * Check if an origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
    if (!origin) return false;

    // Always allow production origins
    if (ALLOWED_ORIGINS.includes(origin)) return true;

    // Allow development origins in non-production
    if (process.env.NODE_ENV !== 'production' && DEV_ORIGINS.includes(origin)) {
        return true;
    }

    // Allow Vercel preview deployments
    if (VERCEL_PREVIEW_PATTERN.test(origin)) return true;

    // Check if origin matches VERCEL_URL (current deployment)
    if (process.env.VERCEL_URL && origin === `https://${process.env.VERCEL_URL}`) {
        return true;
    }

    return false;
}

/**
 * Get the allowed origin for a request
 */
export function getAllowedOrigin(origin: string | null): string {
    if (isOriginAllowed(origin)) {
        return origin || '';
    }

    // Default to production origin
    return 'https://botflow.co.za';
}

/**
 * Create CORS headers for a response
 */
export function createCorsHeaders(
    origin: string | null,
    options: CorsOptions = DEFAULT_CORS_OPTIONS
): Headers {
    const headers = new Headers();
    const allowedOrigin = getAllowedOrigin(origin);

    headers.set('Access-Control-Allow-Origin', allowedOrigin);

    if (options.allowCredentials) {
        headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (options.allowedMethods) {
        headers.set('Access-Control-Allow-Methods', options.allowedMethods.join(', '));
    }

    if (options.allowedHeaders) {
        headers.set('Access-Control-Allow-Headers', options.allowedHeaders.join(', '));
    }

    if (options.maxAge) {
        headers.set('Access-Control-Max-Age', options.maxAge.toString());
    }

    return headers;
}

/**
 * Handle CORS preflight (OPTIONS) request
 */
export function handleCorsPreflightRequest(
    request: NextRequest,
    options: CorsOptions = DEFAULT_CORS_OPTIONS
): NextResponse {
    const origin = request.headers.get('origin');
    const corsHeaders = createCorsHeaders(origin, options);

    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * Add CORS headers to a response
 */
export function addCorsHeaders(
    response: NextResponse,
    origin: string | null,
    options: CorsOptions = DEFAULT_CORS_OPTIONS
): NextResponse {
    const corsHeaders = createCorsHeaders(origin, options);

    corsHeaders.forEach((value, key) => {
        response.headers.set(key, value);
    });

    return response;
}

/**
 * CORS wrapper for API route handlers
 * Use this to wrap your API route handlers with CORS support
 *
 * @example
 * export const GET = withCors(async (request) => {
 *   return NextResponse.json({ data: 'hello' });
 * });
 */
export function withCors(
    handler: (request: NextRequest) => Promise<NextResponse> | NextResponse,
    options: CorsOptions = DEFAULT_CORS_OPTIONS
) {
    return async (request: NextRequest): Promise<NextResponse> => {
        const origin = request.headers.get('origin');

        // Handle preflight request
        if (request.method === 'OPTIONS') {
            return handleCorsPreflightRequest(request, options);
        }

        // Execute the handler
        const response = await handler(request);

        // Add CORS headers to response
        return addCorsHeaders(response, origin, options);
    };
}

/**
 * Validate webhook origin for Paystack and WhatsApp
 * These don't send Origin headers but need IP validation
 */
export function isValidWebhookSource(request: NextRequest, provider: 'paystack' | 'whatsapp'): boolean {
    // Paystack webhook IPs (from their documentation)
    const PAYSTACK_IPS = [
        '52.31.139.75',
        '52.49.173.169',
        '52.214.14.220',
    ];

    // Meta/WhatsApp webhook verification relies on signature, not IP
    // But we can check for known Meta IP ranges if needed

    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const clientIp = forwardedFor?.split(',')[0]?.trim() || realIp || '';

    if (provider === 'paystack') {
        return PAYSTACK_IPS.includes(clientIp);
    }

    // For WhatsApp, we validate the signature in the webhook handler
    return true;
}

/**
 * Get environment-appropriate base URL
 */
export function getBaseUrl(): string {
    // Server-side
    if (typeof window === 'undefined') {
        // Vercel deployment
        if (process.env.VERCEL_URL) {
            return `https://${process.env.VERCEL_URL}`;
        }

        // Custom domain
        if (process.env.NEXT_PUBLIC_APP_URL) {
            return process.env.NEXT_PUBLIC_APP_URL;
        }

        // Development fallback
        return 'http://localhost:3000';
    }

    // Client-side
    return window.location.origin;
}

/**
 * Get webhook callback URL for external services
 */
export function getWebhookUrl(path: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || getBaseUrl();
    return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
}
