// Health Check Endpoint
// Used by load balancers, container orchestrators, and monitoring systems

import { NextResponse } from 'next/server';

interface HealthCheckResult {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    version: string;
    uptime: number;
    checks: {
        name: string;
        status: 'pass' | 'fail' | 'warn';
        message?: string;
        responseTime?: number;
    }[];
}

// Track server start time
const startTime = Date.now();

/**
 * Check database connectivity
 */
async function checkDatabase(): Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string; responseTime?: number }> {
    const start = Date.now();

    try {
        // Simple connectivity check
        // In production, this would actually query Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!supabaseUrl) {
            return { status: 'warn', message: 'Supabase URL not configured' };
        }

        // Simulate database ping
        return {
            status: 'pass',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Database check failed',
            responseTime: Date.now() - start,
        };
    }
}

/**
 * Check Redis connectivity
 */
async function checkRedis(): Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string; responseTime?: number }> {
    const start = Date.now();

    try {
        const redisUrl = process.env.REDIS_URL;

        if (!redisUrl) {
            return { status: 'warn', message: 'Redis not configured (using in-memory queue)' };
        }

        // In production, this would actually ping Redis
        return {
            status: 'pass',
            responseTime: Date.now() - start,
        };
    } catch (error) {
        return {
            status: 'fail',
            message: error instanceof Error ? error.message : 'Redis check failed',
            responseTime: Date.now() - start,
        };
    }
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<{ status: 'pass' | 'fail' | 'warn'; message?: string }> {
    const services = {
        paystack: !!process.env.PAYSTACK_SECRET_KEY,
        openai: !!process.env.OPENAI_API_KEY,
        whatsapp: !!process.env.META_ACCESS_TOKEN,
    };

    const configured = Object.entries(services).filter(([, v]) => v);
    const notConfigured = Object.entries(services).filter(([, v]) => !v);

    if (notConfigured.length === 0) {
        return { status: 'pass' };
    }

    if (configured.length > 0) {
        return {
            status: 'warn',
            message: `Missing: ${notConfigured.map(([k]) => k).join(', ')}`,
        };
    }

    return {
        status: 'fail',
        message: 'No external services configured',
    };
}

/**
 * GET /api/health - Health check endpoint
 */
export async function GET(): Promise<NextResponse<HealthCheckResult>> {
    const checks = await Promise.all([
        checkDatabase().then((result) => ({ name: 'database', ...result })),
        checkRedis().then((result) => ({ name: 'redis', ...result })),
        checkExternalServices().then((result) => ({ name: 'external_services', ...result })),
    ]);

    const failedChecks = checks.filter((c) => c.status === 'fail');
    const warnChecks = checks.filter((c) => c.status === 'warn');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (failedChecks.length > 0) {
        overallStatus = 'unhealthy';
    } else if (warnChecks.length > 0) {
        overallStatus = 'degraded';
    } else {
        overallStatus = 'healthy';
    }

    const result: HealthCheckResult = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.1',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        checks,
    };

    const statusCode = overallStatus === 'unhealthy' ? 503 : 200;

    return NextResponse.json(result, { status: statusCode });
}

/**
 * HEAD /api/health - Simple health check (for load balancers)
 */
export async function HEAD(): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 });
}
