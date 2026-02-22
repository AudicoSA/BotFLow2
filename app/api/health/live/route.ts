// Liveness Check Endpoint
// Indicates if the application process is running

import { NextResponse } from 'next/server';

interface LivenessResult {
    alive: boolean;
    timestamp: string;
    pid: number;
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
}

/**
 * GET /api/health/live - Liveness check
 * Simple check that the process is running and responsive
 */
export async function GET(): Promise<NextResponse<LivenessResult>> {
    const memUsage = process.memoryUsage();
    const totalMemory = memUsage.heapTotal;
    const usedMemory = memUsage.heapUsed;

    const result: LivenessResult = {
        alive: true,
        timestamp: new Date().toISOString(),
        pid: process.pid,
        memory: {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            percentage: Math.round((usedMemory / totalMemory) * 100),
        },
    };

    return NextResponse.json(result, { status: 200 });
}

/**
 * HEAD /api/health/live - Simple liveness check
 */
export async function HEAD(): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 });
}
