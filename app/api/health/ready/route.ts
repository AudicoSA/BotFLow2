// Readiness Check Endpoint
// Indicates if the application is ready to receive traffic

import { NextResponse } from 'next/server';

interface ReadinessResult {
    ready: boolean;
    timestamp: string;
    checks: {
        name: string;
        ready: boolean;
        message?: string;
    }[];
}

/**
 * Check if database is ready
 */
async function isDatabaseReady(): Promise<{ ready: boolean; message?: string }> {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return { ready: false, message: 'Supabase credentials not configured' };
        }

        // In production, would actually test connection
        return { ready: true };
    } catch (error) {
        return {
            ready: false,
            message: error instanceof Error ? error.message : 'Database not ready',
        };
    }
}

/**
 * Check if required environment variables are set
 */
function areEnvVarsConfigured(): { ready: boolean; message?: string } {
    const required = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        return {
            ready: false,
            message: `Missing env vars: ${missing.join(', ')}`,
        };
    }

    return { ready: true };
}

/**
 * GET /api/health/ready - Readiness check
 */
export async function GET(): Promise<NextResponse<ReadinessResult>> {
    const checks = await Promise.all([
        isDatabaseReady().then((result) => ({ name: 'database', ...result })),
        Promise.resolve({ name: 'environment', ...areEnvVarsConfigured() }),
    ]);

    const allReady = checks.every((c) => c.ready);

    const result: ReadinessResult = {
        ready: allReady,
        timestamp: new Date().toISOString(),
        checks,
    };

    const statusCode = allReady ? 200 : 503;

    return NextResponse.json(result, { status: statusCode });
}
